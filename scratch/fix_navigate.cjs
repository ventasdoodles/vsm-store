const fs = require('fs');

function fixNavigate(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix navigate('/path') -> navigate({ to: '/path' })
    // Using a regex to match navigate(stringVariable) or navigate('string')
    // We only want to match when the argument doesn't start with {
    
    // First, let's fix explicit strings: navigate('/something' ...)
    content = content.replace(/navigate\(\s*(['"`][^'"`]+['"`])\s*\)/g, 'navigate({ to: $1 as any })');
    
    // Fix navigate('/something', { options }) -> navigate({ to: '/something', ...options })
    content = content.replace(/navigate\(\s*(['"`][^'"`]+['"`])\s*,\s*\{([^}]+)\}\s*\)/g, 'navigate({ to: $1 as any, $2 })');
    
    // Fix variables: navigate(path) -> navigate({ to: path as any })
    // Only variables, not objects (starts with word character)
    content = content.replace(/navigate\(\s*([a-zA-Z0-9_$.]+)\s*\)/g, (match, p1) => {
        if (p1 === 'router' || p1 === 'error' || p1 === 'window') return match;
        return `navigate({ to: ${p1} as any })`;
    });
    
    // Fix variables with options: navigate(path, { options })
    content = content.replace(/navigate\(\s*([a-zA-Z0-9_$.]+)\s*,\s*\{([^}]+)\}\s*\)/g, (match, p1, p2) => {
        if (p1 === 'router' || p1 === 'error') return match;
        return `navigate({ to: ${p1} as any, ${p2} })`;
    });
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
}

const files = [
    'src/components/ui/ai/AIConcierge.tsx',
    'src/components/ui/ai/VisualScannerModal.tsx',
    'src/components/ui/ProactiveAISuggestions.tsx',
    'src/hooks/useCheckout.ts',
    'src/hooks/useStorefrontPaymentReentry.ts',
];

files.forEach(fixNavigate);
