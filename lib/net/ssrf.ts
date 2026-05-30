import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

/**
 * SSRF guard for outbound requests to customer-controlled URLs.
 *
 * Project `baseUrl` is attacker-controllable (any signup can set it), and the
 * chat engine fetches it server-side and returns the body into the
 * conversation. Without this guard a malicious project could point baseUrl at
 * cloud metadata endpoints or internal services and exfiltrate the response.
 *
 * In production we reject non-http(s) schemes and any host that resolves to a
 * private / loopback / link-local address. Outside production we allow private
 * hosts (so developers can target localhost backends) but still reject
 * non-http(s) schemes.
 */

const IS_PRODUCTION =
  process.env.VERCEL_ENV === "production" ||
  (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
]);

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    value = value * 256 + n;
  }
  return value >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return false;
  const inRange = (cidrBase: string, bits: number) => {
    const base = ipv4ToInt(cidrBase)!;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (n & mask) === (base & mask);
  };
  return (
    inRange("0.0.0.0", 8) || // "this network"
    inRange("10.0.0.0", 8) ||
    inRange("100.64.0.0", 10) || // CGNAT
    inRange("127.0.0.0", 8) || // loopback
    inRange("169.254.0.0", 16) || // link-local (incl. cloud metadata)
    inRange("172.16.0.0", 12) ||
    inRange("192.168.0.0", 16)
  );
}

function isPrivateIPv6(ip: string): boolean {
  const addr = ip.toLowerCase().split("%")[0];
  if (addr === "::1" || addr === "::") return true;
  if (addr.startsWith("fe80")) return true; // link-local
  if (addr.startsWith("fc") || addr.startsWith("fd")) return true; // unique local
  // IPv4-mapped IPv6 (e.g. ::ffff:169.254.169.254)
  const mapped = addr.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

function isBlockedAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return false;
}

/**
 * Async, DNS-resolving guard. Throws `UnsafeUrlError` if the URL is unsafe.
 * This is the authoritative check — call it immediately before fetching.
 */
export async function assertSafeOutboundUrl(rawUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError(`unsupported protocol: ${url.protocol}`);
  }

  const host = url.hostname.toLowerCase();

  if (!IS_PRODUCTION) return; // dev: allow localhost / private backends

  if (BLOCKED_HOSTNAMES.has(host)) {
    throw new UnsafeUrlError(`host not allowed: ${host}`);
  }

  let addresses: string[];
  if (isIP(host)) {
    addresses = [host];
  } else {
    try {
      const resolved = await lookup(host, { all: true });
      addresses = resolved.map((r) => r.address);
    } catch {
      throw new UnsafeUrlError(`could not resolve host: ${host}`);
    }
  }

  for (const addr of addresses) {
    if (isBlockedAddress(addr)) {
      throw new UnsafeUrlError("URL resolves to a private or reserved address");
    }
  }
}

/**
 * Sync, best-effort check for fast save-time feedback (no DNS resolution).
 * Returns an error message for obviously-unsafe URLs, else null.
 */
export function checkOutboundUrlSync(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "must be a valid URL";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "must use http or https";
  }
  if (!IS_PRODUCTION) return null;
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(host)) return "points to a blocked host";
  if (isIP(host) && isBlockedAddress(host)) {
    return "points to a private or reserved address";
  }
  return null;
}
