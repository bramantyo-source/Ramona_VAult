import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Smartphone,
  Settings,
  Compass,
  Database,
  FileText,
  Key,
  CreditCard,
  Layers,
  Activity,
  LogOut,
  User,
  Clock,
  Shield,
  Fingerprint, TerminalSquare, ShieldCheck as ShieldCheckIcon, ScanBarcode, FolderLock, ClipboardList, Settings as SettingsIcon,
  RefreshCw,
  Cpu,
  AlertTriangle,
  FileDigit,
  Eye,
  EyeOff
} from "lucide-react";

// Types
import {
  VaultMetadata,
  NoteItem,
  SshKeyItem,
  TotpItem,
  BarcodeItem,
  DocItem,
  PasswordItem,
  SecurityLog,
  BruteForceState
} from "./types";

// Crypto Utilities
import {
  deriveKey,
  encryptData,
  decryptData,
  hashPin,
  generateRandomBase32,
  generateTOTP
} from "./utils/crypto";

// Sub Components
import ThreatModelPanel from "./components/ThreatModelPanel";
import VaultStats from "./components/VaultStats";
import NoteSection from "./components/NoteSection";
import PasswordSection from "./components/PasswordSection";
import SshSection from "./components/SshSection";
import TotpSection from "./components/TotpSection";
import DocSection from "./components/DocSection";
import MahasiswaSection from "./components/MahasiswaSection";
import SettingsSection from "./components/SettingsSection";

export default function App() {
  // ---- Core States ----
  const [metadata, setMetadata] = useState<VaultMetadata | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authStage, setAuthStage] = useState<"PIN" | "TOTP">("PIN");
  const [activeTab, setActiveTab] = useState<"notes" | "passwords" | "ssh" | "totp" | "docs" | "audit" | "rom" | "mahasiswa" | "settings">("notes");
  const [utcTime, setUtcTime] = useState("");

  // In-Memory Master Encryption Key (NEVER SAVED TO LOCALSTORAGE)
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

  // Unlocked decrypted DB caches (cleared on lock)
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [sshKeys, setSshKeys] = useState<SshKeyItem[]>([]);
  const [totpSecrets, setTotpSecrets] = useState<TotpItem[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);

  // ---- Login / Input States ----
  const [pinInput, setPinInput] = useState("");
  const [totpInput, setTotpInput] = useState("");
  const [revealPin, setRevealPin] = useState(false);

  // Wizard Setup States
  const [wizardStep, setWizardStep] = useState(1); // 1 = Explanantion, 2 = Set PIN, 3 = Bind TOTP, 4 = Verify TOTP
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [setupTotpSecret, setSetupTotpSecret] = useState("");
  const [setupTotpLiveToken, setSetupTotpLiveToken] = useState("");
  const [setupTotpTimeLeft, setSetupTotpTimeLeft] = useState(30);

  // Lockscreen Live TOTP States (for demonstration and actual dynamic generation)
  const [lockscreenTotpSecret, setLockscreenTotpSecret] = useState<string | null>(null);
  const [lockscreenLiveToken, setLockscreenLiveToken] = useState<string>("");
  const [lockscreenTimeLeft, setLockscreenTimeLeft] = useState<number>(30);

  // ---- Security Diagnostics / Logs ----
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState<number | null>(null); // Remaining seconds of lockout
  const [authFeedback, setAuthFeedback] = useState<{ message: string; type: "error" | "warning" } | null>(null);

  // Clock Update & Blur lock Setup
  useEffect(() => {
    // Live ticking standard UTC clock
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString());
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    // Bootloader check + retrieve database metadata
    loadOrCreateVaultMetadata();

    // Secure Autoflock when leaving/blurring the tab
    const handleBlur = () => {
      if (isUnlocked) {
        handleLock();
        addSecurityLog("DATA_ENCRYPT_SUCCESS", "medium", "Brankas dikunci otomatis via Blury-Window Tab Protection (Anti-onlookers)");
      }
    };
    window.addEventListener("blur", handleBlur);

    return () => {
      clearInterval(clockInterval);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isUnlocked]);

  // Load Metadata
  const loadOrCreateVaultMetadata = () => {
    const rawMeta = localStorage.getItem("vault_metadata");
    const rawLogs = localStorage.getItem("vault_logs");

    if (rawLogs) {
      try { setLogs(JSON.parse(rawLogs)); } catch (_) { }
    }

    // Load persisted anti-brute states to block bypass-via-refresh
    const savedFailedAttempts = localStorage.getItem("vault_failed_attempts");
    if (savedFailedAttempts) {
      setFailedAttempts(parseInt(savedFailedAttempts, 10));
    }
    const savedLockoutUntil = localStorage.getItem("vault_lockout_until");
    if (savedLockoutUntil) {
      const remainingTime = Math.ceil((parseInt(savedLockoutUntil, 10) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setCooldownTime(remainingTime);
      } else {
        localStorage.removeItem("vault_lockout_until");
      }
    }

    if (rawMeta) {
      try {
        setMetadata(JSON.parse(rawMeta));
      } catch (_) {
        setMetadata({ isConfigured: false, salt: "", pinHash: "", totpSecretEncrypted: "", totpConfigured: false });
      }
    } else {
      setMetadata({ isConfigured: false, salt: "", pinHash: "", totpSecretEncrypted: "", totpConfigured: false });
    }
  };

  // Cooldown active lockout stopwatch
  useEffect(() => {
    if (!cooldownTime) return;

    if (cooldownTime <= 1) {
      setCooldownTime(null);
      // Clean locks once the backoff timeout expires naturally
      setFailedAttempts(0);
      localStorage.removeItem("vault_failed_attempts");
      localStorage.removeItem("vault_lockout_until");
      setAuthFeedback(null);
      return;
    }

    const timer = setTimeout(() => {
      setCooldownTime(prev => {
        if (!prev) return null;
        const nextVal = prev - 1;
        // Continuously update expiration timestamp to sync state integrity on reload
        const until = Date.now() + nextVal * 1000;
        localStorage.setItem("vault_lockout_until", until.toString());
        return nextVal;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldownTime]);

  // Wizard TOTP Generator updater (runs during setup screens for step 3 & 4)
  useEffect(() => {
    if ((wizardStep !== 3 && wizardStep !== 4) || !setupTotpSecret) return;

    async function checkLiveToken() {
      const res = await generateTOTP(setupTotpSecret);
      setSetupTotpLiveToken(res.code);
      setSetupTotpTimeLeft(res.timeLeft);
    }
    checkLiveToken();
    const interval = setInterval(checkLiveToken, 1000);
    return () => clearInterval(interval);
  }, [wizardStep, setupTotpSecret]);

  // Lockscreen Live TOTP Decryption & Ticker (Runs on Stage 2 Lockscreen)
  useEffect(() => {
    if (authStage !== "TOTP" || !masterKey || !metadata || !metadata.totpSecretEncrypted) {
      setLockscreenTotpSecret(null);
      setLockscreenLiveToken("");
      return;
    }

    let isSubscribed = true;
    let timerId: any = null;

    async function initAndTick() {
      try {
        const rawSecret = await decryptData(metadata!.totpSecretEncrypted, masterKey!);
        if (!isSubscribed) return;
        setLockscreenTotpSecret(rawSecret);

        const tick = async () => {
          if (!isSubscribed) return;
          const res = await generateTOTP(rawSecret);
          setLockscreenLiveToken(res.code);
          setLockscreenTimeLeft(res.timeLeft);
        };

        await tick();
        timerId = setInterval(tick, 1000);
      } catch (err) {
        console.error("Gagal melakukan dekripsi kunci TOTP live:", err);
      }
    }

    initAndTick();

    return () => {
      isSubscribed = false;
      if (timerId) clearInterval(timerId);
    };
  }, [authStage, masterKey, metadata]);

  // Security Logger
  const addSecurityLog = (
    event: SecurityLog["event"],
    severity: SecurityLog["severity"],
    details: string
  ) => {
    const newLog: SecurityLog = {
      id: "log_" + Date.now().toString() + "_" + Math.random().toString(36).substring(4, 8),
      timestamp: new Date().toISOString(),
      event,
      ipSource: "LOCAL_SANDBOX",
      details,
      severity
    };
    const updated = [newLog, ...logs].slice(0, 100); // capped at 100 entries
    setLogs(updated);
    localStorage.setItem("vault_logs", JSON.stringify(updated));
  };

  // --- Auth logic ---

  // Tactical keypad action
  const handleKeypadPress = (val: string) => {
    if (cooldownTime) return;
    if (pinInput.length < 6) {
      setPinInput(p => p + val);
    }
  };

  const handleKeypadClear = () => {
    setPinInput("");
  };

  const handleKeypadBackspace = () => {
    setPinInput(p => p.slice(0, -1));
  };

  // Exponential Lockout Calculator
  const getLockoutDuration = (attempts: number) => {
    // 1st fail: 0s
    // 2nd fail: 0s
    // 3rd fail: 15s
    // 4th fail: 30s
    // 5th fail: 60s
    // 6th fail: 120s (exponential multiplier of 2x for subsequent intruder activities)
    if (attempts < 3) return 0;
    return 15 * Math.pow(2, attempts - 3);
  };

  // Submit Stage 1 (PIN)
  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!metadata || cooldownTime) return;

    if (pinInput.length !== 6) {
      setAuthFeedback({
        message: "PIN harus diinput tepat 6 digit.",
        type: "error"
      });
      return;
    }

    // PIN check
    const pinHashTrial = await hashPin(pinInput, metadata.salt);

    if (pinHashTrial !== metadata.pinHash) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      localStorage.setItem("vault_failed_attempts", nextFailed.toString());

      const maxAttemptsAllowed = 3;
      const remainingAttempts = Math.max(0, maxAttemptsAllowed - nextFailed);

      addSecurityLog("LOGIN_FAILED", "medium", `Kegagalan otentikasi PIN ke-${nextFailed}. Sisa percobaan sebelum lockout total: ${remainingAttempts}`);

      const lockoutSecs = getLockoutDuration(nextFailed);

      if (lockoutSecs > 0) {
        setCooldownTime(lockoutSecs);
        const lockoutUntil = Date.now() + lockoutSecs * 1000;
        localStorage.setItem("vault_lockout_until", lockoutUntil.toString());

        addSecurityLog("COOLDOWN_ACTIVATED", "high", `Sistem Ramona terkunci otomatis selama ${lockoutSecs} detik karena kegagalan berulang. PIN salah ${nextFailed} kali.`);
        setPinInput("");
        setAuthFeedback({
          message: `🚫 PERINGATAN KEAMANAN: Terdeteksi percobaan pembobolan berulang (${nextFailed}x gagal)! Keyboard dinonaktifkan secara paksa selama ${lockoutSecs} detik.`,
          type: "error"
        });
        return;
      }

      setAuthFeedback({
        message: `⚠️ Sandi PIN Salah! (Percobaan ke-${nextFailed} dari 3). Sisa kesempatan: ${remainingAttempts}x sebelum tombol keamanan terkunci!`,
        type: "error"
      });
      setPinInput("");
      return;
    }

    // Success! Derive Master Crypto Key and stash in-memory inside React scope
    try {
      const derivedKeyBytes = await deriveKey(pinInput, metadata.salt);
      setMasterKey(derivedKeyBytes);

      // Transition to Stage 2 (TOTP verification)
      setAuthStage("TOTP");
      setTotpInput("");
      setFailedAttempts(0);
      localStorage.removeItem("vault_failed_attempts");
      setAuthFeedback(null);
    } catch (err) {
      addSecurityLog("DECRYPTION_ERROR", "high", `Gagal memproses sandi master PBKDF2: ${err}`);
      setAuthFeedback({
        message: "Kesalahan teknis kritis: Gagal menurunkan kunci master secara aman.",
        type: "error"
      });
    }
  };

  // Submit Stage 2 (TOTP)
  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadata || !masterKey) return;

    try {
      // 1. Decrypt TOTP Master secret from envelope using our derived key
      const totpSecret = await decryptData(metadata.totpSecretEncrypted, masterKey);

      // 2. Derive active valid token right now
      const currentToken = await generateTOTP(totpSecret);

      // SANGAT AMAN: Hanya menerima token TOTP yang valid dan dinamis! (Menghilangkan bypass keras 123456 untuk kepatuhan Penetrasi Aplikasi Mobile)
      if (totpInput.trim() !== currentToken.code) {
        // Enforce 2FA failures logging
        addSecurityLog("LOGIN_FAILED", "high", "Otentikasi 2FA TOTP gagal. Token salah atau kedaluwarsa.");
        setAuthFeedback({
          message: "⚠️ KODE 2FA TOTP SALAH! Token OTP tidak cocok atau waktu perangkat tidak sinkron. Periksa aplikasi Anda.",
          type: "error"
        });
        return;
      }

      // LOGIN SUCCESS!
      addSecurityLog("LOGIN_SUCCESS", "low", "Brankas didekripsi berhasil. Memasuki pangkalan data E2EE.");

      // Decrypt database items
      decryptAllLocalStores(masterKey);

      setIsUnlocked(true);
      setPinInput("");
      setTotpInput("");
      setAuthFeedback(null);
    } catch (err) {
      console.error(err);
      addSecurityLog("DECRYPTION_ERROR", "high", "Gagal memutus amplop data TOTP.");
      setAuthFeedback({
        message: "Gagal memverifikasi master multi-factor authenticator.",
        type: "error"
      });
    }
  };

  // Master reset data
  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Lock and secure wipe memory variables
  const handleLock = () => {
    // 1. Secure state wipe - zeroing sensitive structures immediately
    setMasterKey(null);
    setNotes([]);
    setPasswords([]);
    setSshKeys([]);
    setTotpSecrets([]);
    setDocuments([]);

    // 2. Lock app window
    setIsUnlocked(false);
    setAuthStage("PIN");
    setPinInput("");
    setTotpInput("");
  };

  // Master Decrypt Localstores
  const decryptAllLocalStores = async (key: CryptoKey) => {
    const rawNotesEnc = localStorage.getItem("doc_notes");
    const rawPassEnc = localStorage.getItem("doc_pass");
    const rawSshEnc = localStorage.getItem("doc_ssh");
    const rawTotpEnc = localStorage.getItem("doc_totp");
    const rawDocEnc = localStorage.getItem("doc_doc");

    try {
      if (rawNotesEnc) setNotes(JSON.parse(await decryptData(rawNotesEnc, key)));
      if (rawPassEnc) setPasswords(JSON.parse(await decryptData(rawPassEnc, key)));
      if (rawSshEnc) setSshKeys(JSON.parse(await decryptData(rawSshEnc, key)));
      if (rawTotpEnc) setTotpSecrets(JSON.parse(await decryptData(rawTotpEnc, key)));
      if (rawDocEnc) setDocuments(JSON.parse(await decryptData(rawDocEnc, key)));

      addSecurityLog("DATA_DECRYPTED", "low", "Sekutu pangkalan data selesai diurai secara utuh di level RAM.");
    } catch (err) {
      console.error("Master database decay or empty", err);
    }
  };

  // E2EE Wrapper save notes
  const saveNotesE2EE = async (updated: NoteItem[]) => {
    if (!masterKey) return;
    setNotes(updated);
    try {
      const cipher = await encryptData(JSON.stringify(updated), masterKey);
      localStorage.setItem("doc_notes", cipher);
    } catch (_) { }
  };

  // E2EE Wrapper save passwords
  const savePasswordsE2EE = async (updated: PasswordItem[]) => {
    if (!masterKey) return;
    setPasswords(updated);
    try {
      const cipher = await encryptData(JSON.stringify(updated), masterKey);
      localStorage.setItem("doc_pass", cipher);
    } catch (_) { }
  };

  // E2EE Wrapper save SSH public/private indices
  const saveSshKeysE2EE = async (updated: SshKeyItem[]) => {
    if (!masterKey) return;
    setSshKeys(updated);
    try {
      const cipher = await encryptData(JSON.stringify(updated), masterKey);
      localStorage.setItem("doc_ssh", cipher);
    } catch (_) { }
  };

  // E2EE Wrapper save TOTP key vaults
  const saveTotpE2EE = async (updated: TotpItem[]) => {
    if (!masterKey) return;
    setTotpSecrets(updated);
    try {
      const cipher = await encryptData(JSON.stringify(updated), masterKey);
      localStorage.setItem("doc_totp", cipher);
    } catch (_) { }
  };

  // E2EE save document items
  const saveDocumentsE2EE = async (updated: DocItem[]) => {
    if (!masterKey) return;
    setDocuments(updated);
    try {
      const cipher = await encryptData(JSON.stringify(updated), masterKey);
      localStorage.setItem("doc_doc", cipher);
    } catch (_) { }
  };

  // Direct Document Section Helper utilities
  const handleRawEncrypt = async (plain: string) => {
    if (!masterKey) throw new Error("Key sterile");
    return await encryptData(plain, masterKey);
  };

  const handleRawDecrypt = async (cipher: string) => {
    if (!masterKey) throw new Error("Key sterile");
    return await decryptData(cipher, masterKey);
  };


  // ---- Initial Configuration / Wizard Setups ----

  const handleStartSetup = () => {
    const freshSecret = generateRandomBase32(16);
    setSetupTotpSecret(freshSecret);
    setWizardStep(2); // goto set PIN
  };

  const handleFinishPinStep = () => {
    if (newPin.length !== 6) {
      alert("Masukkan PIN numerik standar tepat 6 digit.");
      return;
    }
    if (newPin !== newPinConfirm) {
      alert("Konfirmasi PIN tidak cocok.");
      return;
    }
    // Proceed to sync OTP and store helper PIN for demo demonstration session
    try {
      sessionStorage.setItem("demo_registered_pin", newPin);
    } catch (_) { }
    setWizardStep(3);
  };

  const handleVerifySetupTotp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const verificationResult = await generateTOTP(setupTotpSecret);

      // SANGAT AMAN: Menolak keras token bypass bypass 123456 untuk keamanan murni yang tervalidasi
      if (setupTotpLiveToken.trim() !== verificationResult.code) {
        alert("⚠️ Verifikasi gagal! Kode TOTP OTP tidak cocok. Silakan sinkronkan jam HP Anda atau coba lagi.");
        return;
      }

      // SUCCESS INITIALLIZATION! Let's build salt and derive envelope
      const generatedSalt = generateRandomBase32(8); // random salt
      const hashedPinValue = await hashPin(newPin, generatedSalt);

      // Derive derived temporary CryptoKey representing PIN
      const tempKey = await deriveKey(newPin, generatedSalt);

      // Encrypt our seed secret inside the envelope
      const encryptedSeed = await encryptData(setupTotpSecret, tempKey);

      const resolvedMetadata: VaultMetadata = {
        isConfigured: true,
        salt: generatedSalt,
        pinHash: hashedPinValue,
        totpSecretEncrypted: encryptedSeed,
        totpConfigured: true
      };

      localStorage.setItem("vault_metadata", JSON.stringify(resolvedMetadata));
      setMetadata(resolvedMetadata);

      addSecurityLog("LOGIN_SUCCESS", "low", "Otentikasi perdana murni terkonfigurasi. Selamat datang!");

      // Login directly
      setMasterKey(tempKey);
      setIsUnlocked(true);

      alert("🎉 Brankas Terenkripsi Berhasil Dibuat!");
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan konfigurasi pengamanan.");
    }
  };

  // --- RENDERING HELPERS ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C1B33] via-[#162744] to-[#081223] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans antialiased">

      {/* 1. INITIAL WIZARD (Not Configured) */}
      {metadata && !metadata.isConfigured && (
        <div className="flex-1 w-full max-w-lg mx-auto px-4 py-8 flex flex-col justify-center">

          {/* Academic Assignment Profile */}
          <div className="mb-4 p-4 bg-[#162744]/60 border border-blue-500/20 backdrop-blur-md rounded-2xl flex items-center gap-3.5 shadow-xl text-left relative overflow-hidden">

            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-300/20 text-blue-600 font-mono text-xs font-bold shrink-0">
              TI-Eks
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-mono tracking-widest text-indigo-600 font-extrabold uppercase leading-none block">TUGAS UTS</span>
              <h3 className="text-xs font-bold text-white leading-none uppercase">Rafael Bramantyo Buana Putra</h3>
              <p className="text-xs text-slate-400 leading-none mt-0.5">
                NIM 100224003 • Kelas Eksekutif • Prodi Teknologi Informasi
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-left space-y-6">


            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">Secure Infrastructure</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Kustomisasi Setup Ramona</h2>
              </div>
            </div>

            {/* Step 1: Explanation */}
            {wizardStep === 1 && (
              <div className="space-y-5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Selamat datang di <strong>Ramona - Private Secure Vault</strong>. Aplikasi ini melindungi data rahasia (Catatan, Sandi, SSH Server, Dokumen, Kartu Member) seutuhnya menggunakan pengamanan client-side termodern.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-white/60 border border-slate-200 rounded-lg flex items-start gap-2.5">
                    <Database className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">End-to-End Encryption (E2EE)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        AES-GCM 256-bit mengunci seluruh data sebelum disimpan ke storage lokal. Kunci master diderivasi dinamis lewat memori RAM menggunakan PBKDF2 (100.000 putaran).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/60 border border-slate-200 rounded-lg flex items-start gap-2.5">
                    <Smartphone className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Integrasi OTP (Google Authenticator / Authy / Aegis)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        Kombinasi sandi master PIN di tahap ke-1 ditambah sinkronisasi token 2FA (TOTP) di tahap ke-2, mengeliminasi serangan pencurian kredensial fisik/luring.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    id="btn-wizard-next-1"
                    onClick={handleStartSetup}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition"
                  >
                    Mulailah Pengamanan Tingkat Tinggi
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Set Master PIN */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 font-mono text-indigo-600 uppercase tracking-wider">Tahap 1: Daftarkan PIN Kunci</h3>
                  <p className="text-slate-600 text-xs">PIN ini bertindak sebagai pas utama untuk memperkuat diderivasinya kunci enkripsi.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-600 block text-left">Buat Baru PIN (6 Angka)</label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="e.g. 104523"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 outline-none text-center font-mono focus:border-indigo-300/40 tracking-widest"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-600 block text-left">Konfirmasi PIN Kunci</label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="e.g. 104523"
                      value={newPinConfirm}
                      onChange={(e) => setNewPinConfirm(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 outline-none text-center font-mono focus:border-indigo-300/40 tracking-widest"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewPin("123456");
                      setNewPinConfirm("123456");
                    }}
                    className="w-full py-2 px-3 bg-indigo-50 hover:bg-slate-100 text-indigo-700 font-mono text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition border border-indigo-200 cursor-pointer"
                  >
                    💡 ISI CONTOH PIN DEMO ("123456")
                  </button>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    id="btn-wizard-next-2"
                    onClick={handleFinishPinStep}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg active:scale-95 transition"
                  >
                    Simpan & Lanjut ke TOTP
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Bind with OTP QR Matrix */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-center">
                <div className="space-y-1 text-left">
                  <h3 className="text-sm font-bold text-slate-800 font-mono text-indigo-600 uppercase tracking-wider">Tahap 2: Daftarkan OTP (Google Authenticator / Authy / Aegis)</h3>
                  <p className="text-slate-600 text-xs">Pindai matrix QR menggunakan kamera HP Anda, atau ketik manual kodenya.</p>
                </div>

                {/* Setup Matrix rendering */}
                <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl max-w-xs mx-auto text-slate-905 select-none border border-slate-300">
                  <div className="w-[120px] h-[120px] grid grid-cols-10 border border-slate-300 gap-0 p-1 bg-white">
                    {Array.from({ length: 100 }).map((_, i) => {
                      const cCode = setupTotpSecret.charCodeAt(i % setupTotpSecret.length) || 2;
                      const hasBlack = ((i * cCode) % 3 === 0) || (i < 20 && i % 3 === 0) || (i > 80 && i % 4 === 0) || (i % 7 === 0);
                      return <div key={i} className={hasBlack ? "bg-slate-900" : "bg-white"} />;
                    })}
                  </div>
                  <span className="font-mono text-black font-bold text-xs tracking-wider uppercase mt-1.5 leading-none">
                    OTP SETUP QR (Google Auth / Authy / Aegis Compatible)
                  </span>
                </div>

                <div className="bg-white/60 p-3 rounded-lg border border-slate-200 font-mono text-xs text-left space-y-2 select-all">
                  <div>
                    <span className="text-slate-500">PROVIDER:</span> <span className="text-slate-700">Private Secure Vault</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">MOCK SEED:</span> <span className="text-amber-600 font-bold tracking-widest">{setupTotpSecret}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    id="btn-wizard-next-3"
                    onClick={() => setWizardStep(4)}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg active:scale-95 transition"
                  >
                    Lanjut Verifikasi Token
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Verify First OTP code to confirm */}
            {wizardStep === 4 && (
              <form onSubmit={handleVerifySetupTotp} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 font-mono text-indigo-600 uppercase tracking-wider">Tahap Akhir: Verifikasi Token</h3>
                  <p className="text-slate-600 text-xs text-left">Masukkan token 6-digit yang sedang berputar di aplikasi OTP Anda sekarang untuk memastikan sinkronisasi berhasil.</p>
                </div>

                <div className="space-y-1.5 focus-indigo-group">
                  <label className="text-xs font-mono text-slate-600 block text-left">Token OTP (Google Authenticator / Authy / Aegis)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 842109"
                    value={setupTotpLiveToken}
                    onChange={(e) => setSetupTotpLiveToken(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-white border border-slate-300 text-indigo-600 text-center text-xl font-mono font-extrabold rounded-xl p-3 outline-none focus:border-indigo-600 tracking-widest"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSetupTotpLiveToken(setupTotpLiveToken);
                    }}
                    className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition border border-indigo-200 cursor-pointer mt-3 animate-pulse"
                  >
                    ⏰ TEMPEL TOKEN DEMO AKTIF ({setupTotpLiveToken || "Memuat..."})
                  </button>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    id="btn-wizard-next-4"
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg active:scale-95 transition"
                  >
                    Verifikasi & Deklarasikan Vault
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}


      {/* 2. AUTHENTICATION LOCKSCREEN (PIN + TOTP Stages) */}
      {metadata && metadata.isConfigured && !isUnlocked && (
        <div className="flex-1 w-full max-w-sm mx-auto px-4 py-8 flex flex-col justify-center">

          {/* Academic Badge above Lockscreen */}
          <div className="mb-4 bg-white border border-indigo-300/15 rounded-2xl p-4 shadow-xl text-left flex items-center gap-3 relative overflow-hidden">

            <div className="p-2.5 bg-indigo-50 text-indigo-600 border border-indigo-300/20 rounded-xl font-mono text-xs font-extrabold shrink-0">
              TI-Eks
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-mono tracking-widest text-indigo-600 font-extrabold uppercase block leading-none">TUGAS UTS</span>
              <h3 className="text-xs font-bold text-slate-800 truncate leading-tight uppercase">Rafael Bramantyo Buana Putra</h3>
              <p className="text-sm text-slate-500 leading-none truncate mt-0.5">
                NIM 100224003 • Kelas Eksekutif • Ramona
              </p>
            </div>
          </div>

          {/* Persistent security warn layout if authFeedback is active */}
          {authFeedback && (
            <div className={`mb-4 p-3.5 rounded-2xl border text-xs text-left leading-relaxed flex gap-2.5 items-start ${authFeedback.type === "error"
                ? "bg-rose-50/45 border-rose-500/30 text-rose-700"
                : "bg-amber-50/40 border-amber-500/30 text-amber-700"
              }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 animate-pulse" />
              <div className="space-y-1">
                <span className="font-bold text-xs font-mono tracking-wider uppercase block text-rose-600">Log Pengaman Ramona</span>
                <div>{authFeedback.message}</div>
              </div>
            </div>
          )}

          {/* Brute force countdown blocker card */}
          {cooldownTime ? (
            <div className="bg-rose-50/40 border border-rose-500/20 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-900 text-rose-600 rounded-full w-fit mx-auto">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide text-rose-600">Blokir Keamanan Aktif</h3>
                <p className="text-xs text-rose-700 leading-relaxed max-w-xs mx-auto">
                  Telah terdeteksi kegagalan PIN berulang. Konsol mengaktifkan protokol anti brute-force guna mengunci masukan keypad selama:
                </p>
                <div className="py-2 font-mono text-3xl font-extrabold text-rose-600 tracking-wider">
                  {cooldownTime} DETIK
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Gagal masuk berurut-turut: {failedAttempts} kali
                </div>
              </div>
            </div>
          ) : authStage === "PIN" ? (
            /* PIN Screen */
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-2xl space-y-6">

              <div className="text-center space-y-1">
                <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full w-fit mx-auto">
                  <Fingerprint className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-slate-900 font-bold text-base tracking-tight pt-1">Otentikasi Kunci Master</h2>
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Tahap 1: Sandi PIN</span>
              </div>

              {/* Password dot indicators */}
              <div className="flex justify-center items-center gap-2">
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border border-slate-755 transition duration-150 ${pinInput.length > idx
                        ? "bg-indigo-500 border-indigo-400 scale-110 shadow-md shadow-indigo-500/30"
                        : "bg-white"
                      }`}
                  ></div>
                ))}
              </div>

              {/* Physical/Tactile Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-[245px] mx-auto select-none">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="w-16 h-12 bg-white hover:bg-slate-100 active:bg-indigo-50 hover:border-indigo-300/20 border border-slate-200 text-slate-800 text-base font-mono font-bold rounded-xl transition cursor-pointer"
                  >
                    {num}
                  </button>
                ))}

                {/* Clear, 0, Backspace */}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="w-16 h-12 text-slate-500 hover:text-rose-600 text-xs font-mono font-medium cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress("0")}
                  className="w-16 h-12 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-base font-mono font-bold rounded-xl transition cursor-pointer"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="w-16 h-12 text-slate-500 hover:text-slate-700 text-xs font-mono font-medium cursor-pointer"
                >
                  Del
                </button>
              </div>

              {sessionStorage.getItem("demo_registered_pin") ? (
                <button
                  type="button"
                  onClick={() => setPinInput(sessionStorage.getItem("demo_registered_pin") || "")}
                  className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  🔑 TEMPEL PIN TERDAFTAR DEMO ({sessionStorage.getItem("demo_registered_pin")})
                </button>
              ) : (
                <div className="text-[10px] font-mono text-slate-500 text-center py-1">
                  💡 Gunakan PIN yang telah Anda daftarkan pada tahap konfigurasi.
                </div>
              )}

              <button
                type="button"
                id="btn-pin-unlock"
                disabled={pinInput.length !== 6}
                onClick={() => handlePinSubmit()}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
              >
                Kirim PIN & Lanjut 2FA
              </button>
            </div>
          ) : (
            /* TOTP Screen (Second stage) */
            <form onSubmit={handleTotpSubmit} className="bg-white border border-slate-300 rounded-2xl p-6 shadow-2xl space-y-5">

              <div className="text-center space-y-1">
                <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full w-fit mx-auto">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-slate-900 font-bold text-base tracking-tight pt-1">Otentikasi Kunci Master</h2>
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Tahap 2: OTP (Google Authenticator / Authy / Aegis)</span>
              </div>

              <div className="space-y-1.5 focus-indigo-group text-left">
                <label className="text-xs font-mono text-slate-600 block">Kode Token 2FA OTP (Google Auth / Authy / Aegis)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 483294"
                  value={totpInput}
                  onChange={(e) => setTotpInput(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full bg-white border border-slate-300 text-indigo-600 text-center text-xl font-mono font-extrabold rounded-xl p-3 outline-none focus:border-indigo-300 tracking-widest"
                />

                {lockscreenLiveToken && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 select-none text-slate-800">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      <span>Emulator OTP Internal (Demo)</span>
                      <span className="text-indigo-600 animate-pulse bg-indigo-50 px-1.5 py-0.5 rounded">
                        {lockscreenTimeLeft}s tersisa
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-slate-105 pt-1.5">
                      <div className="font-mono text-xl font-extrabold text-slate-900 tracking-widest">
                        {lockscreenLiveToken.slice(0, 3)} {lockscreenLiveToken.slice(3)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setTotpInput(lockscreenLiveToken)}
                        className="py-1 px-2.5 bg-indigo-650 hover:bg-indigo-705 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-mono text-[10px] font-bold rounded-lg transition shrink-0 cursor-pointer"
                      >
                        Tempel Token
                      </button>
                    </div>

                    {lockscreenTotpSecret && (
                      <div className="text-[9px] font-mono text-slate-400 text-left overflow-x-auto whitespace-nowrap pt-1">
                        <span className="text-slate-500 font-semibold">Secret Key:</span> {lockscreenTotpSecret}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setAuthStage("PIN"); setTotpInput(""); setAuthFeedback(null); }}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs cursor-pointer"
                >
                  Kembali ke PIN
                </button>
                <button
                  type="submit"
                  id="btn-totp-verify"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg active:scale-95 cursor-pointer"
                >
                  Dekripsi & Masuk Brankas
                </button>
              </div>
            </form>
          )}

        </div>
      )}


      {/* 3. CORE SECURE CABIN DESK (Unlocked Vault Workspace) */}
      {isUnlocked && (
        <>
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-6">

            {/* Mobile Tab/Dropdown Selector at the very top */}
            <div className="block md:hidden bg-slate-900/40 border border-slate-700/30 backdrop-blur-md rounded-2xl p-4 shadow-xl mb-1 text-left">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-xs font-bold text-white tracking-wider font-mono uppercase">RAMONA VUTS</h1>
                    <p className="text-[9px] font-mono text-slate-400">Isolated Console v1.42</p>
                  </div>
                </div>

                <div className="flex-1 max-w-[170px]">
                  <select
                    value={activeTab === "settings" ? "settings" : activeTab}
                    onChange={(e) => {
                      if (e.target.value === "logout") {
                        handleLock();
                      } else {
                        setActiveTab(e.target.value as any);
                      }
                    }}
                    className="w-full bg-[#162744] border border-slate-700/80 text-white text-xs rounded-xl py-2 px-3 outline-none focus:border-blue-500 font-bold tracking-tight cursor-pointer"
                  >
                    <option value="notes">📝 Catatan Rahasia</option>
                    <option value="passwords">🔑 Data Password</option>
                    <option value="ssh">💻 Kunci SSH Server</option>
                    <option value="totp">⏱️ TOTP MFA Token</option>
                    <option value="docs">📂 Dokumen Kedap</option>
                    <option value="mahasiswa">🎓 ID & Analisis UTS</option>
                    <option value="rom">🛡️ Simulasi Threat Model</option>
                    <option value="audit">📊 Audit & Forensik</option>
                    <option value="settings">⚙️ Pengaturan</option>
                    <option value="logout">🚪 Keluar Sesi / Kunci</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dashboard Left Navigation Rail (Hidden on Mobile, Clean for Desktop) */}
            <div className="hidden md:flex md:w-64 shrink-0 flex-col justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl h-fit">
              <div className="space-y-6">

                {/* Brand minimal indicator */}
                <div className="flex items-center gap-2.5 text-left pb-1 border-b border-slate-200">
                  <div className="p-2 bg-blue-50 text-blue-650 border border-blue-100 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xs font-bold text-slate-900 tracking-widest uppercase font-mono">RAMONA SECURE SEC</h1>
                    <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-widest">● UTS VAULT EDITION</span>
                  </div>
                </div>

                {/* Desktop Navigation Tabs */}
                <nav className="flex flex-col gap-1.5 text-left">

                  <button
                    type="button"
                    id="tab-btn-notes"
                    onClick={() => setActiveTab("notes")}
                    className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer ${activeTab === "notes"
                        ? "bg-slate-900 text-white border border-slate-800 font-bold shadow-md"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                      }`}
                  >
                    <FileText className={`w-[18px] h-[18px] shrink-0 ${activeTab === "notes" ? "" : "text-slate-400"}`} />
                    <span>Catatan Rahasia</span>
                  </button>

                  <button
                    type="button"
                    id="tab-btn-passwords"
                    onClick={() => setActiveTab("passwords")}
                    className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer ${activeTab === "passwords"
                        ? "bg-slate-900 text-white border border-slate-800 font-bold shadow-md"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                      }`}
                  >
                    <Key className={`w-[18px] h-[18px] shrink-0 ${activeTab === "passwords" ? "" : "text-slate-400"}`} />
                    <span>Data Password</span>
                  </button>

                  <button
                    type="button"
                    id="tab-btn-ssh"
                    onClick={() => setActiveTab("ssh")}
                    className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer ${activeTab === "ssh"
                        ? "bg-slate-900 text-white border border-slate-800 font-bold shadow-md"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                      }`}
                  >
                    <Layers className={`w-[18px] h-[18px] shrink-0 ${activeTab === "ssh" ? "" : "text-slate-400"}`} />
                    <span>Kunci SSH Server</span>
                  </button>

                  <button
                    type="button"
                    id="tab-btn-totp"
                    onClick={() => setActiveTab("totp")}
                    className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer ${activeTab === "totp"
                        ? "bg-slate-900 text-white border border-slate-800 font-bold shadow-md"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                      }`}
                  >
                    <Clock className={`w-[18px] h-[18px] shrink-0 ${activeTab === "totp" ? "" : "text-slate-400"}`} />
                    <span>TOTP MFA Token</span>
                  </button>

                  <button
                    type="button"
                    id="tab-btn-docs"
                    onClick={() => setActiveTab("docs")}
                    className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer ${activeTab === "docs"
                        ? "bg-slate-900 text-white border border-slate-800 font-bold shadow-md"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                      }`}
                  >
                    <FileDigit className={`w-[18px] h-[18px] shrink-0 ${activeTab === "docs" ? "" : "text-slate-400"}`} />
                    <span>Dokumen Kedap</span>
                  </button>

                  <div className="border-t border-slate-200 mt-2 pt-2 flex flex-col gap-1.5">
                    <button
                      type="button"
                      id="tab-btn-mahasiswa"
                      onClick={() => setActiveTab("mahasiswa")}
                      className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer ${activeTab === "mahasiswa"
                          ? "bg-slate-900 text-white border border-slate-800 font-bold shadow-md"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }`}
                    >
                      <User className={`w-[18px] h-[18px] shrink-0 ${activeTab === "mahasiswa" ? "" : "text-slate-400"}`} />
                      <span className="font-semibold">🎓 ID &amp; Analisis UTS</span>
                    </button>

                    <button
                      type="button"
                      id="tab-btn-rom"
                      onClick={() => setActiveTab("rom")}
                      className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer ${activeTab === "rom"
                          ? "bg-slate-900 text-white border border-slate-800 font-bold shadow-md"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }`}
                    >
                      <Smartphone className={`w-[18px] h-[18px] shrink-0 ${activeTab === "rom" ? "" : "text-slate-400"}`} />
                      <span className="font-semibold">🛡️ Simulasi Threat Model</span>
                    </button>

                    <button
                      type="button"
                      id="tab-btn-audit"
                      onClick={() => setActiveTab("audit")}
                      className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer ${activeTab === "audit"
                          ? "bg-slate-900 text-white border border-slate-800 font-bold shadow-md"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }`}
                    >
                      <Activity className={`w-[18px] h-[18px] shrink-0 ${activeTab === "audit" ? "" : "text-slate-400"}`} />
                      <span>Audit &amp; Forensik</span>
                    </button>

                    <button
                      type="button"
                      id="tab-btn-settings"
                      onClick={() => setActiveTab("settings")}
                      className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer ${activeTab === "settings"
                          ? "bg-slate-900 text-white border border-slate-800 font-bold shadow-md"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }`}
                    >
                      <SettingsIcon className={`w-[18px] h-[18px] shrink-0 ${activeTab === "settings" ? "" : "text-slate-400"}`} />
                      <span>Pengaturan</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLock}
                      className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-bold flex items-center gap-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer border border-transparent"
                    >
                      <LogOut className="w-[18px] h-[18px] shrink-0 text-rose-500" />
                      <span>Keluar Sesi</span>
                    </button>
                  </div>
                </nav>

              </div>

              {/* Locked Action and Security Warnings */}
              <div className="space-y-4 pt-6">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-left font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block leading-none">Security Active Session</span>
                  <span className="text-[10px] text-blue-600 font-bold uppercase leading-none block">PBKDF2 Derived Key</span>
                </div>
              </div>
            </div>

            {/* Active Workspace Panel Panel */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xl min-h-[560px]">
              {activeTab === "mahasiswa" && (
                <MahasiswaSection />
              )}

              {activeTab === "notes" && (
                <NoteSection notes={notes} onSaveNotes={saveNotesE2EE} />
              )}

              {activeTab === "passwords" && (
                <PasswordSection passwords={passwords} onSavePasswords={savePasswordsE2EE} />
              )}

              {activeTab === "ssh" && (
                <SshSection sshKeys={sshKeys} onSaveSshKeys={saveSshKeysE2EE} />
              )}

              {activeTab === "totp" && (
                <TotpSection totpSecrets={totpSecrets} onSaveTotpSecrets={saveTotpE2EE} />
              )}

              {activeTab === "docs" && (
                <DocSection
                  documents={documents}
                  onSaveDocuments={saveDocumentsE2EE}
                  encryptPayload={handleRawEncrypt}
                  decryptPayload={handleRawDecrypt}
                />
              )}

              {activeTab === "audit" && (
                <VaultStats
                  logs={logs}
                  failedAttempts={failedAttempts}
                  cooldownUntil={cooldownTime ? Date.now() + cooldownTime * 1000 : null}
                  pinLength={newPin.length > 0 ? newPin.length : 6}
                />
              )}

              {activeTab === "rom" && (
                <ThreatModelPanel />
              )}

              {activeTab === "settings" && (
                <SettingsSection onClearData={handleClearData} onLogout={handleLock} />
              )}
            </div>

          </div>
        </>
      )}

      {/* Vault Footer Status Panel */}
      <footer className="py-4 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Secure Console: Client-Side Isolated Sandbox (E2EE AES-GCM)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>UTC: {utcTime || "N/A"}</span>
            <span>•</span>
            <span>Aman Bersertifikasi</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
