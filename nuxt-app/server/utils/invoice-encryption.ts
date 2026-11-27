import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { Buffer } from "node:buffer";

const MAGIC = Buffer.from("CVSE");
const FORMAT_VERSION = 1;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const HEADER_LENGTH = MAGIC.length + 1 + IV_LENGTH + AUTH_TAG_LENGTH;

export function encrypt(
  plaintext: Uint8Array,
  keyHex: string,
  associatedData: string,
): Buffer {
  const key = parseKey(keyHex);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  cipher.setAAD(Buffer.from(associatedData, "utf8"));

  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);
  const header = Buffer.concat([
    MAGIC,
    Buffer.from([FORMAT_VERSION]),
    iv,
    cipher.getAuthTag(),
  ]);

  return Buffer.concat([header, ciphertext]);
}

export function decrypt(
  encryptedObject: Uint8Array,
  keyHex: string,
  associatedData: string,
): Buffer {
  const key = parseKey(keyHex);
  const objectBytes = Buffer.from(encryptedObject);
  if (objectBytes.length < HEADER_LENGTH) {
    throw new Error("Encrypted invoice object has a truncated header.");
  }

  if (!objectBytes.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error("Encrypted invoice object has an invalid format.");
  }

  const version = objectBytes[MAGIC.length];
  if (version !== FORMAT_VERSION) {
    throw new Error(`Unsupported invoice encryption version: ${version}.`);
  }

  const ivStart = MAGIC.length + 1;
  const tagStart = ivStart + IV_LENGTH;
  const ciphertextStart = tagStart + AUTH_TAG_LENGTH;
  const iv = objectBytes.subarray(ivStart, tagStart);
  const authTag = objectBytes.subarray(tagStart, ciphertextStart);
  const ciphertext = objectBytes.subarray(ciphertextStart);

  const decipher = createDecipheriv("aes-256-gcm", key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAAD(Buffer.from(associatedData, "utf8"));
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function parseKey(keyHex: string): Buffer {
  if (!/^[\da-f]{64}$/i.test(keyHex)) {
    throw new TypeError(
      "FILE_ENCRYPTION_KEY must be a 64-character hexadecimal key.",
    );
  }

  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new TypeError("FILE_ENCRYPTION_KEY must decode to 32 bytes.");
  }

  return key;
}
