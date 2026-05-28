import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/Buat Baru PIN \(4-6 Angka\)/g, 'Buat Baru PIN (6 Angka)');
content = content.replace(/Masukkan PIN numerik standar sepanjang 4 hingga 6 digit\./g, 'Masukkan PIN numerik standar tepat 6 digit.');
fs.writeFileSync('src/App.tsx', content, 'utf-8');
