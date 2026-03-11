const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\dgcar\\OneDrive\\Desktop\\VSM pwa\\vsm-store\\src';
const targetDirs = ['hooks', 'services', 'services/admin'];

targetDirs.forEach(subDir => {
    const dirPath = path.join(baseDir, subDir);
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.ts') && !f.includes('.test.'));
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Remove leading empty lines
        content = content.trimStart();

        // Check if there's already a JSDoc or single line comment at the very top
        if (!content.startsWith('/**') && !content.startsWith('//')) {
            const moduleName = file.replace('.ts', '');
            const typeText = subDir === 'hooks' ? 'Custom hook' : 'Servicio';
            const cleanName = moduleName.replace('use', '').replace('.service', '').replace(/admin-/g, 'Admin ');
            
            const jsdoc = `/**\n * ${moduleName} - VSM Store\n * \n * ${typeText} para la lógica y gestión de ${cleanName}.\n * @module ${subDir}/${moduleName}\n */\n\n`;
            
            fs.writeFileSync(fullPath, jsdoc + content);
            console.log('Added header to ' + subDir + '/' + file);
        } else if (content.startsWith('//') && !content.startsWith('///')) {
             // If it starts with a // comment, we can convert it or just leave it. The rule asks for JSDoc.
             // We'll leave it for now unless it explicitly has no jsdoc.
        }
    });
});
