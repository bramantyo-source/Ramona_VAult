import React, { useState } from "react";
import {
  ShieldAlert,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Unlock,
  Lock,
  CheckCircle,
  HelpCircle,
  Info,
  Server,
  Terminal,
  RefreshCw,
  Layers,
  Sparkles,
  Wifi,
  Radio,
  LockKeyhole
} from "lucide-react";

export default function ThreatModelPanel() {
  // Simulator State
  const [bootloaderUnlocked, setBootloaderUnlocked] = useState<boolean>(true);
  const [rootStatus, setRootStatus] = useState<string>("magisk"); // none, magisk, adb_only
  const [romType, setRomType] = useState<string>("unofficial"); // official_lineage, unofficial, port_gsi
  const [fbeEnabled, setFbeEnabled] = useState<boolean>(true); // File Based Encryption

  // Network Threat Simulator State
  const [networkType, setNetworkType] = useState<string>("pub_wifi"); // pub_wifi, home_wifi, rogue_gsm, safe_gsm
  const [e2eeEnabled, setE2eeEnabled] = useState<boolean>(true); // E2EE On vs Off (Demonstrator Sebelum/Sesudah Mitigasi)

  // Calculated Threat Score and Verdict
  const calculateThreatScore = () => {
    let score = 30; // base risk: 30%

    if (bootloaderUnlocked) score += 20;
    if (rootStatus === "magisk") score += 25;
    if (rootStatus === "adb_only") score += 15;

    if (romType === "unofficial") score += 15;
    if (romType === "port_gsi") score += 20;

    if (!fbeEnabled) score += 30;

    return Math.min(score, 100);
  };

  const score = calculateThreatScore();

  const getVerdict = (score: number) => {
    if (score < 45) return { text: "RENDAH", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30", desc: "Sistem Anda tergolong aman. Meskipun bootloader terbuka, enkripsi aktif dan tidak ada celah root sembarangan." };
    if (score < 70) return { text: "SEDANG", color: "text-amber-600 bg-amber-500/10 border-amber-500/30", desc: "Ada paparan risiko. Root aktif atau ROM tidak resmi dapat dimanfaatkan oleh malware lokal jika diberi izin superuser secara ceroboh." };
    return { text: "TINGGI / KRITIS", color: "text-rose-600 bg-rose-500/10 border-rose-500/30", desc: "RISIKO TINGGI! Data Anda rentan jika pihak luar mendapatkan akses fisik ke ponsel Anda atau menginstal malware sistem." };
  };

  const verdict = getVerdict(score);

  return (
    <div className="space-y-6" id="threat-model-panel">
      {/* Overview Card */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xl relative overflow-hidden">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-indigo-600 w-5 h-5" />
              <span className="text-xs font-mono text-indigo-600 uppercase tracking-widest font-semibold">Threat Intelligence Unit</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Bisa Kah Custom ROM HP Membobol Brankas Anda?</h2>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Analisis keamanan tingkat militer mengenai kerentanan bootloader terbuka, hak akses root, dan keandalan isolasi sandbox Android.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start py-1 px-3 bg-slate-100 border border-slate-700 rounded-lg text-xs font-mono text-slate-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Live Core Analysis
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column - Custom ROM Threat Diagnostician */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-6">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-600" />
            <h3 className="font-semibold text-slate-800 text-sm font-mono uppercase tracking-wider">Device Threat Simulator</h3>
          </div>

          <div className="space-y-4">
            {/* 1. Bootloader Status */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 block flex items-center justify-between">
                <span>1. Status Bootloader</span>
                <span className={bootloaderUnlocked ? "text-amber-600" : "text-emerald-600"}>
                  {bootloaderUnlocked ? "Unlocked (Risiko)" : "Locked (Aman)"}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-bl-locked"
                  onClick={() => setBootloaderUnlocked(false)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${!bootloaderUnlocked
                    ? "bg-emerald-50/40 border-emerald-500 text-emerald-300"
                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-700"
                    }`}
                >
                  <Lock className="w-3 h-3 inline mr-1.5" /> Locked
                </button>
                <button
                  type="button"
                  id="btn-bl-unlocked"
                  onClick={() => setBootloaderUnlocked(true)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${bootloaderUnlocked
                    ? "bg-amber-50/40 border-amber-500 text-amber-700"
                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-700"
                    }`}
                >
                  <Unlock className="w-3 h-3 inline mr-1.5" /> Unlocked
                </button>
              </div>
            </div>

            {/* 2. Root Status */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 block">2. Hak Akses Root / Superuser</label>
              <select
                id="select-root-status"
                value={rootStatus}
                onChange={(e) => setRootStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 outline-none focus:border-slate-700 font-mono"
              >
                <option value="none">Tidak Di-Root (Sangat Direkomendasikan)</option>
                <option value="magisk">Magisk Root (Izin Root Dinamis)</option>
                <option value="adb_only">ADB Root Aktif secara Default (Bahaya Tinggi)</option>
              </select>
            </div>

            {/* 3. ROM Authenticity */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 block">3. Keaslian & Pengembang Custom ROM</label>
              <select
                id="select-rom-type"
                value={romType}
                onChange={(e) => setRomType(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 outline-none focus:border-slate-700 font-mono"
              >
                <option value="official_lineage">Build Resmi (Official LineageOS / PixelExperience)</option>
                <option value="unofficial">Build Tidak Resmi (Unofficial XDA / Custom Mod)</option>
                <option value="port_gsi">Ported ROM / GSI (Generic System Image tanpa audit)</option>
              </select>
            </div>

            {/* 4. Encryption Status */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 block flex items-center justify-between">
                <span>4. Enkripsi Partisi Data / FBE</span>
                <span className={fbeEnabled ? "text-emerald-600" : "text-rose-600"}>
                  {fbeEnabled ? "FBE Terenkripsi Luhur" : "Belum Terenkripsi (Raw Plaintext)"}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-fbe-on"
                  onClick={() => setFbeEnabled(true)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${fbeEnabled
                    ? "bg-emerald-50/40 border-emerald-500 text-emerald-300"
                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-700"
                    }`}
                >
                  Aktif (AES-FBE)
                </button>
                <button
                  type="button"
                  id="btn-fbe-off"
                  onClick={() => setFbeEnabled(false)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${!fbeEnabled
                    ? "bg-rose-50/40 border-rose-500 text-rose-700"
                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-700"
                    }`}
                >
                  Matikan Enkripsi
                </button>
              </div>
            </div>
          </div>

          {/* Results Score Gauge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-mono">Skor Kerentanan Ekstrinsik:</span>
              <span className="font-bold text-slate-800">{score}%</span>
            </div>

            {/* ProgressBar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${score < 45 ? "bg-emerald-500" : score < 70 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>

            <div className={`p-3 border rounded-lg ${verdict.color}`}>
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase mb-1 font-mono tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                VERDIK HP: {verdict.text}
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                {verdict.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Comprehensive Custom ROM Cyber Threat Briefing */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Cpu className="text-indigo-600 w-4 h-4" />
              <h3 className="font-bold text-slate-800 text-sm font-mono tracking-wider uppercase">4 Ancaman Utama Custom ROM terhadap Brankas</h3>
            </div>

            <div className="space-y-4">
              {/* Threat 1 */}
              <div className="flex gap-3 items-start border-l-2 border-indigo-300 pl-3">
                <div className="text-xs bg-white text-indigo-600 font-mono w-6 h-6 flex items-center justify-center rounded border border-slate-300 shrink-0 font-bold">
                  01
                </div>
                <div className="space-y-1">
                  <h4 className="text-slate-800 font-bold text-xs">Bypass Sandbox Aplikasi oleh Malware Superuser</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Android standard memiliki sandbox ketat (UID terpisah). Namun, jika kustom ROM Anda di-root menggunakan Magisk/KernelSU tanpa konfigurasi aman (tidak mengaktifkan Zygisk/Denylist), aplikasi malicious lain yang mendapat hak root dapat langsung membaca direktori lokal storage (IndexedDB/localStorage) tempat data enkripsi brankas ini disimpan.
                  </p>
                </div>
              </div>

              {/* Threat 2 */}
              <div className="flex gap-3 items-start border-l-2 border-indigo-300 pl-3">
                <div className="text-xs bg-white text-indigo-600 font-mono w-6 h-6 flex items-center justify-center rounded border border-slate-300 shrink-0 font-bold">
                  02
                </div>
                <div className="space-y-1">
                  <h4 className="text-slate-800 font-bold text-xs">Akses Fisik via TWRP/Custom Recovery (Unlocked Bootloader)</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Apabila bootloader terbuka (unlocked) dan pembobol memiliki akses fisik ke HP Anda, mereka bisa masuk ke recovery mode seperti TWRP/OrangeFox, mendepak sistem operasi, lalu me-mount partisi data ke PC untuk disalin utuh. Keandalan brankas ini terletak pada <strong>E2EE</strong> di mana data tetap aman terenkripsi (cipher) karena mereka mutlak butuh PIN Anda untuk memisahkan data jadi teks asli.
                  </p>
                </div>
              </div>

              {/* Threat 3 */}
              <div className="flex gap-3 items-start border-l-2 border-indigo-300 pl-3">
                <div className="text-xs bg-white text-indigo-600 font-mono w-6 h-6 flex items-center justify-center rounded border border-slate-300 shrink-0 font-bold">
                  03
                </div>
                <div className="space-y-1">
                  <h4 className="text-slate-800 font-bold text-xs">Gagalnya Kunci Perangkat Keras (TEE / Keystore Integrity Fallback)</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Sistem Android bawaan menyimpan kunci cryptographic dalam Secure Element tingkat silikon (TEE/Keymaster). Kustom ROM pihak ketiga seringkali gagal melewati uji verifikasi sistem keamanan Google (Play Integrity / SafetyNet), memaksa aplikasi beralih ke software-backed crypto cadangan yang secara teori lebih rentan terhadap serangan dump memori.
                  </p>
                </div>
              </div>

              {/* Threat 4 */}
              <div className="flex gap-3 items-start border-l-2 border-indigo-300 pl-3">
                <div className="text-xs bg-white text-indigo-600 font-mono w-6 h-6 flex items-center justify-center rounded border border-slate-300 shrink-0 font-bold">
                  04
                </div>
                <div className="space-y-1">
                  <h4 className="text-slate-800 font-bold text-xs">Celah Backdoor (Build Developer Tidak Resmi)</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Custom ROM & kernel yang dimodifikasi oleh developer amatir di forum internet berpotensi memiliki spyware tersembunyi, keylogger di level keyboard virtual kustom, atau modifikasi port ADB nirkabel yang selalu terbuka. Ini adalah bahaya tersembunyi terbesar bagi semua jenis kredensial digital Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* E2EE Protection Architecture Alert */}
          <div className="p-4 bg-white border border-slate-300 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">Arsitektur Proteksi Vault Terhadap Ancaman Kustom ROM</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Vault ini dipersenjatai dengan <strong>End-to-End Encryption (E2EE)</strong> tingkat perbankan. Seluruh data Anda dienkripsi memakai algoritma <strong>AES-GCM 256-bit</strong>. Kunci dekripsi didapat secara dinamis lewat <strong>PBKDF2 SHA-256 (100.000 putaran)</strong> yang diverifikasi murni dalam memori RAM komputer/ponsel.
              </p>
              <div className="pt-2 flex items-center gap-2 text-sm text-emerald-600 font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                Meskipun ROM HP kustom atau TWRP disalin secara paksa, peretas tidak memiliki kunci fisik untuk membaca data Anda!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE WIRELESS & NETWORK SNIFFING SIMULATOR */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xl space-y-6 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wifi className="text-indigo-600 w-5 h-5" />
              <span className="text-xs font-mono text-indigo-600 uppercase tracking-widest font-semibold">Wireless Transport Auditing</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Simulator Intersepsi Paket Udara (Over-the-Air Sniffing Detector)</h3>
            <p className="text-slate-600 text-xs">
              Uji ketahanan transmisi data brankas terhadap serangan penyadapan Wi-Fi Publik tidak aman &amp; Base Transceiver Station (BTS-GSM) Palsu.
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-indigo-50 border border-indigo-200 rounded-lg">
            <span className="text-[10px] font-mono font-bold text-indigo-700 px-2 uppercase">Sebelum vs Sesudah Mitigasi</span>
            <button
              type="button"
              onClick={() => setE2eeEnabled(!e2eeEnabled)}
              className={`py-1 px-3 rounded text-xs font-bold transition cursor-pointer ${e2eeEnabled
                ? "bg-emerald-600 text-white shadow hover:bg-emerald-700"
                : "bg-rose-605 bg-rose-600 text-white shadow hover:bg-rose-700"
                }`}
            >
              Mitigasi E2EE: {e2eeEnabled ? "AKTIF (Sesudah)" : "NONAKTIF (Sebelum)"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold font-mono text-slate-700 block uppercase">1. Pilih Lingkungan Jaringan Nirkabel</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setNetworkType("pub_wifi")}
                  className={`p-3 text-xs font-mono rounded-lg border text-left flex items-start gap-2.5 transition cursor-pointer ${networkType === "pub_wifi"
                    ? "bg-rose-50 border-rose-500 text-rose-900 shadow-sm font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-400"
                    }`}
                >
                  <Wifi className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">WiFi Publik Terbuka (Rentan Rogue AP)</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5 font-normal">
                      Jaringan tanpa enkripsi WEP/WPA. Sangat rentan pembajakan ARP spoofing dan sniffing paket udara di kafe/bandara.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNetworkType("rogue_gsm")}
                  className={`p-3 text-xs font-mono rounded-lg border text-left flex items-start gap-2.5 transition cursor-pointer ${networkType === "rogue_gsm"
                    ? "bg-rose-50 border-rose-500 text-rose-900 shadow-sm font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-400"
                    }`}
                >
                  <Radio className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Seluler Palsu (IMSI Catcher / BTS Rogue)</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5 font-normal">
                      Mengeksploitasi kelemahan otentikasi satu-arah GSM Klasik. Perangkat peretas langsung memancing HP terhubung.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNetworkType("home_wifi")}
                  className={`p-3 text-xs font-mono rounded-lg border text-left flex items-start gap-2.5 transition cursor-pointer ${networkType === "home_wifi"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-400"
                    }`}
                >
                  <Wifi className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">WiFi Rumah WPA2 / WPA3 Terenkripsi</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5 font-normal">
                      Trafik lokal dilindungi sandi internal router dan enkripsi WPA. Mengisolasi jaringan lokal secara optimal.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sniffer Terminal Screen */}
          <div className="lg:col-span-7 bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono text-[11px] h-[340px] shadow-2xl overflow-hidden relative">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 select-none text-[10px]">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4 text-rose-500 animate-pulse" />
                <span className="font-bold text-slate-300">PROMISCUOUS WIRESHARK AIR LOGS</span>
              </div>
              <span className="text-emerald-500 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                ACTIVE LOGS
              </span>
            </div>

            {/* Packet Content Stream */}
            <div className="flex-1 overflow-y-auto space-y-2 p-1 text-slate-300 select-all scrollbar-none text-left">
              <div className="text-slate-500">[ mon0 interface enabled ... sniffing broadcast frames ]</div>
              <div className="text-slate-400">
                SRC: 192.168.1.103 (Android Client) --&gt; DST: sync.ramona.secure (Sync Server) | PROTO: HTTPS
              </div>

              {networkType === "pub_wifi" && (
                <div className="text-rose-400 font-bold bg-rose-950/20 p-2 rounded border border-rose-900/30">
                  ⚠️ [ALERT] MAC Spoofing &amp; ARP Poisoning detected! Sniffing active from Rogue MAC AA:B1:CC:22.
                </div>
              )}
              {networkType === "rogue_gsm" && (
                <div className="text-rose-400 font-bold bg-rose-950/20 p-2 rounded border border-rose-900/30">
                  ⚠️ [ALERT] Down-grade attack detected (A5/1 Cryptography forcing)! Base Station/IMSI Catcher active.
                </div>
              )}

              {/* Simulated Payload and Decrypted view based on E2EE */}
              <div className="p-3 w-full rounded-lg bg-[#0e1726] border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Captured TCP Payload:</div>
                <div className="text-[11px] font-mono break-all leading-normal">
                  {e2eeEnabled ? (
                    <span className="text-emerald-400 font-bold">
                      AES-256-GCM [gcm-tag:d8f9] payload: <br />
                      Cipher: cZf/3pX1S9K7a4e6Zz9PqL8xMv+90hRfT9zXpD9W...
                      <span className="text-slate-500 block text-[9px] mt-1 italic">
                        (Aman: Peretas tidak bisa membaca sandi asli karena data terenkripsi murni secara asimetris/simetris di WebView sandbox secara luring!)
                      </span>
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      Plaintext Payload: <br />
                      {"{ \"mhs\": \"Rafael B\", \"master_pin\": \"123456\", \"secure_notes\": \"Sandi Bank Mandiri: bram123\" }"}
                      <span className="text-rose-300 block text-[9px] mt-1">
                        (Bahaya: Kebocoran Data Sensitif Terjadi! Isi PIN dan Brankas bocor karena transmisi polos tanpa mitigasi enkripsi!)
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Packet analysis depending on E2EE */}
              <div className="pt-1">
                {e2eeEnabled ? (
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-505 border-emerald-500/30 text-emerald-450 rounded bg-emerald-950/10 text-emerald-600 text-xs">
                    <strong>🛡️ MITIGASI AKTIF:</strong> Enkripsi E2EE AES-GCM 256 klien (Capacitor Web Sandbox) berhasil menyeimbangkan ancaman WiFi/GSM tanpa memerlukan ketergantungan transmisi transport yang rentan.
                  </div>
                ) : (
                  <div className="p-2.5 bg-rose-950/30 border border-rose-505 border-rose-500/30 text-rose-450 rounded bg-rose-950/10 text-rose-600 text-xs">
                    <strong>🚨 BAHAYA BESAR:</strong> Tanpa mitigasi, seluruh informasi kredensial yang disinkronisasi rentan dicuri langsung oleh penyerang di WiFi publik.
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Summary Meter */}
            <div className="border-t border-slate-800 pt-2 flex items-center justify-between mt-2 select-none">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Keamanan Jalur Transport:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e2eeEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}>
                {e2eeEnabled ? "● AMAN (E2EE AKTIF)" : "● RENTAN (SADAPAN AKTIF)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Practical Mitigation Strategies */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-slate-800 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle className="text-emerald-600 w-4 h-4" /> Strategi Mitigasi Praktis bagi Pengguna Custom ROM
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Gunakan Keyboard Bawaan Resmi</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Selalu gunakan AOSP Keyboard, Gboard, atau SwiftKey asli. Hindari keyboard kustom bajakan yang ditanam pengembang ROM lepas demi menghindari keylogger rahasia.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Karantina Izin Root Melalui Magisk</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Gunakan fitur whitelist root yang ketat dengan durasi habis/session timeout otomatis, dan aktifkan autentikasi sidik jari setiap kali ada aplikasi meminta akses Superuser.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Wajibkan Lockscreen yang Kuat</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jika bootloader terbuka, batasi bypass kunci fisik dengan mengaktifkan sandi alfanumerik panjang di Android agar FBE (File-Based Encryption) mengunci data luhur Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
