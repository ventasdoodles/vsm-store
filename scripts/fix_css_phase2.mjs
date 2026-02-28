import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');

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

    // Replace static scrollbar hide: replace `style={{ scrollbarWidth: 'none' }}` but we must also ensure className gets scrollbar-hide
    // A simpler way: if we see `style={{ scrollbarWidth: 'none' }}`, we remove it and add `scrollbar-hide` to className.
    // Instead of complex AST, I'll just do simple string replacements if they perfectly match common patterns.
    
    // Pattern: className="...something..." style={{ scrollbarWidth: 'none' }}
    content = content.replace(/className="([^"]+)"\s*style=\{\{\s*scrollbarWidth:\s*'none'\s*\}\}/g, 'className="$1 scrollbar-hide"');
    
    // Common inline styles replacing to utility classes where we can:
    content = content.replace(/style=\{\{\s*animationDelay:\s*'([0-9\.]+)s'\s*\}\}/g, (match, p1) => {
        // e.g. 1s, 2s. We can't automatically add `delay-1000` because tailwind doesn't have it by default unless extended. 
        // We'll leave animationDelay inline since it's an accepted practice for specific delays that don't warrant a theme extension.
        return match; 
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated ${path.relative(SRC_DIR, file)}`);
    }
}

console.log(`Phase 2 complete. Modified ${changedCount} files.`);