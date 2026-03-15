import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function migrateImports(dir) {
    let count = 0;
    walkDir(dir, function(filePath) {
        if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
        if (filePath.includes('admin')) return; // skip admin folders
        if (filePath.includes(path.join('src', 'services'))) return; // skip the services folder itself!

        let content = fs.readFileSync(filePath, 'utf8');
        let regex = /from\s+['"]@\/services\/([a-zA-Z0-9_-]+)\.service['"]/g;
        
        if (regex.test(content)) {
            let newContent = content.replace(regex, "from '@/services'");
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated:', filePath);
            count++;
        }
    });
    console.log('Total files updated in', dir, ':', count);
}

migrateImports(path.join(__dirname, '../src/components'));
migrateImports(path.join(__dirname, '../src/pages'));
migrateImports(path.join(__dirname, '../src/hooks'));
