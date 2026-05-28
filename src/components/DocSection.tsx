import React, { useState, useRef } from "react";
import { Search, Plus, Trash2, FileText, Upload, Download, Copy, Check, ShieldAlert, Layers, ShieldCheck } from "lucide-react";
import { DocItem } from "../types";

interface DocSectionProps {
  documents: DocItem[];
  onSaveDocuments: (updatedDocs: DocItem[]) => void;
  encryptPayload: (plaintext: string) => Promise<string>;
  decryptPayload: (ciphertext: string) => Promise<string>;
}

export default function DocSection({ documents, onSaveDocuments, encryptPayload, decryptPayload }: DocSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New file description
  const [description, setDescription] = useState("");

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert and encrypt file base64
  const processAndEncryptFile = async (file: File) => {
    if (!file) return;
    
    // Warn about large files in localStorage
    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ Peringatan Keamanan & Batasan Storage:\nAplikasi terenskripsi end-to-end lokal ini menggunakan penyimpanan sandbox browser luhur (localStorage) dengan kuota ketat 5MB.\nSilakan unggah dokumen berukuran di bawah 2MB agar database Anda tidak penuh.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const rawDataUrl = e.target?.result as string; 
        
        // Encrypt base64 data url directly
        const encryptedData = await encryptPayload(rawDataUrl);

        const newDoc: DocItem = {
          id: "doc_" + Date.now().toString(),
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          dataUrl: encryptedData,
          description: description || undefined,
          uploadedAt: new Date().toISOString()
        };

        const updated = [newDoc, ...documents];
        onSaveDocuments(updated);
        setSelectedDoc(newDoc);
        setDescription("");
        setIsUploading(false);
        alert("🔒 Berkas berhasil dienkripsi luhur (AES-GCM-256) dan dimasukkan ke brankas!");
      } catch (err) {
        console.error("Failed to encrypt document", err);
        alert("Gagal mereduksi dan mengenkripsi berkas.");
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processAndEncryptFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processAndEncryptFile(e.target.files[0]);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const filtered = documents.filter(d => d.id !== id);
    onSaveDocuments(filtered);
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  const handleDownload = async (doc: DocItem) => {
    setIsDecrypting(true);
    try {
      // Decrypt the Base64 stream inside the browser
      const decryptedDataUrl = await decryptPayload(doc.dataUrl);

      // Trigger automatic local transmission of decoded bytes as sandboxed file
      const link = document.createElement("a");
      link.href = decryptedDataUrl;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDecrypting(false);
    } catch (err) {
      console.error("Document decryption failed", err);
      alert("🔒 Dekripsi Fail! PIN Anda tidak valid atau data sandi telah dimanipulasi.");
      setIsDecrypting(false);
    }
  };

  const filtered = documents.filter(doc => {
    return doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="doc-section">
      
      {/* Sidebar List ( col-span-4 ) */}
      <div className="md:col-span-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            id="input-doc-search"
            placeholder="Cari Dokumen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 outline-none focus:border-indigo-300/50"
          />
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              Tidak ada dokumen rahasia terenkripsi.
            </div>
          ) : (
            filtered.map(doc => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-3.5 rounded-xl border transition cursor-pointer text-left relative group ${
                  selectedDoc?.id === doc.id
                    ? "bg-indigo-50 border-indigo-300/40"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 pr-6">
                  <div className="p-2 bg-white border border-slate-200 rounded text-slate-600 shrink-0">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="font-semibold text-xs text-slate-800 truncate">{doc.fileName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>{formatBytes(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{doc.fileType.split("/")[1] || "doc"}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-3 opacity-100 transition">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(doc.id, e)}
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

      {/* Upload & Decryption Workspace ( col-span-8 ) */}
      <div className="md:col-span-8 space-y-4">
        
        {/* Drag and Drop Uploader Card */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition flex flex-col justify-center items-center h-[160px] cursor-pointer ${
            dragActive 
              ? "border-indigo-300 bg-indigo-50" 
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
          onClick={handleSelectFileClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="p-3 bg-white border border-slate-200 rounded-full text-indigo-600 mb-2.5">
            <Upload className={`w-5 h-5 ${isUploading ? "animate-bounce" : ""}`} />
          </div>
          
          <h4 className="text-xs font-bold text-slate-800">
            {isUploading ? "Membaca & Mengenkripsi Berkas..." : "Klik atau seret dokumen ke sini untuk dienkripsi luhur"}
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs font-mono font-bold tracking-tight">
            Kuota Maks: 2MB (E2EE Lokal AES-GCM-256)
          </p>
        </div>

        {/* Selected Document Panel */}
        {selectedDoc ? (
          <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-200">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 font-mono uppercase truncate max-w-[250px]" title={selectedDoc.fileName}>
                    {selectedDoc.fileName}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">Unggah: {new Date(selectedDoc.uploadedAt).toLocaleDateString("id-ID")}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 py-1 px-2.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-mono rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                AES-GCM Secure Data Blob
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-1 font-mono text-sm text-slate-600">
                  <div>
                    <span className="text-slate-500">NAMA BERKAS:</span> <span className="text-slate-700 break-all">{selectedDoc.fileName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">TIPE LAYOUT:</span> <span className="text-slate-700 uppercase">{selectedDoc.fileType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">UKURAN FISIK:</span> <span className="text-indigo-600 font-bold">{formatBytes(selectedDoc.fileSize)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono font-semibold text-slate-500 uppercase block">Keterangan Dokumen</span>
                  <div className="text-xs text-slate-700 italic">
                    {selectedDoc.description || "Tidak ada keterangan tambahan."}
                  </div>
                </div>
              </div>

              {/* Decrypt and Download Action Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between items-center gap-4 text-center">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 font-sans">Aksi Dokumen Kedap</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Dokumen ini berada dalam bentuk ciphered biner. Hanya dapat ditarik kembali setelah melalui verifikasi kunci privat memori.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(selectedDoc)}
                  disabled={isDecrypting}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white font-semibold text-xs font-mono rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Download className={`w-3.5 h-3.5 ${isDecrypting ? "animate-spin" : ""}`} />
                  {isDecrypting ? "Mendekripsi Data Cipher..." : "Dekripsi & Unduh File Raw"}
                </button>
              </div>
            </div>

            {/* Cipher preview diagram block */}
            <div className="space-y-1.5 text-left">
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest block">Payload Raw Encrypted (AES Base64 Stream Sample)</span>
              <pre className="bg-white border border-slate-855 rounded-lg p-2.5 text-xs font-mono text-indigo-600/80 break-all overflow-y-auto max-h-[80px] leading-relaxed select-all">
                {selectedDoc.dataUrl.slice(0, 480)}... [TRUNCATED_BINARY_CIPHER]
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-6 min-h-[280px] flex flex-col justify-center items-center text-center space-y-3">
            <div className="p-4 bg-white rounded-full border border-slate-300 text-slate-500">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-700 font-bold text-sm">Tidak Ada Dokumen Dipilih</h3>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Pilih silsilah dokumen atau unggah berkas PDF/KTP/Kartu keluarga sensitif di atas untuk melihat parameter metadata serta mengunduhnya kembali.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
