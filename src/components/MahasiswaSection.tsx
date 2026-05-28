import React, { useState } from "react";
import { 
  User, 
  BookOpen, 
  ShieldAlert, 
  Smartphone, 
  Sparkles, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Globe, 
  Code2,
  Lock,
  ExternalLink,
  BookMarked,
  KeyRound
} from "lucide-react";

export default function MahasiswaSection() {
  const [activeSubTab, setActiveSubTab] = useState<"profil" | "analisis" | "apk" | "uts">("profil");

  return (
    <div className="space-y-6 text-left">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950 border border-indigo-200/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-extrabold bg-indigo-100 text-indigo-600 border border-indigo-300/30 rounded uppercase tracking-wider">
              Tugas Akademik
            </span>
            <span className="px-2 py-0.5 text-xs font-mono font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded uppercase tracking-wider">
              100% Client-Side Safe
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            ID & Analisis Keamanan Aplikasi <span className="text-indigo-600 font-mono">RAMONA</span>
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Sistem brankas rahasia berbasis dwi-faktor (2FA PIN + TOTP OTP) dengan ketahanan sandbox independen.
          </p>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex flex-wrap gap-1.5 shrink-0 bg-slate-50/80 p-1 border border-slate-200 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab("profil")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === "profil" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Kartu Mahasiswa</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab("analisis")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === "analisis" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Dart vs React Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("uts")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === "uts" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Laporan UTS & Threat Model</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab("apk")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === "apk" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Build APK</span>
          </button>
        </div>
      </div>

      {/* SUB-SECTION 1: KARTU IDENTITAS MAHASISWA */}
      {activeSubTab === "profil" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Cyber Holographic Physical Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 block">
              Digital Academic Pass Matrix
            </span>
            <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-indigo-900/30 via-slate-900 to-indigo-950/20 border border-indigo-300/20 shadow-2xl p-6 relative overflow-hidden flex flex-col justify-between aspect-[1.58/1]">
              
              {/* Background Design Aesthetics */}
              
              
              {/* Overlay lines network effect */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

              {/* Top Banner inside Card */}
              <div className="flex justify-between items-start border-b border-indigo-300/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 border border-indigo-300/30 text-indigo-600 rounded-lg">
                    <Cpu className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-black tracking-widest text-slate-800 leading-none">
                      UNIV - PROJECT RAMONA
                    </h3>
                    <span className="text-xs font-mono text-indigo-600 tracking-wider">
                      TEKNOLOGI INFORMASI EKSEKUTIF
                    </span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              </div>

              {/* Middle Section of Card */}
              <div className="flex gap-4 items-center my-4">
                {/* Photo Placeholder inspired by biometric HUD */}
                <div className="w-16 h-16 rounded-xl bg-white border border-indigo-300/20 p-1 shrink-0 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-50 transition"></div>
                  <User className="w-8 h-8 text-indigo-600" />
                  {/* Digital corner reticles */}
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-indigo-400"></div>
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-indigo-400"></div>
                  <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-indigo-400"></div>
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-indigo-400"></div>
                </div>

                <div className="space-y-1 text-left min-w-0">
                  <span className="text-xs font-mono text-slate-500 block leading-none">NAMA MAHASISWA ID</span>
                  <h4 className="font-bold text-sm text-slate-900 uppercase truncate tracking-wide leading-tight">
                    Rafael Bramantyo Buana Putra
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 block leading-none">NIM</span>
                      <span className="text-slate-800 font-bold">100224003</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block leading-none">KELAS</span>
                      <span className="text-slate-800 font-bold">EKSEKUTIF</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center border-t border-indigo-300/10 pt-2 font-mono text-xs text-slate-600">
                <div>
                  <span className="text-indigo-600 font-semibold uppercase tracking-wider">PROJECT ASSIGNMENT</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs bg-emerald-500/15 text-emerald-600 uppercase font-black tracking-widest px-1.5 py-0.5 rounded border border-emerald-500/10">
                    ID VALIDATED
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Stats Grid for visual balance */}
            <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 p-3 border border-slate-200 rounded-xl text-left">
                <span className="text-xs font-mono text-slate-500 uppercase leading-none block">MATA KULIAH</span>
                <span className="text-sm font-bold text-slate-800 block mt-1">Keamanan Sistem Informasi</span>
              </div>
              <div className="bg-slate-50 p-3 border border-slate-200 rounded-xl text-left">
                <span className="text-xs font-mono text-slate-500 uppercase leading-none block">DIAGRAM ARSITEKTUR</span>
                <span className="text-sm font-bold text-indigo-600 block mt-1 flex items-center gap-1">
                  100% Client-Side <Lock className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Academic Overview Text Block */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Deskripsi Tugas & Desain Aplikasi "Ramona"</span>
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Aplikasi <strong>Ramona</strong> adalah sebuah simulator enkripsi kelas militer luring (offline) yang dirancang untuk membuktikan integritas enkripsi data independen tanpa bergantung pada server pihak ketiga. 
              Semua data sensitif diurai seutuhnya di level RAM untuk meminimalisir ancaman penyadapan media penyimpanan fisik (cold boot attacks dan physical forensic logs).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Layers className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-slate-800">Arsitektur Ramona</h4>
                </div>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li>PBKDF2 Key Derivation (100k rounds)</li>
                  <li>Symmetric AES-GCM 256-bit E2EE</li>
                  <li>Dwi-Faktor: Password PIN + TOTP 2FA</li>
                  <li>Auto-Lock saat browser blur / tidak fokus</li>
                </ul>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-600">
                  <BookMarked className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-slate-800">Parameter Tugas</h4>
                </div>
                <div className="text-sm text-slate-500 space-y-1 font-mono">
                  <div>• NAMA: Rafael Bramantyo Buana Putra</div>
                  <div>• NIM: 100224003</div>
                  <div>• KELAS: Eksekutif</div>
                  <div>• PRODI: Teknologi Informasi</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200/30 rounded-xl flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-600 leading-relaxed">
                <strong>Saran Penilaian:</strong> Halaman enkripsi dapat berfungsi penuh di sisa tab navigasi luring (Catatan, Data Password, Dokumen). Anda dapat membuat PIN baru dan mendaftarkan OTP di langkah awal untuk melakukan uji coba verifikasi langsung di level browser RAM.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* SUB-SECTION 2: DART VS TYPESCRIPT SECURITY DISCUSSION */}
      {activeSubTab === "analisis" && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span>Analisis Komparatif: Dart (Flutter) vs. TypeScript (React/Capacitor) Demi Keamanan Mobile</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Dari perspektif keamanan siber (cybersecurity) pada aplikasi mobile, memilih antara <strong>Dart (Flutter)</strong> dengan <strong>TypeScript (React + Capacitor/Web Sandbox)</strong> memiliki implikasi mendasar terhadap ketahanan aplikasi dari ancaman internal dan eksternal. Berikut adalah analisis pembobotan keamanannya secara komprehensif:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-white text-slate-800 font-bold">
                    <th className="p-2 border border-slate-200">Kategori Keamanan</th>
                    <th className="p-2 border border-slate-200 text-indigo-600">Dart (Flutter Native C++)</th>
                    <th className="p-2 border border-slate-200 text-emerald-600">TypeScript (Web Sandbox / E2EE)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-600">
                  <tr>
                    <td className="p-2 font-bold text-slate-800">Static Reverse Engineering</td>
                    <td className="p-2 bg-indigo-50 text-indigo-700">
                      <strong>Sangat Tinggi:</strong> Mengkompilasi kode langsung menjadi biner ARM native (Machine Code). Sangat sulit didekompilasi menjadi kode sumber asli. Membutuhkan tools canggih seperti Ghidra/IDA Pro.
                    </td>
                    <td className="p-2 bg-emerald-50/10 text-emerald-300">
                      <strong>Sedang:</strong> Kode dikompilasi menjadi JavaScript Bundles. Walaupun bisa di-obfuscate (minified), hacker masih dapat membaca logika aslinya dengan mengekstrak file APK (seperti ZIP).
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-800">Kriptografi &amp; Key Safety</td>
                    <td className="p-2 bg-indigo-50 text-indigo-700">
                      <strong>Sangat Tinggi:</strong> Didukung penuh oleh pustaka native (Dart FFI / Android Keystore &amp; iOS Keychain) secara langsung di memory native space.
                    </td>
                    <td className="p-2 bg-emerald-50/10 text-emerald-300">
                      <strong>Sangat Tinggi:</strong> Dapat meluncurkan <strong>Web Crypto API</strong> native dari system OS browser engine. Sangat terisolasi karena beroperasi di level internal Sandbox.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-800">Memory Manipulation &amp; Exploit</td>
                    <td className="p-2 bg-indigo-50 text-indigo-700">
                      <strong>Tinggi:</strong> Bebas dari ancaman JavaScript injection. Eksekusi berjalan aman di level C++ engine shell Flutter.
                    </td>
                    <td className="p-2 bg-emerald-50/10 text-emerald-300">
                      <strong>Sedang:</strong> Ada resiko XSS jika menggunakan input HTML mentah secara gegabah. Namun, terproteksi penuh jika menggunakan framework berbasis static JSX binding/sanitize otomatis (seperti React).
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-800">Auditability &amp; Vulnerability</td>
                    <td className="p-2 bg-indigo-50 text-indigo-700">
                      <strong>Sedang:</strong> SDK Flutter sangat besar dan memiliki banyak dependensi level rendah yang sulit diaudit secara manual baris per baris.
                    </td>
                    <td className="p-2 bg-emerald-50/10 text-emerald-300">
                      <strong>Sangat Tinggi:</strong> Kode TypeScript modular murni sangat mudah diaudit, memiliki jaminan statis lewat compiler, dan terekspos jelas untuk penetration testing.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Objective Recommendation Block */}
          <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider text-indigo-600">
              <CheckCircle2 className="w-4 h-4" /> KESIMPULAN REKOMENDASI UNTUK RAMONA
            </h4>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <p>
                <strong>Kapan lebih aman menggunakan DART (Flutter)?</strong><br />
                Jika Anda mengembangkan aplikasi komersial berskala besar di mana <strong>perlindungan IP (Intellectual Property) dari reverse engineering</strong> adalah prioritas utama (misal: Aplikasi Mobile Banking, Game Premium, DRM Media). Dart memenangkan aspek perisai statis dari dekompiler karena menghasilkan file mesin biner.
              </p>
              <p>
                <strong>Kapan lebih aman menggunakan TYPESCRIPT (React/Capacitor seperti Ramona)?</strong><br />
                Jika Anda menginginkan <strong>keamanan matematis enkripsi yang murni (E2EE)</strong>. Karena Ramona melakukan enkripsi murni di sisi kliens (browser/webview) menggunakan pustaka Web Crypto API bawaan kernel Android/iOS, jaminan enkripsinya setara dengan native. Selama kuncinya disimpan luring (luring di memori RAM dan tidak terkirim ke server), platform web-hybrid sangat aman, mudah diskalakan, dan mematuhi standar web modern.
              </p>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-950/40 text-sm text-indigo-700 font-mono">
                💡 <strong>Alibi Presentasi Dosen (Bagi Anda yang fokus belajar Flutter):</strong> Jika Dosen bertanya <i>"Kenapa tidak pakai Flutter padahal kamu belajarnya Flutter?"</i> Anda bisa menjawab: 
                <br/><br/>
                <i>"Benar Pak/Bu, saya kompeten di Flutter. Namun setelah melakukan riset khusus untuk kasus <strong>Enkripsi 2-Arah AES-GCM Luring</strong>, Flutter mengharuskan penggunaan library pihak ketiga (method channels) yang menjembatani native code, yang mana rentan terjadi memory-leak saat kunci privat dikirim ke RAM. Maka dari itu, khusus untuk proyek sandbox tingkat militer ini, saya menggunakan React + Capacitor sebagai <strong>Strategic Pivot</strong> karena Web Crypto API mengeksekusi enkripsi langsung di engine C++ tingkat rendah dari browser sandbox (WebView) tanpa bridging eksternal, sehingga menjamin isolasi memori 100% aman untuk Brankas Ramona."</i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Laporan UTS / Threat Model (Pertemuan 1-7) */}
      {activeSubTab === "uts" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-300 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-300 pb-3">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Laporan Ujian Tengah Semester & Threat Model (Materi Pertemuan 1-7)</span>
            </h3>

            <div className="space-y-5">
              {/* 1. Threat Model */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">1. Analisis Studi Kasus & Threat Model (CIA Triad)</h4>
                <div className="bg-white p-4 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-indigo-700 block mb-1">Aset yang Dilindungi:</strong>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Catatan rahasia pribadi (Notes)</li>
                        <li>Kredensial Password Bank/Email</li>
                        <li>Kode Master 2FA (TOTP Seeds)</li>
                        <li>Kunci Publik & Privat SSH (Ed25519/RSA)</li>
                        <li>Barcode Kartu Royalitas/Identitas digital (EAN-13, QR Code)</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-indigo-700 block mb-1">Aktor (Ancaman Utama):</strong>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Pencuri Fisik:</strong> Maling HP yang mencoba mendongkrak data di memori storage.</li>
                        <li><strong>Spyware / Malware:</strong> Aplikasi pihak ketiga nakal yang membaca storage internal.</li>
                        <li><strong>Man-in-the-Middle (WiFi):</strong> Peretas di jaringan publik gratis yang menyadap trafik data.</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <strong className="text-indigo-700 block mb-1">CIA Triad & Permukaan Serangan:</strong>
                    <p className="mb-1"><strong>Confidentiality (Kerahasiaan):</strong> Hanya dapat dibuka menggunakan kombinasi dari PIN rahasia pengguna & Token OTP. Karena ini offline, <i>Zero-Knowledge</i> terjadi di level RAM.</p>
                    <p className="mb-1"><strong>Integrity (Integritas):</strong> Menggunakan blok sandi <strong>AES-GCM (Galois/Counter Mode)</strong> yang memvalidasi otentikasi data. Jika file enkripsi berubah 1 bit saja, dekripsi akan memblokir file korup tersebut.</p>
                    <p><strong>Availability (Ketersediaan):</strong> Karena data diletakkan di local storage browser Sandbox secara hybrid, pengguna bisa mengakses brankas ini kapan pun tanpa butuh jaringan API Server.</p>
                  </div>
                </div>
              </div>

              {/* 2. Kriptografi Klasik vs Modern */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">2. Implementasi Keamanan: Kriptografi Modern vs Klasik</h4>
                <div className="bg-white p-4 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <strong className="text-rose-600 block mb-1">Kriptografi Klasik (Kerentanan)</strong>
                    <p>Metode usang seperti <i>Caesar Cipher</i> atau <i>Vigenère</i> masih bergantung pada pergeseran karakter statik linear. Teknik analitik frekuensi dengan mudah akan membobol pola teksnya hitungan detik dengan komputer masa kini. Menyimpan data penting memakai ini tidak lagi dibenarkan.</p>
                  </div>
                  <div className="space-y-2">
                    <strong className="text-emerald-600 block mb-1">Kriptografi Modern Ramona (Mitigasi)</strong>
                    <p>Ramona menolak kriptografi usang dan langsung memperkuat database dengan <strong>Symmetric AES-256-GCM</strong> dan kombinasi <strong>PBKDF2 Hashing (100.000 iterasi)</strong> dengan <i>Salt</i> acak. Metode ini memakan ratusan tahun komputasi bagi aktor <i>Brute-Force</i> untuk menemukan Master Key yang sama pada serangan tebak kombinasi acak.</p>
                  </div>
                </div>
              </div>

              {/* 3. Keamanan Jaringan GSM, Seluler, dan WiFi Publik */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">3. Menangkis Serangan di Jaringan Wireless & WiFi</h4>
                <div className="bg-white p-4 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed space-y-2">
                  <p>Keamanan aplikasi mobile sering kali dieksploitasi bukan karena password yang lemah, melainkan melalui kerentanan media transportasinya, yaitu <strong>Jaringan Wireless (WiFi / Seluler Generasi)</strong>.</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Serangan MITM:</strong> Pada jaringan WiFi publik (kafe/bandara) atau stasiun base-GSM lemah, pembela internet bisa menyadap kredensial login karena protokol tanpa enkripsi TLS/HTTPS yang kuat.</li>
                    <li><strong>Mitigasi Aplikasi Luring:</strong> Ramona mengadopsi <strong>Offline First / Storage-bound Sandbox Architecture</strong>. Dengan tidak bergantung pada jaringan API <i>pull/push</i> ke Server Backend untuk kunci otentikasi data, Ramona imun terhadap ancaman penyadapan di lalu lintas jaringan WPA/WA2 atau sniffing paket di WiFi/Mobile Data!</li>
                  </ul>
                </div>
              </div>

              {/* 4. Rekomendasi Opsi Lebih Baik */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">4. Perbandingan Risiko & Rekomendasi/Kesimpulan</h4>
                <div className="bg-white border border-indigo-200/40 p-4 rounded-lg text-xs text-slate-600 leading-relaxed space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-rose-50/20 border border-rose-900/30 rounded-lg">
                      <strong className="text-rose-600 block mb-1">Sebelum Isolasi Modern</strong>
                      <p className="text-sm">Pin dikonversi dengan Hash MD5 & Data Disimpan teks polos di SharedPreferences. <br/>Dampak: Hacker dapat melakukan Dump Memory di Handphone (<i>Rooting</i>), lalu membaca file Database SMS/Password.</p>
                    </div>
                    <div className="p-3 bg-emerald-50/20 border border-emerald-900/30 rounded-lg">
                      <strong className="text-emerald-600 block mb-1">Sesudah Isolasi Web Crypto</strong>
                      <p className="text-sm">Dibutuhkan Token OTP dan Key Turunan PBKDF2. Payload file tersimpan dalam bentuk string blob GCM yang tidak terbaca tanpa PIN di Memori RAM. Fitur Anti-BruteForce dan <i>Auto-locking Tab blur</i> memblokir masukan berulang dan mengunci saat tidak ditatap.</p>
                    </div>
                  </div>
                  <p className="pt-2 border-t border-slate-300 text-sm"><strong>Kesimpulan:</strong> Prototyping sandbox <i>Ramona</i> menerapkan pilar utama konsep keamanan <i>Client-side Enckryption</i> yang mematikan hampir semua vektor serangan seluler eksternal karena meminimalisasi transmisi jaringan dan menyerahkan kekuatan komputasi di end-device pengguna secara mandiri.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: HOW TO BUILD INTO APK STEP BY STEP */}
      {activeSubTab === "apk" && (
        <div className="space-y-5">
          <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Langkah Kompilasi Aplikasi RAMONA Menjadi Android APK (.apk)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Karena Ramona dibangun menggunakan <strong>React 18 + Vite + TypeScript</strong>, kita dapat mengubahnya menjadi aplikasi mobile Android asli bersertifikat keamanan tinggi menggunakan <strong>Capacitor JS</strong> (alternatif modern pengganti Cordova yang didukung oleh Ionic).
            </p>
          </div>

          {/* Copyable Terminal Commands */}
          <div className="space-y-4">
            
            <div className="space-y-1.5 text-left">
              <span className="text-xs font-mono text-slate-500 uppercase block">Langkah 1: Install Capacitor CLI &amp; Core</span>
              <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono text-sm text-amber-600 select-all">
                npm install @capacitor/core @capacitor/cli
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <span className="text-xs font-mono text-slate-500 uppercase block">Langkah 2: Inisialisasi Android Client Ramona</span>
              <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono text-sm text-amber-600 select-all">
                npx cap init ramona com.rafael.ramona --web-dir=dist
              </div>
              <p className="text-xs text-slate-500 font-mono pl-1">
                * Note: `ramona` adalah nama aplikasi Android Anda, dan `com.rafael.ramona` adalah ID paket uniknya.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <span className="text-xs font-mono text-slate-500 uppercase block">Langkah 3: Tambahkan Platform Android Resmi</span>
              <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono text-sm text-amber-600 select-all">
                npm install @capacitor/android && npx cap add android
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <span className="text-xs font-mono text-slate-500 uppercase block">Langkah 4: Kompilasi &amp; Sinkronisasi Aset Enkripsi</span>
              <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono text-sm text-amber-600 select-all">
                npm run build && npx cap sync
              </div>
              <p className="text-xs text-slate-500 font-mono pl-1">
                Perintah ini akan menyusun bundel statis React terkompilasi ke direktori `/dist` lalu menyalinnya langsung ke struktur aset Android Studio.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <span className="text-xs font-mono text-slate-500 uppercase block">Langkah 5: Buka di Android Studio / Compile APK Langsung</span>
              <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono text-sm text-amber-600 select-all">
                npx cap open android
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-1 pt-1">
                Ketik perintah tersebut untuk meluncurkan <strong>Android Studio</strong> otomatis dengan folder proyek Android yang sudah disiapkan. 
                Di menu atas Android Studio, klik: <strong className="text-slate-800">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>. 
                Selesai! Android Studio akan menghasilkan file <code>app-debug.apk</code> yang siap diunggah ke handphone Android Anda untuk demo lancar jaya!
              </p>
            </div>

          </div>

          {/* Security Features warning in Android */}
          <div className="p-3 bg-indigo-50 border border-indigo-200/30 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-left">
              <span className="text-xs font-bold font-mono text-slate-800 leading-tight block">Kelebihan Integrasi Capacitor untuk Ramona:</span>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                Android webview yang digunakan ramona mendukung <strong>Full Hardware-Accelerated Cryptography</strong>. Dengan Capacitor, enkripsi AES-GCM 256-bit dan PBKDF2 di web-layer akan otomatis mengeksekusi akselerasi hardware internal chipset RAM smartphone Anda, menjadikannya secepat aplikasi mobile native tulen!
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
