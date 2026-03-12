import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY!;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

function deriveKey(salt: Buffer): Buffer {
  if (!MASTER_KEY) {
    throw new Error("ENCRYPTION_MASTER_KEY is not set");
  }
  return scryptSync(MASTER_KEY, salt, KEY_LENGTH);
}

export function encrypt(text: string): string {
  if (!MASTER_KEY) {
    throw new Error("ENCRYPTION_MASTER_KEY is not set");
  }

  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: salt:iv:authTag:ciphertext (all base64)
  return [
    salt.toString("base64"),
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decrypt(ciphertext: string): string {
  if (!MASTER_KEY) {
    throw new Error("ENCRYPTION_MASTER_KEY is not set");
  }

  const parts = ciphertext.split(":");
  if (parts.length !== 4) {
    throw new Error("Decryption failed — invalid ciphertext format");
  }

  const [saltB64, ivB64, authTagB64, encryptedB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");

  const key = deriveKey(salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
