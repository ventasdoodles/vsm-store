const fs = require('fs');

const testFiles = [
    'src/components/products/__tests__/product-surface-fixture-harness.test.tsx',
    'src/components/products/__tests__/ProductCard.test.tsx'
];

testFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<TestRouter\s*\}?>/g, '<TestRouter>');
    fs.writeFileSync(file, content);
});

console.log('Fixed <TestRouter> syntax in tests');
