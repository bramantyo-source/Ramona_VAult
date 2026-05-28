# 🛡️ Ramona Vault

A private, client-side secure vault application designed with end-to-end encryption (E2EE) and multi-factor authentication, built as an academic project for **TI222 - Mobile Application Security (Keamanan Aplikasi Mobile)**.

## 🚀 Key Features

* **Zero-Knowledge Architecture:** Decryption happens exclusively in-memory (RAM Sandbox), ensuring data is never exposed.
* **Modern Cryptography:** Secures stored items using **AES-256-GCM** authenticated symmetric encryption.
* **Strong Key Derivation:** Master key derived from user PIN using **PBKDF2** (100,000 iterations and random salt).
* **Two-Factor Authentication (2FA):** Dual-stage verification integrating a 6-digit Master PIN and a dynamic TOTP OTP token (fully compatible with Google Authenticator, Authy, or Aegis).
* **Anti-Brute Force Protection:** Strict security policy enforcing temporary lockout cooling timers after **3 consecutive failed attempts**.
* **Offline-First Storage:** Hybrid local database isolation protecting credentials against network eavesdropping (MITM) and sniffing threats.

---

## 🛠️ Tech Stack & Requirements

* **Core:** React, TypeScript, TailwindCSS
* **Build System:** Vite
* **Mobile Shell:** CapacitorJS (Android integration ready)

---

## 📦 Getting Started

### 1. Installation
Install dependencies in the project root:
```bash
npm install
```

### 2. Development Run
Start the local development server:
```bash
npm run dev
```

### 3. Sync Mobile Assets
Build the web production assets and synchronize them to the Android Capacitor project:
```bash
npm run build
npx cap sync
```

---

## 📄 License
This project is licensed under the permissive **MIT License** - see the [LICENSE](./LICENSE) file for details.
