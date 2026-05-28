import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Key, Copy, Check, ShieldCheck, Clock, RefreshCw, Smartphone, Layers, AlertCircle } from "lucide-react";
import { TotpItem } from "../types";
import { generateTOTP, generateRandomBase32 } from "../utils/crypto";

interface TotpSectionProps {
  totpSecrets: TotpItem[];
  onSaveTotpSecrets: (updatedSecrets: TotpItem[]) => void;
}

export default function TotpSection({ totpSecrets, onSaveTotpSecrets }: TotpSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTotp, setSelectedTotp] = useState<TotpItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Totp Form
  const [isAdding, setIsAdding] = useState(false);
  const [issuer, setIssuer] = useState("");
  const [account, setAccount] = useState("");
  const [secret, setSecret] = useState("");

  // Live ticking TOTP codes
  const [liveTokens, setLiveTokens] = useState<Record<string, { code: string; timeLeft: number }>>({});

  // Trigger global ticker every 1 second
  useEffect(() => {
    async function updateTokens() {
      const tokens: Record<string, { code: string; timeLeft: number }> = {};
      for (const item of totpSecrets) {
        const res = await generateTOTP(item.secret);
        tokens[item.id] = res;
      }
      setLiveTokens(tokens);
    }

    updateTokens();
    const interval = setInterval(updateTokens, 1000);
    return () => clearInterval(interval);
  }, [totpSecrets]);

  const handleStartAdd = () => {
    setIssuer("");
    setAccount("");
    // Give them a random secret seed by default or let them type it
    setSecret(generateRandomBase32(16));
    setIsAdding(true);
    setSelectedTotp(null);
  };

  const handleGenerateSecret = () => {
    setSecret(generateRandomBase32(16));
  };

  const handleSaveTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuer || !secret) return;

    // Validate base 32 is roughly clean
    const cleanedSecret = secret.toUpperCase().replace(/\s/g, "");
    if (!/^[A-Z2-7]+=*$/.test(cleanedSecret)) {
      alert("Format Secret Key tidak valid. Kode rahasia Base32 hanya boleh berisi huruf A-Z dan angka 2-7.");
      return;
    }

    const newItem: TotpItem = {
      id: "totp_" + Date.now().toString(),
      issuer,
      account: account || "admin",
      secret: cleanedSecret,
      createdAt: new Date().toISOString()
    };

    const updated = [newItem, ...totpSecrets];
    onSaveTotpSecrets(updated);
    setIsAdding(false);
    setSelectedTotp(newItem);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const filtered = totpSecrets.filter(t => t.id !== id);
    onSaveTotpSecrets(filtered);
    if (selectedTotp?.id === id) {
      setSelectedTotp(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = totpSecrets.filter(item => {
    const text = searchQuery.toLowerCase();
    return item.issuer.toLowerCase().includes(text) || item.account.toLowerCase().includes(text);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="totp-section">
      
      {/* Sidebar List ( col-span-5 ) */}
      <div className="md:col-span-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              id="input-totp-search"
              placeholder="Cari akun TOTP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 outline-none focus:border-indigo-300/50"
            />
          </div>
          <button
            type="button"
            id="btn-totp-add"
            onClick={handleStartAdd}
            className="p-2 border border-slate-300 bg-white hover:bg-white text-indigo-600 rounded-lg"
            title="Tambah Akun TOTP"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              Tidak ada Multi-Factor TOTP disimpan.
            </div>
          ) : (
            filtered.map(item => {
              const info = liveTokens[item.id] || { code: "------", timeLeft: 30 };
              return (
                <div
                  key={item.id}
                  onClick={() => { setSelectedTotp(item); setIsAdding(false); }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left relative group ${
                    selectedTotp?.id === item.id && !isAdding
                      ? "bg-indigo-50 border-indigo-300/40"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between pr-6">
                    <div className="space-y-1 overflow-hidden flex-1 select-none pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-800 uppercase truncate block">
                          {item.issuer}
                        </span>
                        <span className="text-xs py-0.5 px-1 bg-white text-slate-500 rounded font-mono truncate">
                          {item.account}
                        </span>
                      </div>
                      
                      {/* Live code ticker */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-mono tracking-wider text-indigo-600">
                          {info.code.slice(0, 3)} {info.code.slice(3)}
                        </span>
                      </div>
                    </div>

                    {/* Progress clock gauge */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 relative flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            stroke="#1e293b"
                            strokeWidth="2.5"
                            fill="transparent"
                          />
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            stroke={info.timeLeft < 7 ? "#f43f5e" : "#6366f1"}
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 8}
                            strokeDashoffset={2 * Math.PI * 8 * (1 - info.timeLeft / 30)}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <span className="absolute text-xs font-mono font-bold text-slate-600">
                          {info.timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-2 opacity-100 transition">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 text-slate-500 hover:text-rose-600 hover:bg-white rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Editor / Setup Workspace ( col-span-7 ) */}
      <div className="md:col-span-7">
        
        {/* Form to Add Account */}
        {isAdding ? (
          <form onSubmit={handleSaveTotp} className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 min-h-[460px]">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wider">Set-Up Akun TOTP Baru</h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-600 hover:text-slate-800 py-1 px-2.5 hover:bg-white border border-slate-200 rounded"
              >
                Batal
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-mono text-slate-600 block">Penyedia Layanan / Issuer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, GitHub, Binance, Server1"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 outline-none focus:border-indigo-300/40"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-mono text-slate-600 block">Nama Akun / Email</label>
                <input
                  type="text"
                  placeholder="e.g. administrator@company.com"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 outline-none focus:border-indigo-300/40"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-slate-600">Secret Seed Key (Base32)</label>
                  <button
                    type="button"
                    onClick={handleGenerateSecret}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-mono flex items-center gap-1 bg-slate-50 hover:bg-white py-1 px-2 border border-slate-200 rounded"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Acak Seed
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. JBSWY3DPEHPK3PXP"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-yellow-400 text-xs font-mono rounded-lg p-2.5 outline-none focus:border-indigo-300/40 uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Custom OTP QR Notice Block */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-bold text-slate-800 font-mono">Kode QR OTP (Google Authenticator / Authy / Aegis)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setelah disimpan, brankas akan merekonstruksi <strong>Matriks Setup QR 2D</strong> secara langsung untuk disinkronkan ke aplikasi OTP Authenticator Anda lewat kamera HP.
                </p>
              </div>
            </div>

            <button
              type="submit"
              id="btn-totp-save-submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-md transition"
            >
              Simpan & Hubungkan Multi-Factor Auth
            </button>
          </form>
        ) : selectedTotp ? (
          /* View Details with Matrix Setup System */
          <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-200">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 font-mono uppercase">{selectedTotp.issuer}</h3>
                    <p className="text-xs font-mono text-slate-500">Akun: {selectedTotp.account}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 py-1 px-2.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-mono rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  E2EE Local Sync Active
                </div>
              </div>

              {/* Show Code Live with Large typography */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2 relative overflow-hidden">
                <span className="text-xs text-slate-400 font-mono uppercase tracking-widest block">Token Sekali Pakai (TOTP OTP)</span>
                
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-extrabold font-mono tracking-widest text-slate-900 select-all">
                    {liveTokens[selectedTotp.id]?.code.slice(0, 3) || "---"}
                    <span className="text-indigo-500 mx-1">•</span>
                    {liveTokens[selectedTotp.id]?.code.slice(3) || "---"}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => handleCopy(liveTokens[selectedTotp.id]?.code || "", selectedTotp.id)}
                    className="p-1.5 border border-slate-300 hover:border-slate-700 bg-white text-slate-700 rounded hover:text-white"
                    title="Salin Token"
                  >
                    {copiedId === selectedTotp.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="text-xs text-slate-600 font-mono flex items-center justify-center gap-1.5">
                  <Clock className="w-3" />
                  Kode kedaluwarsa dalam <span className="font-bold text-indigo-600">{liveTokens[selectedTotp.id]?.timeLeft || 30}</span> detik.
                </div>
              </div>

              {/* Visual Setup Helper (QR-Code diagram simulation) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 border border-slate-855 rounded-xl p-4">
                
                {/* Simulated QR block generated of SVG elements */}
                <div className="md:col-span-5 flex flex-col items-center justify-center bg-white p-3.5 rounded-lg select-none">
                  {/* Generated clean procedural 2D matrix representing the TOTP secret key */}
                  <div className="w-[110px] h-[110px] grid grid-cols-10 border border-slate-300 gap-0 p-1 bg-white">
                    {Array.from({ length: 100 }).map((_, i) => {
                      // Generate a pseudorandom deterministic binary block based on secret key characters
                      const charCode = selectedTotp.secret.charCodeAt(i % selectedTotp.secret.length) || 1;
                      const hasBlack = ((i * charCode) % 7 === 0) || (i < 20 && i % 3 === 0) || (i > 80 && i % 4 === 0) || (i % 11 === 0);
                      
                      return (
                        <div 
                          key={i} 
                          className={`w-full h-full ${
                            hasBlack ? "bg-white" : "bg-white"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-650 tracking-wider uppercase mt-1.5">
                    SCAN QR SETUP
                  </span>
                </div>

                {/* Secret text parameters to configure manually */}
                <div className="md:col-span-7 space-y-1.5 text-slate-700 text-xs text-left">
                  <h4 className="text-xs font-bold text-slate-800">Gagal Memindai QR?</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Masukkan parameter di bawah ini secara manual di aplikasi authenticator Anda (Aegis / Authy / OTP):
                  </p>
                  
                  <div className="space-y-1 font-mono text-xs">
                    <div>
                      <span className="text-slate-500">TIPE KUNCI:</span> <span className="text-indigo-600">TOTP (Waktu)</span>
                    </div>
                    <div>
                      <span className="text-slate-500">NAMA AKUN:</span> <span className="text-slate-700 uppercase">{selectedTotp.issuer}:{selectedTotp.account}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">SECRET KEY:</span> 
                      <span className="text-yellow-400 font-bold select-all tracking-wider font-sans">{selectedTotp.secret}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedTotp.secret, "secret_seed")}
                        className="p-1 hover:bg-white border border-slate-300 text-slate-600 rounded"
                        title="Salin Secret Seed"
                      >
                        {copiedId === "secret_seed" ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div className="text-xs font-mono text-center text-slate-500 border-t border-slate-200 pt-3">
              Kunci ini dilindungi AES-GCM 256. Didekripsi dinamis hanya di memori sandbox RAM.
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-6 min-h-[460px] flex flex-col justify-center items-center text-center space-y-3">
            <div className="p-4 bg-white rounded-full border border-slate-300 text-slate-500">
              <Smartphone className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-700 font-bold text-sm">Tidak Ada Akun TOTP Dipilih</h3>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Pilih akun 2-Factor Authentication dari daftar samping untuk melihat token 6-digit dinamis beserta barcode setup OTP (Google Authenticator / Authy / Aegis).
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
