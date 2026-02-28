import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');

// Replacements mapped from DESIGN_SYSTEM.md and common bad practices
const replacements = [
    // Backgrounds
    { regex: /\bbg-(?:primary|purple|violet|blue)-(?:[5-9]00)\b/g, replace: 'bg-accent-primary' },
    { regex: /\bbg-(?:primary|purple|violet|gray|slate)-(?:50|100|200)\b/g, replace: 'bg-theme-secondary' },
    { regex: /\bbg-(?:gray|slate)-(?:800|900)\b/g, replace: 'bg-theme-primary' },
    // Text
    { regex: /\btext-(?:primary|purple|violet|blue)-(?:[5-9]00)\b/g, replace: 'text-accent-primary' },
    { regex: /\btext-(?:gray|slate)-[3-4]00\b/g, replace: 'text-theme-secondary' },
    { regex: /\btext-(?:gray|slate|primary)-[1-2]00\b/g, replace: 'text-theme-primary' },
    { regex: /\btext-(?:gray|slate)-[8-9]00\b/g, replace: 'text-theme-primary' }, // Assuming light mode was previously dark text
    { regex: /\btext-black\b/g, replace: 'text-theme-primary' },
    // Borders
    { regex: /\bborder-(?:primary|purple|violet|gray|slate)-(?:[1-9]00)\b/g, replace: 'border-theme' },
    { regex: /\bborder-white\/[0-9]+\b/g, replace: 'border-theme' },
    // Arbitrary background transparency with white/black (often used as overlays, but we should be careful. We'll leave them for now or replace specific ones)
    // Replace arbitrary values with Tailwind defaults if they are close
    { regex: /\bw-\[([0-9]+)px\]\b/g, replace: (match, p1) => {
        const val = parseInt(p1);
        if (val === 16) return 'w-4';
        if (val === 20) return 'w-5';
        if (val === 24) return 'w-6';
        if (val === 32) return 'w-8';
        if (val === 40) return 'w-10';
        if (val === 48) return 'w-12';
        if (val === 64) return 'w-16';
        return match;
    }},
    { regex: /\bh-\[([0-9]+)px\]\b/g, replace: (match, p1) => {
        const val = parseInt(p1);
        if (val === 16) return 'h-4';
        if (val === 20) return 'h-5';
        if (val === 24) return 'h-6';
        if (val === 32) return 'h-8';
        if (val === 40) return 'h-10';
        if (val === 48) return 'h-12';
        if (val === 64) return 'h-16';
        return match;
    }},
    // Replace arbitrary radiuses with design system radiuses
    // sm: 4px, default: 6px, md: 8px, lg: 10px, xl: 12px, 2xl: 14px, 3xl: 16px
    { regex: /\brounded-\[4px\]\b/g, replace: 'rounded-sm' },
    { regex: /\brounded-\[6px\]\b/g, replace: 'rounded' },
    { regex: /\brounded-\[8px\]\b/g, replace: 'rounded-md' },
    { regex: /\brounded-\[10px\]\b/g, replace: 'rounded-lg' },
    { regex: /\brounded-\[12px\]\b/g, replace: 'rounded-xl' },
    { regex: /\brounded-\[14px\]\b/g, replace: 'rounded-2xl' },
    { regex: /\brounded-\[16px\]\b/g, replace: 'rounded-3xl' },
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(SRC_DIR);
let changedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;

    for (const rule of replacements) {
        newContent = newContent.replace(rule.regex, rule.replace);
    }

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
        console.log(`Updated ${path.relative(SRC_DIR, file)}`);
    }
}

console.log(`\nRefactoring complete. Modified ${changedCount} files.`);