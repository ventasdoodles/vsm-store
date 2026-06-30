const fs = require('fs');

const testFiles = [
    'src/components/categories/__tests__/CategoryCard.test.tsx',
    'src/components/products/__tests__/product-detail-surface.test.tsx',
    'src/components/products/__tests__/product-grid-states-fixture.test.tsx',
    'src/components/products/__tests__/product-surface-fixture-harness.test.tsx'
];

testFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<TestRouter\s*\}?>/g, '<TestRouter>');
    fs.writeFileSync(file, content);
});

console.log('Fixed <TestRouter> syntax in remaining tests');
