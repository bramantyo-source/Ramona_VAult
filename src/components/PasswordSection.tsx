import React, { useState } from "react";
import { Search, Plus, Trash2, Eye, EyeOff, Copy, Check, Shield, Key, ExternalLink, RefreshCw, Sparkles, FolderClosed } from "lucide-react";
import { PasswordItem } from "../types";

interface PasswordSectionProps {
  passwords: PasswordItem[];
  onSavePasswords: (updatedPasswords: PasswordItem[]) => void;
}

export default function PasswordSection({ passwords, onSavePasswords }: PasswordSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PasswordItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealPassword, setRevealPassword] = useState<boolean>(false);

  // Form parameters
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<"Sosial" | "Keuangan" | "Server" | "Kerja" | "Lainnya">("Lainnya");

  // Generator states
  const [genLength, setGenLength] = useState(16);
  const [genUpper, setGenUpper] = useState(true);
  const [genLower, setGenLower] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);

  const startAddNew = () => {
    setTitle("");
    setWebsite("");
    setUsername("");
    setPasswordText("");
    setNotes("");
    setCategory("Lainnya");
    setIsAdding(true);
    setSelectedItem(null);
  };

  const handleGeneratePassword = () => {
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowers = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let pool = "";
    if (genUpper) pool += uppers;
    if (genLower) pool += lowers;
    if (genNumbers) pool += numbers;
    if (genSymbols) pool += symbols;

    if (!pool) pool = lowers + numbers; // fallback

    let generated = "";
    const values = new Uint8Array(genLength);
    window.crypto.getRandomValues(values);
    
    for (let i = 0; i < genLength; i++) {
      generated += pool.charAt(values[i] % pool.length);
    }

    setPasswordText(generated);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !username || !passwordText) return;

    const newItem: PasswordItem = {
      id: "pass_" + Date.now().toString(),
      title,
      website: website || undefined,
      username,
      passwordEncrypted: "", // Handled inside primary wrapper
      passwordText,
      notes: notes || undefined,
      category
    };

    const updated = [newItem, ...passwords];
    onSavePasswords(updated);
    setIsAdding(false);
    setSelectedItem(newItem);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const filtered = passwords.filter(p => p.id !== id);
    onSavePasswords(filtered);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "Nihil", color: "bg-slate-100 text-slate-500", rawColor: "text-slate-500" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 14) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, text: "Sangat Lemah", color: "bg-rose-50/40 text-rose-600 border-rose-500/20", rawColor: "text-rose-600" };
    if (score <= 4) return { score, text: "Sedang", color: "bg-amber-50/40 text-amber-600 border-amber-500/20", rawColor: "text-amber-600" };
    return { score, text: "Kuat (Kebal Brute Force)", color: "bg-emerald-50/40 text-emerald-300 border-emerald-500/20", rawColor: "text-emerald-300" };
  };

  const filtered = passwords.filter(item => {
    const text = searchQuery.toLowerCase();
    const matchQuery = item.title.toLowerCase().includes(text) || 
                      item.username.toLowerCase().includes(text) || 
                      (item.website && item.website.toLowerCase().includes(text));
    
    if (selectedCategory === "Semua") return matchQuery;
    return matchQuery && item.category === selectedCategory;
  });

  const categories = ["Semua", "Sosial", "Keuangan", "Server", "Kerja", "Lainnya"];

  const strength = selectedItem ? checkPasswordStrength(selectedItem.passwordText) : null;
  const currentStrength = isAdding ? checkPasswordStrength(passwordText) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="password-section">
      
      {/* List Sidebar on LHS */}
      <div className="md:col-span-5 space-y-4">
        
        {/* Search and Category Badges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                id="input-password-search"
                placeholder="Cari kredensial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 outline-none focus:border-indigo-300/50"
              />
            </div>
            
            <button
              type="button"
              id="btn-password-add"
              onClick={startAddNew}
              className="p-2 border border-slate-300 bg-white hover:bg-white text-indigo-600 rounded-lg"
              title="Kredensial Baru"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal categories list */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-1 px-2.5 rounded-full text-xs font-mono border transition ${
                  selectedCategory === cat 
                    ? "bg-indigo-50 text-indigo-600 border-indigo-300/30 font-bold" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of items */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              Tidak ada kredensial tersimpan dalam kategori ini.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={() => { setSelectedItem(item); setIsAdding(false); setRevealPassword(false); }}
                className={`p-3 rounded-xl border transition cursor-pointer text-left relative group ${
                  selectedItem?.id === item.id && !isAdding
                    ? "bg-indigo-50 border-indigo-300/40"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 pr-6">
                  <div className="p-2 bg-white border border-slate-200 rounded text-slate-600">
                    <Key className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-xs text-slate-800 truncate">{item.title}</h4>
                      <span className="text-xs font-mono py-0.5 px-1 bg-white text-slate-600 rounded uppercase">
                        {item.category}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-500 truncate">
                      {item.username}
                    </p>
                  </div>
                </div>

                <div className="absolute top-3.5 right-3 opacity-100 transition">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1 text-slate-500 hover:text-rose-600 hover:bg-white rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail / Editor workspace */}
      <div className="md:col-span-7">
        
        {/* Form component to add new items */}
        {isAdding ? (
          <form onSubmit={handleSaveItem} className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 text-left min-h-[460px]">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wider">Set Kredensial Baru</h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-600 hover:text-slate-800 py-1 px-2.5 hover:bg-white border border-slate-200 rounded"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-600 block">Nama Kredensial</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Email Utama, Github Akun"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-101 text-xs rounded-lg p-2 outline-none focus:border-indigo-300/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-600 block">Kategori</label>
                <select
                  id="select-password-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-880 text-slate-101 text-xs rounded-lg p-2 outline-none focus:border-indigo-300/40 font-mono"
                >
                  <option value="Sosial">Media Sosial</option>
                  <option value="Keuangan">Perbankan / Keuangan</option>
                  <option value="Server">Server / Database Access</option>
                  <option value="Kerja">Kantor / Kerja</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-600 block">Username / ID Masuk</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. administrator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-101 text-xs rounded-lg p-2 outline-none focus:border-indigo-300/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-600 block">Alamat Web (Opsional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://github.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-101 text-xs rounded-lg p-2 outline-none focus:border-indigo-300/40"
                />
              </div>
            </div>

            {/* Password input & live strength visual */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-slate-600">Kata Sandi (Password)</label>
                {currentStrength && (
                  <span className={`text-xs font-mono font-bold ${currentStrength.rawColor}`}>
                    Kekuatan: {currentStrength.text}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ketik password atau gunakan pembangun di bawah..."
                  value={passwordText}
                  onChange={(e) => setPasswordText(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 text-indigo-700 text-xs font-mono rounded-lg p-2 outline-none focus:border-indigo-300/40"
                />
              </div>
            </div>

            {/* Random password builder engine */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-sans text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1 text-sm font-mono uppercase tracking-wider">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                Pembangkit Sandi Kuat (Random Generator)
              </span>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600 font-mono">
                  <span>Panjang Karakter:</span>
                  <span className="font-bold text-indigo-600">{genLength} huruf</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={genLength}
                  onChange={(e) => setGenLength(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm font-mono text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genUpper}
                    onChange={(e) => setGenUpper(e.target.checked)}
                    className="rounded text-indigo-505 bg-white border-slate-300"
                  />
                  <span>Huruf Besar (A-Z)</span>
                </label>
                
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genLower}
                    onChange={(e) => setGenLower(e.target.checked)}
                    className="rounded text-indigo-505 bg-white border-slate-300"
                  />
                  <span>Huruf Kecil (a-z)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genNumbers}
                    onChange={(e) => setGenNumbers(e.target.checked)}
                    className="rounded text-indigo-505 bg-white border-slate-300"
                  />
                  <span>Angka (0-9)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genSymbols}
                    onChange={(e) => setGenSymbols(e.target.checked)}
                    className="rounded text-indigo-505 bg-white border-slate-300"
                  />
                  <span>Simbol (!@#)</span>
                </label>
              </div>

              <button
                type="button"
                id="btn-password-gen"
                onClick={handleGeneratePassword}
                className="w-full py-1.5 px-3 border border-indigo-300/20 bg-indigo-50 hover:bg-indigo-50 text-indigo-700 text-sm font-mono rounded flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Bangun Kata Sandi Acak Enkripsi
              </button>
            </div>

            <button
              type="submit"
              id="btn-password-save-submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-md transition"
            >
              Simpan Informasi Sandi Terprotokol
            </button>
          </form>
        ) : selectedItem ? (
          /* View Details card */
          <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-5 min-h-[460px] flex flex-col justify-between text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-200">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 font-mono uppercase">{selectedItem.title}</h3>
                    <span className="text-xs font-mono py-0.5 px-1 bg-white text-slate-600 rounded uppercase">
                      {selectedItem.category}
                    </span>
                  </div>
                </div>

                {strength && (
                  <span className={`text-xs font-mono py-1 px-2.5 border rounded-full ${strength.color}`}>
                    {strength.text}
                  </span>
                )}
              </div>

              {/* Data Blocks */}
              <div className="space-y-3 font-mono text-sm">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block text-xs uppercase">username / ID</span>
                    <span className="text-slate-700 select-all font-semibold break-all">{selectedItem.username}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedItem.username, "uname")}
                    className="p-1 hover:bg-white border border-slate-300 text-slate-600 hover:text-white rounded"
                  >
                    {copiedId === "uname" ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Secure Password display with reveal toggle */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block text-xs uppercase">kata sandi (password)</span>
                    <span className="text-indigo-700 font-bold tracking-wider select-all break-all text-xs">
                      {revealPassword ? selectedItem.passwordText : "••••••••••••••••"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRevealPassword(!revealPassword)}
                      className="p-1 hover:bg-white border border-slate-300 text-slate-600 hover:text-white rounded"
                    >
                      {revealPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedItem.passwordText, "pwd")}
                      className="p-1 hover:bg-white border border-slate-300 text-slate-600 hover:text-white rounded"
                    >
                      {copiedId === "pwd" ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Optional Website linking */}
                {selectedItem.website && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 block text-xs uppercase">Alamat Website</span>
                      <a 
                        href={selectedItem.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        {selectedItem.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Info */}
              {selectedItem.notes && (
                <div className="space-y-1">
                  <span className="text-xs font-mono font-semibold text-slate-500 uppercase block">Catatan Rahasia</span>
                  <div className="bg-white/30 border border-slate-880 rounded-lg p-3 text-xs italic text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedItem.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-center text-slate-500 border-t border-slate-200 pt-3">
              Kredensial ini terenkripsi AES-GCM 256. Didekripsi dinamis hanya di memori sandbox RAM.
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-6 min-h-[460px] flex flex-col justify-center items-center text-center space-y-3">
            <div className="p-4 bg-white rounded-full border border-slate-300 text-slate-500">
              <Key className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-700 font-bold text-sm">Tidak Ada Kredensial Dipilih</h3>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Pilih atau bangun baru set sandi di panel kiri. Sandi Anda disembunyikan menggunakan enkripsi AES-GCM luhur secara client-side, aman dari pencurian database awan.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
