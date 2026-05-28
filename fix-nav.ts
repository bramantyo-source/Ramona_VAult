import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const navCode = `
              {/* Mobile Tab Selector */}
              <div className="block md:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3 outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="mahasiswa">ID & Analisis</option>
                  <option value="notes">Catatan Rahasia</option>
                  <option value="passwords">Data Password</option>
                  <option value="ssh">Kunci SSH Server</option>
                  <option value="totp">TOTP MFA Token</option>
                  <option value="barcodes">Kartu Barcode</option>
                  <option value="docs">Dokumen Kedap</option>
                  <option value="audit">Audit & Forensik</option>
                  <option value="rom">Ancaman Custom ROM</option>
                  <option value="settings">Pengaturan</option>
                </select>
              </div>

              {/* Desktop Navigation Tabs */}
              <nav className="hidden md:flex flex-col gap-1.5 text-left">
`;

content = content.replace(/\{?\/\*\s*Navigation Tabs\s*\*\/\s*\}?\s*<nav className="flex flex-col gap-1\.5 text-left">/, navCode);

// Add the settings tab button inside desktop nav
const settingsBtn = `
                  <button
                    type="button"
                    id="tab-btn-settings"
                    onClick={() => setActiveTab("settings")}
                    className={\`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer \${
                      activeTab === "settings" 
                        ? "bg-indigo-600 text-white border border-indigo-500 font-bold shadow-md shadow-indigo-600/30" 
                        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:text-slate-900 border border-transparent"
                    }\`}
                  >
                    <SettingsIcon className={\`w-[18px] h-[18px] shrink-0 \${activeTab === "settings" ? "" : "text-slate-400"}\`} />
                    <span>Pengaturan</span>
                  </button>
                </div>
              </nav>
`;

content = content.replace(/<\/div>\s*<\/nav>/, settingsBtn);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
