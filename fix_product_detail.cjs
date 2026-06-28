const fs = require('fs');
let content = fs.readFileSync('src/components/products/__tests__/product-detail-surface.test.tsx', 'utf8');
content = content.replace('m: new Proxy({}, { get: (_target, tag) => MotionElement(tag) })', 'm: new Proxy({}, { get: (_target, tag) => { if (tag === \'button\') return MotionButton; return MotionDiv; } })');
fs.writeFileSync('src/components/products/__tests__/product-detail-surface.test.tsx', content);

