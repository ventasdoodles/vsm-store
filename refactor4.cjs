const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');
c = c.replace(/onChange=\{\(e\) = \/> set\('slug'/g, "onChange={(e) => set('slug'");
c = c.replace(/onChange=\{\(e\) = \/> set\('sku'/g, "onChange={(e) => set('sku'");
fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', c);
