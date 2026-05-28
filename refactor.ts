import fs from 'fs';
import path from 'path';

const replaceInFile = (filePath: string) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const replacements: [RegExp, string][] = [
    [/bg-slate-950\/40/g, 'bg-slate-50'],
    [/bg-slate-950\/80/g, 'bg-slate-50/80'],
    [/bg-slate-950/g, 'bg-white'],
    [/bg-slate-900\/60/g, 'bg-slate-50'],
    [/bg-slate-900\/80/g, 'bg-slate-50/80'],
    [/bg-slate-900\/40/g, 'bg-slate-50'],
    [/bg-slate-900\/20/g, 'bg-slate-50'],
    [/bg-slate-900\/10/g, 'bg-white'],
    [/bg-slate-900/g, 'bg-white'],
    [/bg-slate-850/g, 'bg-slate-100'],
    [/bg-slate-800/g, 'bg-slate-100'],
    [/bg-slate-750/g, 'bg-slate-200'],
    [/border-slate-900/g, 'border-slate-200'],
    [/border-slate-850/g, 'border-slate-200'],
    [/border-slate-800/g, 'border-slate-300'],
    [/border-slate-750/g, 'border-slate-300'],
    [/text-slate-100/g, 'text-slate-900'],
    [/text-slate-200/g, 'text-slate-800'],
    [/text-slate-250/g, 'text-slate-700'],
    [/text-slate-300/g, 'text-slate-700'],
    [/text-slate-350/g, 'text-slate-600'],
    [/text-slate-400/g, 'text-slate-600'],
    [/text-slate-450/g, 'text-slate-500'],
    [/text-slate-500/g, 'text-slate-500'],
    [/text-slate-550/g, 'text-slate-400'],
    
    // Accent colors
    [/text-indigo-400/g, 'text-indigo-600'],
    [/text-indigo-300/g, 'text-indigo-700'],
    [/text-indigo-305/g, 'text-indigo-600'],
    [/text-emerald-400/g, 'text-emerald-600'],
    [/text-rose-400/g, 'text-rose-600'],
    [/text-rose-300/g, 'text-rose-700'],
    [/text-amber-400/g, 'text-amber-600'],
    [/text-amber-300/g, 'text-amber-700'],
    [/text-white/g, 'text-white'], // keeps original
    
    // Background accents
    [/bg-indigo-950\/40/g, 'bg-indigo-50'],
    [/bg-indigo-950\/20/g, 'bg-indigo-50'],
    [/bg-indigo-950\/10/g, 'bg-indigo-50'],
    [/bg-indigo-950/g, 'bg-indigo-50'],
    [/bg-indigo-900/g, 'bg-indigo-100'],
    [/border-indigo-900/g, 'border-indigo-200'],
    [/border-indigo-500/g, 'border-indigo-300'],
    [/bg-indigo-500\/10/g, 'bg-indigo-50'],
    [/bg-indigo-500\/20/g, 'bg-indigo-100'],
    [/bg-rose-950/g, 'bg-rose-50'],
    [/bg-rose-950\/40/g, 'bg-rose-50'],
    [/bg-amber-950/g, 'bg-amber-50'],
    [/bg-emerald-950/g, 'bg-emerald-50'],
    [/bg-emerald-950\/20/g, 'bg-emerald-50'],
    [/bg-rose-950\/20/g, 'bg-rose-50'],
    [/bg-\[#030712fd\]/g, 'bg-slate-50'],
    
    // Remove blur glows
    [/<div className="absolute[^>]*blur-[^>]*><\/div>/g, ''],
    [/<div className="absolute[^>]*bg-indigo-[^>]*blur-[^>]*><\/div>/g, ''],
    
    // Text sizes
    [/text-\[8px\]/g, 'text-[10px]'],
    [/text-\[8\.5px\]/g, 'text-[10px]'],
    [/text-\[9px\]/g, 'text-[10px]'],
    [/text-\[9\.5px\]/g, 'text-[11px]'],
    [/text-\[10px\]/g, 'text-xs'],
    [/text-\[10\.5px\]/g, 'text-xs'],
    [/text-\[11px\]/g, 'text-sm']
  ];

  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }

  // Handle specific layout colors in App.tsx
  if (filePath.endsWith('App.tsx')) {
    content = content.replace(/min-h-screen bg-slate-950 text-slate-100/g, 'min-h-screen bg-slate-50 text-slate-900');
    // For unlocked layout specifically
    content = content.replace(/bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-2xl/g, 'bg-white border border-slate-200 rounded-2xl p-5 shadow-sm');
    content = content.replace(/bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-2xl/g, 'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm');
  }

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
console.log('Refactoring complete.');
