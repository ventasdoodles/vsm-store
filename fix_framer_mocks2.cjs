const fs = require('fs');
const files = [
  'src/pages/__tests__/Wishlist.test.tsx',
  'src/components/products/__tests__/product-detail-surface.test.tsx',
  'src/components/products/__tests__/ProductCard.test.tsx',
  'src/components/products/__tests__/UrgencyIndicators.test.tsx',
  'src/components/admin/products/__tests__/ProductTableRow.test.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('m: new Proxy(')) continue; // already fixed
  if (content.includes('motion: new Proxy(')) {
    content = content.replace('motion: new Proxy(', 'm: new Proxy({}, { get: (_target, tag) => MotionElement(tag) }),\n        LazyMotion: ({ children }) => <>{children}</>,\n        domAnimation: {},\n        motion: new Proxy(');
  } else if (content.includes('motion: new Proxy')) {
      content = content.replace('motion: new Proxy', 'm: new Proxy({}, { get: (_target, tag) => MotionElement(tag) }), LazyMotion: ({ children }) => <>{children}</>, domAnimation: {}, motion: new Proxy');
  }
  if (!content.includes('AnimatePresence:') && content.includes('motion: new Proxy')) {
      content = content.replace('motion: new Proxy', 'AnimatePresence: ({ children }) => <>{children}</>, motion: new Proxy');
  }
  fs.writeFileSync(file, content);
}
console.log('Fixed');

