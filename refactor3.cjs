const fs = require('fs');

function processFile(file, replacements) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');
  let original = c;
  
  if (!c.includes('import { Input }')) {
      c = c.replace(/import {([^}]+)} from ["']([^"']+)["']/m, (match) => {
          return 'import { Input } from "@/components/ui/Input";\n' + match;
      });
  }

  for (let r of replacements) {
    c = c.replace(r.regex, r.replacement);
  }
  
  if (c !== original) {
    fs.writeFileSync(file, c);
    console.log(`Updated ${file}`);
  }
}

processFile('src/pages/admin/AdminProductForm.tsx', [
  { regex: /<div className="sm:col-span-2">\s*<label className="([^"]*)">([^<]*)<\/label>\s*<input(.*?)\/?>\s*<\/div>/g, replacement: '<div className="sm:col-span-2"><Input variant="admin" label="$2" labelClassName="$1" $3 /></div>' },
  { regex: /<div>\s*<label className="([^"]*)">([^<]*)<\/label>\s*<input(.*?)\/?>\s*<\/div>/g, replacement: '<div><Input variant="admin" label="$2" labelClassName="$1" $3 /></div>' },
  { regex: /<div className="flex items-center gap-2 mb-1">\s*<label className="([^"]*)">([^<]*)<\/label>\s*<\/div>\s*<input(.*?)\/?>/g, replacement: '<Input variant="admin" label="$2" labelClassName="$1" $3 />' }
]);

processFile('src/pages/admin/AdminBatchManager.tsx', [
  { regex: /<input /g, replacement: '<Input variant="admin" ' }
]);

processFile('src/components/admin/products/ProductEditorDrawer.tsx', [
  { regex: /<input/g, replacement: '<Input variant="admin"' }
]);

processFile('src/components/admin/products/ProductSpecsBuilder.tsx', [
  { regex: /<input /g, replacement: '<Input variant="admin" ' }
]);

processFile('src/components/admin/settings/VerticalPackConfigSettings.tsx', [
  { regex: /<input /g, replacement: '<Input variant="admin" ' },
  { regex: /<input\n/g, replacement: '<Input variant="admin"\n' }
]);

processFile('src/components/admin/ui/AdminCommandPalette.tsx', [
  { regex: /<input /g, replacement: '<Input variant="admin" ' }
]);

processFile('src/components/admin/ui/SupplierOrderModal.tsx', [
  { regex: /<input /g, replacement: '<Input variant="admin" ' }
]);

