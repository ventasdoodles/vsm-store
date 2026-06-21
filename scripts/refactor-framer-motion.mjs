import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

let count = 0;
walk('./src', function(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if it imports motion
    if (!content.includes('import') || !content.includes('framer-motion')) return;
    
    // Replace import { motion, ... } with import { m, ... }
    let newContent = content.replace(/import\s+\{([^}]*?)motion([^}]*?)\}\s+from\s+['"]framer-motion['"]/g, (match, p1, p2) => {
        // If it only imports motion, just replace with m
        let inner = (p1 + 'm' + p2).replace(/,\s*,/g, ',');
        return `import {${inner}} from 'framer-motion'`;
    });
    
    if (newContent !== content) {
        // Replace <motion.div to <m.div
        newContent = newContent.replace(/<motion\./g, '<m.');
        newContent = newContent.replace(/<\/motion\./g, '</m.');
        
        // Also handle motion(Component) if any
        newContent = newContent.replace(/motion\(/g, 'm(');
        
        fs.writeFileSync(filePath, newContent);
        count++;
        console.log('Refactored', filePath);
    }
});

console.log(`Refactored ${count} files.`);
