import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// I will just use prettier or find the problem
const brokenPart = content.slice(content.indexOf('Ancaman Custom ROM</span>'), content.indexOf('{/* Active Workspace Panel Panel */}'));
console.log(brokenPart);
