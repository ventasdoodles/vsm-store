import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');

// Map arbitrary pixels to tailwind spacing indices
const spacingMap = {
    '2px': '0.5',
    '4px': '1',
    '6px': '1.5',
    '8px': '2',
    '10px': '2.5',
    '12px': '3',
    '14px': '3.5',
    '16px': '4',
    '20px': '5',
    '24px': '6',
    '28px': '7',
    '32px': '8',
    '40px': '10',
    '48px': '12',
    '64px': '16',
    '80px': '20',
    '96px': '24',
    '128px': '32',
    '160px': '40',
    '192px': '48',
    '256px': '64',
};

const textMap = {
    '10px': 'xs',
    '12px': 'xs',
    '14px': 'sm',
    '16px': 'base',
    '18px': 'lg',
    '20px': 'xl',
    '24px': '2xl',
    '30px': '3xl',
    '36px': '4xl',
};

// Also percentages for w/h
const fluidMap = {
    '100%': 'full',
    '100vh': 'screen',
    '100vw': 'screen',
    '50%': '1/2',
    '33.333%': '1/3',
    '33%': '1/3',
    '25%': '1/4',
};

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
    let original = content;

    // Replace w-[px], h-[px], gap-[px], p-[px], m-[px] etc.
    content = content.replace(/\b([a-z]+)-\[([0-9\.]+px)\]/g, (match, prefix, val) => {
        if (prefix === 'text' && textMap[val]) {
            return `text-${textMap[val]}`;
        }
        if (['w', 'h', 'gap', 'p', 'pt', 'pb', 'pl', 'pr', 'px', 'py', 'm', 'mt', 'mb', 'ml', 'mr', 'mx', 'my', 'top', 'bottom', 'left', 'right', 'rounded'].includes(prefix)) {
            if (spacingMap[val]) {
                if (prefix === 'rounded') {
                    // let existing regex handle radii if needed, but spacing map might not map correctly to radii names
                    // Actually, we already replaced rounded-[16px] to rounded-3xl.
                    return match;
                }
                return `${prefix}-${spacingMap[val]}`;
            }
        }
        return match;
    });

    // Replace percentages
    content = content.replace(/\b([wh])-\[([^\]]+)\]/g, (match, prefix, val) => {
        if (fluidMap[val]) {
            return `${prefix}-${fluidMap[val]}`;
        }
        return match;
    });

    // Color arbitrary replacing
    // Replace hex arrays to current logic if it fits
    // (This is dangerous without knowing exact colors, but let's try some very basic ones like #fff)
    content = content.replace(/\bbg-\[#ffffff\]/gi, 'bg-theme-secondary');
    content = content.replace(/\btext-\[#ffffff\]/gi, 'text-white');
    content = content.replace(/\btext-\[#000000\]/gi, 'text-theme-primary');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated ${path.relative(SRC_DIR, file)}`);
    }
}

console.log(`Phase 3 complete. Modified ${changedCount} files.`);