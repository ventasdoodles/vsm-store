const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix MemoryRouter imports
    if (content.includes('MemoryRouter')) {
        content = content.replace(/import\s*\{[^}]*MemoryRouter[^}]*\}\s*from\s*['"]@tanstack\/react-router['"];?/, 'import { TestRouter } from "@/lib/test-router";');
        content = content.replace(/<MemoryRouter/g, '<TestRouter');
        content = content.replace(/<\/MemoryRouter>/g, '</TestRouter>');
    }
    
    // Fix <TestRouter future={...}>
    if (content.includes('<TestRouter') && content.includes('future=')) {
        content = content.replace(/future=\{[^}]+\}/g, '');
    }
    
    // Fix Link to prop
    // We only want to replace to={`...`} or to={"..."} or to={'...'} if it's not already casted to any
    // This regex looks for to={} where the content is a string literal or template literal and doesn't contain "as any"
    content = content.replace(/to=\{(`[^`]+`)\}/g, (match, p1) => {
        if (match.includes('as any')) return match;
        return `to={${p1} as any}`;
    });
    
    content = content.replace(/to=\{"([^"]+)"\}/g, (match, p1) => {
        if (match.includes('as any')) return match;
        return `to={"${p1}" as any}`;
    });
    
    content = content.replace(/to=\{'([^']+)'\}/g, (match, p1) => {
        if (match.includes('as any')) return match;
        return `to={'${p1}' as any}`;
    });
    
    // Fix to="string" -> to={"string" as any}
    content = content.replace(/to="(\/[^"]*)"/g, 'to={"$1" as any}');
    
    // Fix navigate(...) where argument is a string literal or template literal without options
    // Only if it doesn't already have { to: ... }
    content = content.replace(/navigate\((`[^`]+`)\)/g, (match, p1) => {
        if (match.includes('{ to:')) return match;
        return `navigate({ to: ${p1} as any })`;
    });
    
    content = content.replace(/navigate\("([^"]+)"\)/g, (match, p1) => {
        if (match.includes('{ to:')) return match;
        return `navigate({ to: "${p1}" as any })`;
    });
    
    content = content.replace(/navigate\('([^']+)'\)/g, (match, p1) => {
        if (match.includes('{ to:')) return match;
        return `navigate({ to: '${p1}' as any })`;
    });
    
    // Fix navigate(...) with options
    content = content.replace(/navigate\((`[^`]+`),\s*(\{([^}]+)\})\)/g, (match, p1, p2) => {
        if (match.includes('{ to:')) return match;
        // p2 is { options... }, we need to merge
        let inner = p2.substring(1, p2.length - 1); // remove { and }
        return `navigate({ to: ${p1} as any, ${inner} })`;
    });
    
    content = content.replace(/navigate\('([^']+)',\s*(\{([^}]+)\})\)/g, (match, p1, p2) => {
        if (match.includes('{ to:')) return match;
        let inner = p2.substring(1, p2.length - 1);
        return `navigate({ to: '${p1}' as any, ${inner} })`;
    });
    
    content = content.replace(/navigate\("([^"]+)",\s*(\{([^}]+)\})\)/g, (match, p1, p2) => {
        if (match.includes('{ to:')) return match;
        let inner = p2.substring(1, p2.length - 1);
        return `navigate({ to: "${p1}" as any, ${inner} })`;
    });
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${filePath}`);
    }
}

processDirectory(path.join(__dirname, '..', 'src'));
console.log('Done running sweeping fix across src/');
