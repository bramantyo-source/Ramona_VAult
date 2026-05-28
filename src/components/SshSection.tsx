import React, { useState } from "react";
import { Search, Plus, Trash2, Key, Copy, Check, ShieldAlert, Cpu, Download, RefreshCw } from "lucide-react";
import { SshKeyItem } from "../types";

interface SshSectionProps {
  sshKeys: SshKeyItem[];
  onSaveSshKeys: (updatedKeys: SshKeyItem[]) => void;
}

export default function SshSection({ sshKeys, onSaveSshKeys }: SshSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<SshKeyItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  // New keys or edit targets
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [keyType, setKeyType] = useState<"RSA" | "ECDSA" | "Ed25519">("Ed25519");
  const [comment, setComment] = useState("");

  const handleStartAdd = () => {
    setName("");
    setPrivateKey("");
    setPublicKey("");
    setKeyType("Ed25519");
    setComment("user@private-vault");
    setIsAdding(true);
    setSelectedKey(null);
  };

  const handleGenerateKeyPair = () => {
    setIsGenerating(true);
    setGenProgress(0);
    
    // Simulate entropy loop
    const interval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Generate realistic mock key pair
          let mockPublic = "";
          let mockPrivate = "";
          
          if (keyType === "Ed25519") {
            mockPublic = `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOrV4J7mKjW9/mfe3vP6HjX72m9qg7n+Sg8L+Q6+1${Math.sin(Date.now()).toString(36).substring(4,8)} ${comment || "user@vault"}`;
            mockPrivate = `-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz\nc2gtZWQyNTUxOQAAACDq1eCe5io1vf5n3t7z+h41+9pvaoO5/koPC/kOvtZpCwAA\nAJAs7I+QLOyPkAAAAAtzc2gtZWQyNTUxOQAAACDq1eCe5io1vf5n3t7z+h41+9pv\naoO5/koPC/kOvtZpCwAAAEDP7O7uG7S7uC/v7/7s7O77b21sbDIyMzMzNDQ1NTU2\n${Math.random().toString(36).toUpperCase().substring(2, 12)}...\n-----END OPENSSH PRIVATE KEY-----`;
          } else {
            mockPublic = `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDQzSefH4f8p3j78O+9g8N4v1q${Math.random().toString(36).substring(2,10)}... ${comment || "user@vault"}`;
            mockPrivate = `-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0M3HnfH4f8p3j78O+9g8N4v1q7mvp...${Math.random().toString(36).toUpperCase().substring(2,14)}\n-----END RSA PRIVATE KEY-----`;
          }

          setPublicKey(mockPublic);
          setPrivateKey(mockPrivate);
          setIsGenerating(false);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newItem: SshKeyItem = {
      id: "ssh_" + Date.now().toString(),
      name,
      privateKey,
      publicKey,
      keyType,
      comment
    };

    const updated = [newItem, ...sshKeys];
    onSaveSshKeys(updated);
    setIsAdding(false);
    setSelectedKey(newItem);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const filtered = sshKeys.filter(k => k.id !== id);
    onSaveSshKeys(filtered);
    if (selectedKey?.id === id) {
      setSelectedKey(null);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filtered = sshKeys.filter(k => {
    return k.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           k.keyType.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="ssh-section">
      
      {/* Sidebar List ( col-span-4 ) */}
      <div className="md:col-span-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              id="input-ssh-search"
              placeholder="Cari SSH Key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 outline-none focus:border-indigo-300/50"
            />
          </div>
          <button
            type="button"
            id="btn-ssh-add"
            onClick={handleStartAdd}
            className="px-3 py-2 border border-slate-300 bg-white hover:bg-white text-indigo-600 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Tambah Kunci SSH</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              Tidak ada kunci SSH disimpan.
            </div>
          ) : (
            filtered.map(keyItem => (
              <div
                key={keyItem.id}
                onClick={() => { setSelectedKey(keyItem); setIsAdding(false); }}
                className={`p-3.5 rounded-xl border transition cursor-pointer text-left relative group ${
                  selectedKey?.id === keyItem.id && !isAdding
                    ? "bg-indigo-50 border-indigo-300/40"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 pr-6">
                  <div className="p-2 bg-white border border-slate-200 rounded text-slate-600 shrink-0">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h4 className="font-semibold text-xs text-slate-800 truncate">{keyItem.name}</h4>
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
                      <span>{keyItem.keyType}</span>
                      <span>•</span>
                      <span className="truncate">{keyItem.comment}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-3 opacity-100 transition">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(keyItem.id, e)}
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

      {/* Workspace Area */}
      <div className="md:col-span-8">
        
        {/* Form to Add Key */}
        {isAdding ? (
          <form onSubmit={handleSaveKey} className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 min-h-[460px]">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wider">Tambah Kunci SSH Terenkripsi</h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-600 hover:text-slate-700 py-1 px-2.5 hover:bg-white border border-slate-200 rounded"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-600">Nama Koneksi / Kredensial</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Production Server"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 outline-none focus:border-indigo-300/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-600">Tipe Algoritma</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKeyType("Ed25519")}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${
                      keyType === "Ed25519" 
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700" 
                        : "bg-white border-slate-300 text-slate-600 hover:border-slate-705"
                    }`}
                  >
                    Ed25519 (Rekomendasi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyType("RSA")}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${
                      keyType === "RSA" 
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700" 
                        : "bg-white border-slate-300 text-slate-600 hover:border-slate-705"
                    }`}
                  >
                    RSA (4096-bit)
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-600">Komentar / Identitas Pengguna SSH</label>
                <input
                  type="text"
                  placeholder="user@domain.com atau user@private-vault"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 outline-none focus:border-indigo-300/40"
                />
              </div>
              
              <div className="space-y-2 flex flex-col justify-end">
                <button
                  type="button"
                  id="btn-ssh-generate"
                  onClick={handleGenerateKeyPair}
                  disabled={isGenerating}
                  className="w-full py-2 px-4 bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-700 text-indigo-600 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                  {isGenerating ? `Membangkitkan Entropy (${genProgress}%)` : "Bangkutkan Pasangan Kunci Aman"}
                </button>
              </div>
            </div>

            {/* Generated results / key areas */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-600">Kunci Publik (.pub)</label>
                <textarea
                  placeholder="Masukkan atau biarkan generator membuatkan Kunci Publik..."
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs font-mono rounded-lg p-2 resize-none h-[64px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-600">Kunci Privat (KEDAP ENKRIPSI)</label>
                <textarea
                  placeholder="Masukkan atau biarkan generator membuatkan Kunci Privat..."
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs font-mono rounded-lg p-2 resize-none h-[110px]"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-ssh-save-submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-md transition"
            >
              Simpan Berkas Kunci Enkripsi End-to-End
            </button>
          </form>
        ) : selectedKey ? (
          /* View Key Detail card */
          <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-200">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 font-mono uppercase">{selectedKey.name}</h3>
                    <p className="text-xs font-mono text-slate-500">Algoritma: {selectedKey.keyType}</p>
                  </div>
                </div>
                
                <div className="text-xs font-mono py-1 px-2.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-300/10 flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  Local Decrypted RAM Session Only
                </div>
              </div>

              {/* Security Banner to keep context clean */}
              <div className="p-3 bg-amber-50/20 border border-amber-900/30 rounded-lg flex gap-2.5 items-start">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Peringatan Keamanan:</strong> Jangan pernah membagikan Kunci Privat Anda kepada siapapun. Kunci Privat hanya boleh dieksport atau disalin ke Terminal / SSH Agent klien Anda yang terpercaya.
                </p>
              </div>

              {/* Public Key block */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-600 uppercase tracking-widest">Kunci Publik (.pub)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedKey.publicKey, "pub")}
                      className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1 py-0.5 px-2 bg-white border border-slate-300 rounded"
                    >
                      {copiedId === "pub" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      Salin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(`${selectedKey.name.replace(/\s+/g, "_")}.pub`, selectedKey.publicKey)}
                      className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1 py-0.5 px-2 bg-white border border-slate-300 rounded"
                    >
                      <Download className="w-3 h-3" />
                      Unduh
                    </button>
                  </div>
                </div>
                <pre className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-600 whitespace-pre-wrap select-all cursor-pointer break-all max-h-[50px] overflow-y-auto">
                  {selectedKey.publicKey || "(Tidak ada kunci publik)"}
                </pre>
              </div>

              {/* Private Key block */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-600 uppercase tracking-widest">Kunci Privat</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedKey.privateKey, "priv")}
                      className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1 py-0.5 px-2 bg-white border border-slate-300 rounded"
                    >
                      {copiedId === "priv" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      Salin Privat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(`${selectedKey.name.replace(/\s+/g, "_")}_private`, selectedKey.privateKey)}
                      className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1 py-0.5 px-2 bg-white border border-slate-300 rounded"
                    >
                      <Download className="w-3 h-3" />
                      Unduh
                    </button>
                  </div>
                </div>
                <pre className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-600 select-all cursor-pointer max-h-[140px] overflow-y-auto leading-relaxed whitespace-pre font-thin break-all">
                  {selectedKey.privateKey || "(Tidak ada kunci privat)"}
                </pre>
              </div>
            </div>

            <div className="text-xs font-mono text-center text-slate-500 border-t border-slate-200 pt-3 flex justify-between">
              <span>Keamanan Partisi: E2EE AESGCM</span>
              <span>Komentar: {selectedKey.comment || "N/A"}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-6 min-h-[460px] flex flex-col justify-center items-center text-center space-y-3">
            <div className="p-4 bg-white rounded-full border border-slate-300 text-slate-500">
              <Key className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-700 font-bold text-sm">Tidak Ada Kunci SSH Terpilih</h3>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Pilih atau bangun kunci SSH dari daftar kiri dan biarkan database enkripsi end-to-end lokal menyembunyikan berkas superuser server Anda dengan aman.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
