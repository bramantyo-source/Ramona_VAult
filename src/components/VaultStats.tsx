import React, { useState } from "react";
import { 
  ShieldAlert, 
  Database, 
  Terminal, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Clock, 
  Lock, 
  Activity, 
  Code, 
  Cpu, 
  AlertOctagon, 
  AlertTriangle 
} from "lucide-react";
import { SecurityLog } from "../types";
import { obfuscateCodeSimulator } from "../utils/crypto";

interface VaultStatsProps {
  logs: SecurityLog[];
  failedAttempts: number;
  cooldownUntil: number | null;
  pinLength: number;
}

export default function VaultStats({ logs, failedAttempts, cooldownUntil, pinLength }: VaultStatsProps) {
  const [showRawCode, setShowRawCode] = useState<boolean>(false);

  // Compute stats
  const activeCooldown = cooldownUntil && cooldownUntil > Date.now();
  const storageUsageBytes = JSON.stringify(localStorage).length;
  const storageUsageKb = (storageUsageBytes / 1024).toFixed(2);

  // Calculate crude PIN entropy
  const scoreEntropy = () => {
    if (pinLength === 0) return { score: 0, text: "Sangat Lemah", color: "text-rose-500" };
    if (pinLength < 4) return { score: 15, text: "Lemah (PIN Pendek)", color: "text-rose-600" };
    // Numeric pin
    const possibleCombinations = Math.pow(10, pinLength);
    const entropyBits = Math.log2(possibleCombinations);
    
    if (entropyBits < 15) return { score: 35, text: "Sedang", color: "text-amber-600" };
    if (entropyBits < 20) return { score: 70, text: "Kuat", color: "text-emerald-600" };
    return { score: 100, text: "Sangat Kuat (Entropi Tinggi)", color: "text-emerald-300" };
  };

  const entropy = scoreEntropy();

  // Code snippets for Obfuscation comparison
  const originalCode = `export async function deriveKey(pin: string, salt: string) {
  const encoder = new TextEncoder();
  const material = await window.crypto.subtle.importKey(
    "raw", 
    encoder.encode(pin), 
    { name: "PBKDF2" }, 
    false, 
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}`;

  const obfuscatedCode = obfuscateCodeSimulator(originalCode);

  return (
    <div className="space-y-6" id="vault-stats">
      {/* 4 Header Stats Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-mono text-slate-600 uppercase tracking-wider block">Kekuatan Kunci Master</span>
            <span className={`text-sm font-bold font-mono ${entropy.color}`}>{entropy.text}</span>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-mono text-slate-600 uppercase tracking-wider block">Percobaan Gagal (Brute Force)</span>
            <span className={`text-sm font-bold font-mono ${failedAttempts > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {failedAttempts} / 3 Percobaan
            </span>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-mono text-slate-600 uppercase tracking-wider block">Pertahanan Aktif / Lockout</span>
            <span className="text-sm font-bold font-mono text-slate-800">
              {activeCooldown ? "BLOKIR SEMENTARA" : "SIAGA / AMAN"}
            </span>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-mono text-slate-600 uppercase tracking-wider block">Penggunaan Local Data</span>
            <span className="text-sm font-bold font-mono text-indigo-600">
              {storageUsageKb} KB
            </span>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700">
            <Database className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Anti-Brute Force Dashboard */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="text-indigo-600 w-4 h-4" />
            <h3 className="font-bold text-slate-800 text-sm font-mono uppercase tracking-wider">Laporan Audit Forensik & Anti-Brute Force</h3>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">
            Sistem brankas merekam setiap kejadian otentikasi PIN dan TOTP secara lokal. Jika terdeteksi 3 kegagalan beruntun, kunci master otomatis dinonaktifkan sementara dan dipasang timer pendinginan (cooldown) guna menangkis serangan robotik (brute force).
          </p>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 p-2 text-xs font-mono text-slate-600 uppercase grid grid-cols-12 gap-2 border-b border-slate-200">
              <span className="col-span-3">Timestamp</span>
              <span className="col-span-3">Kejadian</span>
              <span className="col-span-2">Derajat</span>
              <span className="col-span-4">Informasi</span>
            </div>
            
            <div className="divide-y divide-slate-950 max-h-[190px] overflow-y-auto font-mono text-xs text-slate-700">
              {logs.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs font-mono">
                  Belum ada log audit yang terekam.
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-2 grid grid-cols-12 gap-2 hover:bg-slate-50">
                    <span className="col-span-3 text-slate-500 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="col-span-3 font-semibold text-sm truncate">
                      {log.event}
                    </span>
                    <span className={`col-span-2 text-xs uppercase font-bold ${
                      log.severity === 'high' ? 'text-rose-600' : log.severity === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {log.severity}
                    </span>
                    <span className="col-span-4 text-slate-600 text-sm truncate" title={log.details}>
                      {log.details}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Source Code Obfuscation Simulator */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="text-pink-400 w-4 h-4" />
              <h3 className="font-bold text-slate-800 text-sm font-mono uppercase tracking-wider">Simulasi Obfuskasi Kode</h3>
            </div>
            <button
              type="button"
              id="btn-toggle-obfuscation"
              onClick={() => setShowRawCode(!showRawCode)}
              className="py-1 px-2 hover:bg-white border border-slate-300 text-slate-700 text-xs uppercase font-mono rounded"
            >
              {showRawCode ? "Lihat Hasil Obfuskasi" : "Lihat Kode Asli"}
            </button>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">
            Untuk menyulitkan proses <em>Reverse Engineering</em> jika aplikasi ditarik dari berkas APK oleh peretas, fungsionalitas kriptografi dienkapsulasi dan di-obfuskasikan.
          </p>

          <div className="relative">
            <pre className="bg-white border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-700 overflow-x-auto h-[160px] leading-relaxed">
              {showRawCode ? originalCode : obfuscatedCode}
            </pre>
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 py-1 px-2 rounded bg-indigo-50/80 border border-indigo-300/30 text-xs font-mono font-bold text-indigo-700 tracking-wider uppercase">
              <Cpu className="w-3" />
              {showRawCode ? "Source TS" : "Obfuscated / Encapsulated"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
