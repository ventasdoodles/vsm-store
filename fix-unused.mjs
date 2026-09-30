import fs from 'fs';
import path from 'path';

const handlersDir = 'src/services/concierge/handlers';
const files = fs.readdirSync(handlersDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

files.forEach(file => {
    const filePath = path.join(handlersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove the redeclaration of noWriteSmokeActive
    content = content.replace(/const noWriteSmokeActive = isCustomerIntelligenceNoWriteSmokeActive\(data\.no_write_smoke\);\n?/g, '');

    // Now for the const declarations, we'll only keep them if they are actually used.
    const declarations = [
        'data', 'query', 'history', 'customerProfile', 'catalogGate',
        'turnAnalysis', 'sourceContext', 'invokeStart', 'effectiveTelemetrySessionId'
    ];

    declarations.forEach(v => {
        const declLineRegex = new RegExp(`const ${v} = params\\.${v};\\n?`);
        // Check if `v` is used anywhere else in the file
        // We match `\b${v}\b` but we must exclude the declaration line itself
        // Easiest is to temporarily remove the declaration, check for usage, and if used, put it back
        
        let tempContent = content.replace(declLineRegex, '');
        if (!new RegExp(`\\b${v}\\b`).test(tempContent)) {
            // Not used, remove it permanently
            content = tempContent;
        }
    });

    fs.writeFileSync(filePath, content);
});
console.log("Fixed unused vars and redeclarations.");
