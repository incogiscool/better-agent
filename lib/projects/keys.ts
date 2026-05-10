import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_SALT_LENGTH = 16;
const KEY_HASH_LENGTH = 64;

function base64Url(bytes: Buffer) {
  return bytes
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function generateProjectKey(prefix: "ba_client" | "ba_secret") {
  return `${prefix}_${base64Url(randomBytes(24))}`;
}

export function hashProjectSecret(secretKey: string) {
  const salt = randomBytes(KEY_SALT_LENGTH);
  const hash = scryptSync(secretKey, salt, KEY_HASH_LENGTH);

  return `${salt.toString("hex")}:${Buffer.from(hash).toString("hex")}`;
}

export function verifyProjectSecret(secretKey: string, storedHash: string) {
  const [saltHex, hashHex] = storedHash.split(":");

  if (!saltHex || !hashHex) {
    return false;
  }

  const expectedHash = Buffer.from(hashHex, "hex");
  const candidateHash = scryptSync(
    secretKey,
    Buffer.from(saltHex, "hex"),
    expectedHash.length,
  );

  return timingSafeEqual(expectedHash, candidateHash);
}

export function generateProjectCredentials() {
  const clientKey = generateProjectKey("ba_client");
  const secretKey = generateProjectKey("ba_secret");

  return {
    clientKey,
    secretKey,
    secretKeyHash: hashProjectSecret(secretKey),
  };
}
