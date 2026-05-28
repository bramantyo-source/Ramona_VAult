/**
 * Cryptographic & Security Utilities for Private Secure Vault
 * Implementation of E2EE (AES-GCM), Key Derivation (PBKDF2), Hash (SHA-256),
 * Base32 Decoding, and Native Web Crypto TOTP (HMAC-SHA-1).
 */

// 1. PIN & Key Derivation (PBKDF2)
export async function deriveKey(pin: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinBytes = encoder.encode(pin);
  const saltBytes = encoder.encode(salt);

  // Import PIN as raw key material
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    pinBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Derive AESGCM 256 key
  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // key is non-exportable for privacy
    ["encrypt", "decrypt"]
  );
}

// 2. Encryption (AES-GCM)
export async function encryptData(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(plaintext);

  // Initialization Vector (IV) - must be unique for each encryption
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    dataBytes
  );

  // Combine IV and Ciphertext to single Base64 string
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return arrayBufferToBase64(combined);
}

// 3. Decryption (AES-GCM)
export async function decryptData(ciphertextBase64: string, key: CryptoKey): Promise<string> {
  const combined = base64ToArrayBuffer(ciphertextBase64);

  if (combined.byteLength < 13) {
    throw new Error("Ciphertext invalid or truncated.");
  }

  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Helper Helpers
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const binaryBytes = new Uint8Array(buffer);
  let binaryString = "";
  for (let i = 0; i < binaryBytes.byteLength; i++) {
    binaryString += String.fromCharCode(binaryBytes[i]);
  }
  return btoa(binaryString);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// 4. Strong Password-Hashing (SHA-256 with Salt)
export async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// 5. Base32 Decoder for TOTP Secret
export function decodeBase32(base32: string): Uint8Array {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const str = base32.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");

  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < str.length; i++) {
    const idx = base32chars.indexOf(str.charAt(i));
    if (idx === -1) {
      throw new Error(`Invalid Character in Base32: ${str.charAt(i)}`);
    }

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

// Helper to generate a secure random Base32 string (for new TOTP seeds)
export function generateRandomBase32(length: number = 16): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(values[i] % 32);
  }
  return result;
}

// 6. Native TOTP Generator (OTP Compatible)
export async function generateTOTP(secretBase32: string, timeStep: number = 30): Promise<{ code: string; timeLeft: number }> {
  try {
    const keyBytes = decodeBase32(secretBase32);
    const epoch = Math.floor(Date.now() / 1000);
    const counterValue = Math.floor(epoch / timeStep);
    const timeLeft = timeStep - (epoch % timeStep);

    // Convert counter value to 8-byte buffer
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(4, counterValue, false); // big endian

    // Import key for HMAC-SHA1
    const hmacKey = await window.crypto.subtle.importKey(
      "raw",
      keyBytes,
      {
        name: "HMAC",
        hash: { name: "SHA-1" },
      },
      false,
      ["sign"]
    );

    // Dynamic signature signing (HMAC-SHA1)
    const signature = await window.crypto.subtle.sign(
      "HMAC",
      hmacKey,
      counterBuffer
    );

    const sigBytes = new Uint8Array(signature);

    // Dynamic truncation
    const offset = sigBytes[sigBytes.length - 1] & 0x0f;
    const binary =
      ((sigBytes[offset] & 0x7f) << 24) |
      ((sigBytes[offset + 1] & 0xff) << 16) |
      ((sigBytes[offset + 2] & 0xff) << 8) |
      (sigBytes[offset + 3] & 0xff);

    const otp = binary % 1000000;
    const code = otp.toString().padStart(6, "0");

    return { code, timeLeft };
  } catch (err) {
    console.error("Failed to generate TOTP code", err);
    return { code: "000000", timeLeft: 30 };
  }
}

// Generates simulated obfuscated code for defensive compliance display
export function obfuscateCodeSimulator(rawCode: string): string {
  const lines = rawCode.split("\n");
  const obfuscatedLines = lines.map(line => {
    // If empty or import, keep mostly standard
    if (line.trim().startsWith("import") || line.trim() === "") return line;

    // Random string obfuscation logic for presentation
    return "/*_0x8f7c*/ " + line
      .replace(/deriveKey/g, "_0x4e2d")
      .replace(/AES-GCM/g, "0x_AESGCM_E2EE")
      .replace(/SubtleCrypto/g, "_0xf8a1")
      .replace(/window\.crypto/g, "_0xbc02_crypto")
      .replace(/decryptData/g, "_0x9aa2")
      .replace(/encryptData/g, "_0xd2ee");
  });
  return obfuscatedLines.join("\n");
}