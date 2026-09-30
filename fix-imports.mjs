import fs from 'fs';
import path from 'path';

const handlersDir = 'src/services/concierge/handlers';
const files = fs.readdirSync(handlersDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

files.forEach(file => {
    const filePath = path.join(handlersDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Simple parser: remove unused imports
    const lines = content.split('\n');
    const newLines = [];
    let inImport = false;
    let importBuffer = [];

    // First pass to get all text without imports to check for usage
    const bodyContent = content.replace(/^import\s+.*?;\s*$/gm, '').replace(/^import\s+\{.*?\}.*?;\s*$/gms, '');

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        if (line.trim().startsWith('import {')) {
            inImport = true;
            importBuffer = [line];
            
            // if single line import
            if (line.includes('} from')) {
                inImport = false;
                processImport(importBuffer.join('\n'));
                i++;
                continue;
            }
        } else if (inImport) {
            importBuffer.push(line);
            if (line.includes('} from')) {
                inImport = false;
                processImport(importBuffer.join('\n'));
            }
        } else if (line.trim().startsWith('import ') && line.includes('from')) {
            // single line default import or type
            processImport(line);
        } else {
            newLines.push(line);
        }

        i++;
    }

    function processImport(importStr) {
        // match import { A, B } from 'C'
        const match = importStr.match(/import\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
        if (match) {
            const isType = match[1] || '';
            const items = match[2].split(',').map(s => s.trim()).filter(Boolean);
            const source = match[3];

            const usedItems = items.filter(item => {
                const itemName = item.split(/\s+as\s+/)[0].trim();
                // Check if itemName exists in bodyContent as a whole word
                const regex = new RegExp(`\\b${itemName}\\b`);
                return regex.test(bodyContent);
            });

            if (usedItems.length > 0) {
                if (usedItems.length === 1) {
                    newLines.push(`import ${isType}{ ${usedItems[0]} } from '${source}';`);
                } else {
                    newLines.push(`import ${isType}{\n    ${usedItems.join(',\n    ')}\n} from '${source}';`);
                }
            }
        } else {
            // Check default import
            const defaultMatch = importStr.match(/import\s+(type\s+)?(\w+)\s+from\s+['"]([^'"]+)['"]/);
            if (defaultMatch) {
                const itemName = defaultMatch[2];
                const regex = new RegExp(`\\b${itemName}\\b`);
                if (regex.test(bodyContent)) {
                    newLines.push(importStr);
                }
            } else {
                newLines.push(importStr);
            }
        }
    }

    fs.writeFileSync(filePath, newLines.join('\n').replace(/\n{3,}/g, '\n\n'));
    console.log(`Cleaned imports for ${file}`);
});
