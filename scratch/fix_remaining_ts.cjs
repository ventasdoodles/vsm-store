const fs = require('fs');

// Fix test files containing MemoryRouter
const testFiles = [
    'src/components/products/__tests__/product-surface-fixture-harness.test.tsx',
    'src/components/products/__tests__/ProductCard.test.tsx',
    'src/components/products/__tests__/ProductGrid.test.tsx',
    'src/components/profile/__tests__/ProfileAccountTrustCopy.test.tsx',
    'src/hooks/__tests__/useSectionFromPath.test.tsx'
];

testFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace import { MemoryRouter } from '@tanstack/react-router' with import { TestRouter } from '@/lib/test-router'
    content = content.replace(/import\s*\{[^}]*MemoryRouter[^}]*\}\s*from\s*['"]@tanstack\/react-router['"];?/, 'import { TestRouter } from "@/lib/test-router";');
    
    // Replace <MemoryRouter> with <TestRouter>
    content = content.replace(/<MemoryRouter/g, '<TestRouter');
    content = content.replace(/<\/MemoryRouter>/g, '</TestRouter>');
    
    fs.writeFileSync(file, content);
    console.log(`Fixed MemoryRouter in ${file}`);
});

// Fix Link 'to' props
const linkFiles = [
    'src/components/products/ProductBreadcrumbs.tsx',
    'src/components/products/QuickViewModal.tsx',
    'src/components/search/SearchBar.tsx',
    'src/components/ui/ai/VisualScannerModal.tsx',
    'src/components/ui/ProactiveAISuggestions.tsx'
];

linkFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix to={`/path`} -> to={`/path` as any}
    content = content.replace(/to=\{(`[^`]+`)\}/g, 'to={$1 as any}');
    
    // Fix to={`/chat?q=${encodeURIComponent(searchQuery)}`}
    content = content.replace(/to=\{"\/chat\?q="\s*\+\s*[^}]+\}/g, (match) => {
        return match.replace(/to=\{([^}]+)\}/, 'to={$1 as any}');
    });
    
    fs.writeFileSync(file, content);
    console.log(`Fixed Link 'to' in ${file}`);
});

// Fix navigate() calls
const navFiles = [
    'src/components/search/MobileSearchOverlay.tsx',
    'src/components/search/SearchBar.tsx',
    'src/components/ui/ai/AIConcierge.tsx'
];

navFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix navigate(`/${product.section ?? 'vape'}/${product.slug}`)
    content = content.replace(/navigate\((`[^`]+`)\)/g, 'navigate({ to: $1 as any })');
    
    // Fix navigate(`/chat?q=${encodeURIComponent(q)}`)
    content = content.replace(/navigate\((`[^`]+`),\s*\{([^}]+)\}\)/g, 'navigate({ to: $1 as any, $2 })');
    
    // For anything that didn't get caught by previous regex:
    // navigate(path) -> navigate({ to: path as any })
    // We can use a simpler approach for MobileSearchOverlay and SearchBar:
    if (file.includes('MobileSearchOverlay.tsx')) {
        content = content.replace(/navigate\('\/buscar'\)/g, "navigate({ to: '/buscar' as any })");
        content = content.replace(/navigate\(`\/buscar\?q=\$\{encodeURIComponent\(q\)\}`\)/g, "navigate({ to: `/buscar?q=${encodeURIComponent(q)}` as any })");
    }
    
    if (file.includes('SearchBar.tsx')) {
        content = content.replace(/navigate\(`\/chat\?q=\$\{encodeURIComponent\(q\)\}`\)/g, "navigate({ to: `/chat?q=${encodeURIComponent(q)}` as any })");
        content = content.replace(/navigate\(`\/buscar\?q=\$\{encodeURIComponent\(q\)\}`\)/g, "navigate({ to: `/buscar?q=${encodeURIComponent(q)}` as any })");
        content = content.replace(/navigate\('\/buscar'\)/g, "navigate({ to: '/buscar' as any })");
    }
    
    if (file.includes('AIConcierge.tsx')) {
        // Just replace the specific one
        content = content.replace(/navigate\(`\/\$\{product\.section \?\? 'vape'\}\/\$\{product\.slug\}`\);/g, "navigate({ to: `/${product.section ?? 'vape'}/${product.slug}` as any });");
    }
    
    fs.writeFileSync(file, content);
    console.log(`Fixed navigate() in ${file}`);
});
