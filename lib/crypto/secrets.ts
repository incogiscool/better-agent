import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

/**
 * AES-256-GCM helpers for encrypting customer secrets at rest (e.g. BYOK
 * Anthropic API keys). The encryption key comes from KEY_ENCRYPTION_SECRET,
 * expected to be the base64 encoding of exactly 32 random bytes
 * (`openssl rand -base64 32`).
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM standard nonce size
const KEY_LENGTH = 32; // 256-bit key

function loadKey(): Buffer {
  const raw = process.env.KEY_ENCRYPTION_SECRET;
  if (!raw) {
    throw new Error(
      "KEY_ENCRYPTION_SECRET is not set. Generate one with `openssl rand -base64 32`.",
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `KEY_ENCRYPTION_SECRET must be base64 of ${KEY_LENGTH} bytes (got ${key.length}). Generate one with \`openssl rand -base64 32\`.`,
    );
  }
  return key;
}

/**
 * Encrypt a plaintext secret. Returns `base64(iv).base64(authTag).base64(ciphertext)`.
 */
export function encryptSecret(plaintext: string): string {
  const key = loadKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");
}

/**
 * Decrypt a value produced by {@link encryptSecret}. Throws if the blob is
 * malformed or fails GCM authentication (tampered / wrong key).
 */
export function decryptSecret(packed: string): string {
  const parts = packed.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed encrypted secret.");
  }
  const [ivB64, tagB64, dataB64] = parts;
  const key = loadKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/**
 * Build a safe display hint for an Anthropic key, e.g. `sk-ant-…ab12`. Never
 * reveals enough to be usable.
 */
export function maskAnthropicKey(key: string): string {
  const last4 = key.slice(-4);
  return `sk-ant-…${last4}`;
}
