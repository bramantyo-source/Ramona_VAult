import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Enforce 6-digit PIN
content = content.replace(/if \(newPin\.length < 4 \|\| newPin\.length > 6\) \{/, 'if (newPin.length !== 6) {');
content = content.replace(/alert\("PIN sandi harus berisi 4-6 angka kombinasi unik."\);/, 'alert("PIN sandi harus tepat 6 angka.");');
content = content.replace(/disabled=\{pinInput\.length < 4\}/, 'disabled={pinInput.length !== 6}');

// 2. Change Outer UI to Dark Blue Gradient
content = content.replace(/min-h-screen bg-white text-slate-900/, 'min-h-screen bg-gradient-to-br from-[#0a0f1d] via-[#1e1b4b] to-[#0f172a] text-slate-100');

// Academic Profile Outer Box (which is directly on the background)
content = content.replace(/bg-slate-50\/80 border border-indigo-300\/20/g, 'bg-[#1e1b4b]/60 border border-indigo-500/20 backdrop-blur-md');
content = content.replace(/text-slate-800 leading-none uppercase">Rafael/g, 'text-white leading-none uppercase">Rafael');
content = content.replace(/text-slate-500 leading-none mt-0\.5">\n\s*NIM/g, 'text-slate-400 leading-none mt-0.5">\n                NIM');

// 3. Tab Navigation tweaks (Spacing & Icons)
content = content.replace(/Fingerprint,/g, 'Fingerprint, TerminalSquare, ShieldCheck as ShieldCheckIcon, ScanBarcode, FolderLock, ClipboardList, Settings as SettingsIcon, ');

content = content.replace(/<Layers className=\{`w-\[18px\] h-\[18px\] shrink-0 \$\{activeTab === "ssh" \? "" : "text-slate-400"\}\}`\} \/>/g, '<TerminalSquare className={`w-[18px] h-[18px] shrink-0 ${activeTab === "ssh" ? "" : "text-slate-400"}`} />');
content = content.replace(/<Clock className=\{`w-\[18px\] h-\[18px\] shrink-0 \$\{activeTab === "totp" \? "" : "text-slate-400"\}\}`\} \/>/g, '<ShieldCheckIcon className={`w-[18px] h-[18px] shrink-0 ${activeTab === "totp" ? "" : "text-slate-400"}`} />');
content = content.replace(/<CreditCard className=\{`w-\[18px\] h-\[18px\] shrink-0 \$\{activeTab === "barcodes" \? "" : "text-slate-400"\}\}`\} \/>/g, '<ScanBarcode className={`w-[18px] h-[18px] shrink-0 ${activeTab === "barcodes" ? "" : "text-slate-400"}`} />');
content = content.replace(/<FileDigit className=\{`w-\[18px\] h-\[18px\] shrink-0 \$\{activeTab === "docs" \? "" : "text-slate-400"\}\}`\} \/>/g, '<FolderLock className={`w-[18px] h-[18px] shrink-0 ${activeTab === "docs" ? "" : "text-slate-400"}`} />');
content = content.replace(/<Activity className=\{`w-\[18px\] h-\[18px\] shrink-0 \$\{activeTab === "audit" \? "" : "text-slate-400"\}\}`\} \/>/g, '<ClipboardList className={`w-[18px] h-[18px] shrink-0 ${activeTab === "audit" ? "" : "text-slate-400"}`} />');
content = content.replace(/<Shield className=\{`w-\[18px\] h-\[18px\] shrink-0 \$\{activeTab === "rom" \? "" : "text-slate-400"\}\}`\} \/>/g, '<SettingsIcon className={`w-[18px] h-[18px] shrink-0 ${activeTab === "rom" ? "" : "text-slate-400"}`} />');

// 4. Update the Vault Screen's header (App branding at the top) to adapt to dark background
content = content.replace(/text-slate-900">Ramona/g, 'text-white drop-shadow-md">Ramona');
content = content.replace(/text-slate-500 uppercase">TI-Eksekutif/g, 'text-indigo-200 uppercase drop-shadow-sm">TI-Eksekutif');
content = content.replace(/text-slate-500 uppercase font-bold">Teruji Bebas/g, 'text-indigo-200 uppercase font-bold">Teruji Bebas');
content = content.replace(/border border-rose-300 text-rose-600 hover:bg-rose-50/g, 'border border-rose-500/50 text-rose-400 hover:bg-rose-500/20');
content = content.replace(/bg-white border border-slate-300 text-slate-700 hover:bg-slate-50/g, 'bg-slate-900/50 border border-slate-700 text-slate-200 hover:bg-slate-800');

// Footer
content = content.replace(/text-slate-400">© 2026/g, 'text-slate-600">© 2026');

// 5. Active Tab styling
content = content.replace(/bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold shadow-sm/g, 'bg-indigo-600 text-white border border-indigo-500 font-bold shadow-md shadow-indigo-600/30');
// Inactive Tab styling 
content = content.replace(/text-slate-600 hover:bg-slate-100/g, 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'); 

fs.writeFileSync('src/App.tsx', content, 'utf-8');
