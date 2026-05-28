import fs from 'fs';
import path from 'path';

const replaceInFile = (filePath: string) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix invalid classes generating warnings if any
  content = content.replace(/text-slate-205/g, 'text-slate-800');
  content = content.replace(/text-slate-305/g, 'text-slate-800');
  content = content.replace(/text-yellow-405/g, 'text-amber-600');
  content = content.replace(/text-slate-220/g, 'text-slate-800');
  content = content.replace(/bg-slate-905/g, 'bg-slate-50');
  content = content.replace(/bg-indigo-[34]05/g, 'bg-indigo-600');
  content = content.replace(/bg-indigo-505/g, 'bg-indigo-700');
  content = content.replace(/text-indigo-305/g, 'text-indigo-600');
  content = content.replace(/focus:border-indigo-505/g, 'focus:border-indigo-600');
  content = content.replace(/bg-slate-755/g, 'bg-slate-200');
  content = content.replace(/bg-indigo-550/g, 'bg-indigo-700');
  
  fs.writeFileSync(filePath, content, 'utf-8');
};

const walk = (dir: string) => {
  fs.readdirSync(dir).forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory() && f !== 'node_modules') {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
};

walk('./src');
console.log('Fix complete.');
