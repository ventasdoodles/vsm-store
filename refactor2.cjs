const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');

if (!c.includes('import { Input }')) {
  c = c.replace(/import { Package/g, 'import { Input } from "@/components/ui/Input";\nimport { Package');
}

// 1. `sm:col-span-2` wrapper
c = c.replace(/<div className="sm:col-span-2"><label className="([^"]*)">([^<]*)<\/label><input([^>]*) \/><\/div>/g, 
  '<div className="sm:col-span-2"><Input variant="admin" label="$2" labelClassName="$1"$3 /></div>');

// 2. Normal div wrapper
c = c.replace(/<div><label className="([^"]*)">([^<]*)<\/label><input([^>]*) \/><\/div>/g, 
  '<div><Input variant="admin" label="$2" labelClassName="$1"$3 /></div>');

// 3. Nested flex items center gap-2 mb-1 div 
c = c.replace(/<div className="flex items-center gap-2 mb-1">\s*<label className="([^"]*)">([^<]*)<\/label>\s*<\/div>\s*<input([^>]*) \/>/g, 
  '<Input variant="admin" label="$2" labelClassName="$1"$3 />');

// 4. Tag input (no label)
c = c.replace(/<input\s+type="text"\s+value=\{tagInput\}/g, 
  '<Input variant="admin" type="text" value={tagInput}');

fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', c);
