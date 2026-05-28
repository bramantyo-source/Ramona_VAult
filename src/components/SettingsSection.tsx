import React, { useState } from 'react';
import { Settings, ShieldAlert, Trash2, LogOut, Sun, Moon, Lock, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import MahasiswaSection from './MahasiswaSection';
import ThreatModelPanel from './ThreatModelPanel';

interface SettingsSectionProps {
  onClearData: () => void;
  onLogout: () => void;
}

export default function SettingsSection({ onClearData, onLogout }: SettingsSectionProps) {
  const [showAcademic, setShowAcademic] = useState(false);

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Pengaturan Aplikasi</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Konfigurasi preferensi dan manajemen keamanan brankas</p>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        
        {/* Stealth Info Akademik UTS Collapsible Sub-menu */}
        <div className="bg-white border border-slate-255 rounded-xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowAcademic(!showAcademic)}
            className="w-full flex items-center justify-between p-5 font-bold text-slate-900 bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Info Akademik UTS</p>
                <p className="text-xs text-slate-500 font-normal">Identitas Mahasiswa & Laporan Analisis Keamanan</p>
              </div>
            </div>
            {showAcademic ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showAcademic && (
            <div className="p-5 space-y-6 bg-white animate-fadeIn">
              {/* Student Identity Information */}
              <div className="p-4 bg-gradient-to-br from-indigo-900/5 to-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest mb-3">
                  Kartu Identitas Mahasiswa UTS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-mono block">NAMA</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">Rafael Bramantyo Buana Putra</span>
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-mono block">NIM</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm font-mono">100224003</span>
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-mono block">KELAS & PRODI</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">Eksekutif / Teknologi Informasi</span>
                  </div>
                </div>
              </div>

              {/* Collapsed sections for Mahasiswa & Threat Model report inside Accordion tabs */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
                    [Lampiran 1] ID & Analisis Keamanan Mahasiswa
                  </h3>
                  <div className="border border-slate-200 rounded-2xl p-4 md:p-6 bg-slate-50/20 max-h-[600px] overflow-y-auto">
                    <MahasiswaSection />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
                    [Lampiran 2] Laporan Keamanan Custom ROM & Threat Intelligence
                  </h3>
                  <div className="border border-slate-200 rounded-2xl p-4 md:p-6 bg-slate-50/20 max-h-[600px] overflow-y-auto">
                    <ThreatModelPanel />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security & Access */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-5 shadow-sm space-y-4">
           <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2 uppercase tracking-wide">
             <Lock className="w-4 h-4 text-indigo-500" /> Keamanan & Akses
           </h3>
           <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
             <div>
               <p className="font-semibold text-slate-900">Kunci Brankas (Logout)</p>
               <p className="text-xs text-slate-500">Keluar sesi saat ini dan hapus kunci di memori RAM</p>
             </div>
             <button
               onClick={onLogout}
               className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition"
             >
               Logout
             </button>
           </div>
        </div>

        {/* Data Management (Danger Zone) */}
        <div className="bg-white border border-rose-200 rounded-xl overflow-hidden p-5 shadow-sm space-y-4">
           <h3 className="text-xs font-bold text-rose-700 flex items-center gap-2 mb-2 uppercase tracking-wide">
             <ShieldAlert className="w-4 h-4 text-rose-500" /> Danger Zone (Manajemen Data)
           </h3>
           
           <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-100">
             <div>
               <p className="font-semibold text-rose-900">Hapus Semua Data Brankas</p>
               <p className="text-xs text-rose-600">Menghapus PIN, Autentikator, Catatan, Sandi secara permanen.</p>
             </div>
             <button
               onClick={onClearData}
               className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2"
             >
               <Trash2 className="w-3.5 h-3.5" />
               Reset Total
             </button>
           </div>
        </div>

        {/* System Info */}
        <div className="text-xs text-slate-400 font-mono text-center pt-8">
          <p>Ramona Secure Sandbox v1.4.2</p>
          <p>Local Storage Mode Active</p>
        </div>
      </div>
    </div>
  );
}
