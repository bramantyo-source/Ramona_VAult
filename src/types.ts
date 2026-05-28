/**
 * Types & Schema definitions for Private Secure Vault
 */

export interface VaultMetadata {
  isConfigured: boolean;
  salt: string;
  pinHash: string; // SHA-256 (PIN + Salt) for fast local verification of login state
  totpSecretEncrypted: string; // The TOTP auth secret encrypted with PIN key
  totpConfigured: boolean;
}

export interface EncryptedVaultPayload {
  notes: string;       // Encrypted JSON of NoteItem[]
  sshKeys: string;     // Encrypted JSON of SshKeyItem[]
  totpSecrets: string; // Encrypted JSON of TotpItem[]
  barcodes: string;    // Encrypted JSON of BarcodeItem[]
  documents: string;   // Encrypted JSON of DocItem[]
  passwords: string;   // Encrypted JSON of PasswordItem[]
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface SshKeyItem {
  id: string;
  name: string;
  privateKey: string;
  publicKey: string;
  keyType: "RSA" | "ECDSA" | "Ed25519";
  comment: string;
}

export interface TotpItem {
  id: string;
  issuer: string;
  account: string;
  secret: string; // encrypted secret seed
  createdAt: string;
}

export interface BarcodeItem {
  id: string;
  cardName: string;
  barcodeValue: string;
  format: "CODE128" | "CODE39" | "EAN13" | "QRCODE";
  brandColor: string;
  notes?: string;
}

export interface DocItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string; // Encrypted base64 data string
  description?: string;
  uploadedAt: string;
}

export interface PasswordItem {
  id: string;
  title: string;
  website?: string;
  username: string;
  passwordEncrypted: string; // Wait, actually the whole object is in an encrypted block, but we can store it cleanly
  passwordText: string;      // Unencrypted in memory inside decrypted context
  notes?: string;
  category: "Sosial" | "Keuangan" | "Server" | "Kerja" | "Lainnya";
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "BRUTE_FORCE_ATTEMPT" | "COOLDOWN_ACTIVATED" | "DATA_DECRYPTED" | "DATA_ENCRYPT_SUCCESS" | "DECRYPTION_ERROR";
  ipSource: string;
  details: string;
  severity: "low" | "medium" | "high";
}

export interface BruteForceState {
  failedAttempts: number;
  cooldownUntil: number | null; // epoch timestamp
}
