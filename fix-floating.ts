import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const floatingMenu = `      {isUnlocked && (
        <>
          {/* Main Workspace Top Right Actions */}
          <div className="fixed top-4 right-4 md:top-6 md:right-6 flex flex-col items-center gap-2.5 z-50">
            <button
              onClick={() => setActiveTab("settings")}
              className={\`p-3 rounded-full shadow-lg transition-all \${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white shadow-indigo-600/30"
                  : "bg-slate-900/40 border border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white backdrop-blur-md"
              }\`}
              title="Pengaturan"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleLock}
              className="p-3 rounded-full shadow-lg transition-all bg-slate-900/40 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300 backdrop-blur-md"
              title="Logout (Kunci Brankas)"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-6 relative">`;

content = content.replace(
  /\{isUnlocked && \(\s*<div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-6">/, 
  floatingMenu
);

content = content.replace(/<\/div>\n\s*<\/div>\n\s*\b\)\}\s*<\/div>\n\s*\);\n\}/, '          </div>\n        </>\n      )}\n    </div>\n  );\n}')

fs.writeFileSync('src/App.tsx', content, 'utf-8');
