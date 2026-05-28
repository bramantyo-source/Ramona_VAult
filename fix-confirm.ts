import fs from 'fs';
import path from 'path';

const removeConfirm = (filePath: string) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Example: if (!confirm("Hapus kunci SSH...")) return;
  // We'll replace it with: // no confirm needed in sandbox
  content = content.replace(/if\s*\(!confirm\([^)]+\)\)\s*return;/g, '');
  
  fs.writeFileSync(filePath, content, 'utf-8');
};

const components = [
  'NoteSection.tsx',
  'SshSection.tsx',
  'TotpSection.tsx',
  'BarcodeSection.tsx',
  'DocSection.tsx',
  'PasswordSection.tsx'
];

components.forEach(c => {
  removeConfirm(path.join('src', 'components', c));
});

console.log("Removed UI confirms");
