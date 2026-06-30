const fs = require('fs');

let content = fs.readFileSync('src/components/ui/ai/AIConcierge.tsx', 'utf8');
content = content.replace(/navigate=\{navigate\}/g, 'navigate={(path: string) => navigate({ to: path as any })}');
fs.writeFileSync('src/components/ui/ai/AIConcierge.tsx', content);

console.log('Fixed navigate prop in AIConcierge.tsx');
