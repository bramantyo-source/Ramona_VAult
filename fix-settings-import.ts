import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert import
content = content.replace(
  /import DocSection from "\.\/components\/DocSection";/,
  'import DocSection from "./components/DocSection";\nimport SettingsSection from "./components/SettingsSection";'
);

// Insert full wipe function
const clearDataFunc = `
  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };
`;
content = content.replace(/const lockSession = \(\) => \{/, clearDataFunc + '\n  const lockSession = () => {');

// Insert tab rendering
const settingsTabRender = `
              {activeTab === "settings" && (
                <SettingsSection onClearData={handleClearData} onLogout={lockSession} />
              )}
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\}\)/, settingsTabRender);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
