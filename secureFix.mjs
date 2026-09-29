import fs from 'fs';

// 1. AdminBatchManager.tsx
let f1 = 'src/pages/admin/AdminBatchManager.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

c1 = c1.replace(/className="w-full bg-white\/5 border border-white\/10 rounded-xl px-3 py-2 text-sm text-theme-primary focus:border-vape-500\/50 outline-none transition-all"\s*/g, '');

const searchRegex = /<div className="relative group">\s*<Search[^>]*\/>\s*<Input variant="admin"\s*placeholder="Filtrar por nombre o SKU\.\.\."\s*className="bg-white\/5 border border-white\/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white placeholder:text-white\/10 focus:outline-none focus:ring-1 focus:ring-vape-500\/30 transition-all w-64"\s*value=\{search\}\s*onChange=\{\(e\) => setSearch\(e\.target\.value\)\}\s*\/>\s*<\/div>/;
c1 = c1.replace(searchRegex, '<Input variant="admin" placeholder="Filtrar por nombre o SKU..." value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="w-64" leftIcon={<Search className="h-4 w-4 text-white/20 group-focus-within:text-vape-400 transition-colors" />} />');
fs.writeFileSync(f1, c1);
console.log("Fixed " + f1);

// 2. AdminProductForm.tsx
let f2 = 'src/pages/admin/AdminProductForm.tsx';
let c2 = fs.readFileSync(f2, 'utf8');

// Remove redundant labels
c2 = c2.replace(/\blabelClassName="mb-1 block text-xs font-medium text-theme-secondary"\s*/g, '');
c2 = c2.replace(/\blabelClassName="text-xs font-medium text-theme-secondary"\s*/g, '');

// Remove wrapper divs safely
c2 = c2.replace(/<div className="sm:col-span-2"><Input([^>]*)className=\{inputCls\}([^>]*)><\/div>/g, '<Input containerClassName="sm:col-span-2"$1$2/>');
c2 = c2.replace(/<div className="sm:col-span-2"><Input([^>]*)className=\{cn\(inputCls,\s*'font-mono'\)\}([^>]*)><\/div>/g, '<Input containerClassName="sm:col-span-2"$1className="font-mono"$2/>');
c2 = c2.replace(/<div>\s*<Input([^>]*)className=\{inputCls\}([^>]*)>\s*<\/div>/g, '<Input$1$2/>');
c2 = c2.replace(/<div>\s*<Input([^>]*)className=\{cn\(inputCls,\s*'font-mono'\)\}([^>]*)>\s*<\/div>/g, '<Input$1className="font-mono"$2/>');

fs.writeFileSync(f2, c2);
console.log("Fixed " + f2);
