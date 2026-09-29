import fs from 'fs';

let f2 = 'src/pages/admin/AdminProductForm.tsx';
let c2 = fs.readFileSync(f2, 'utf8');

c2 = c2.replace(/<div className="sm:col-span-2"><Input([^>]*)className=\{inputCls\}([^>]*)\/><\/div>/g, '<Input containerClassName="sm:col-span-2"$1$2/>');
c2 = c2.replace(/<div className="sm:col-span-2"><Input([^>]*)className=\{cn\(inputCls,\s*'font-mono'\)\}([^>]*)\/><\/div>/g, '<Input containerClassName="sm:col-span-2"$1className="font-mono"$2/>');
c2 = c2.replace(/<div>\s*<Input([^>]*)className=\{inputCls\}([^>]*)\/>\s*<\/div>/g, '<Input$1$2/>');
c2 = c2.replace(/<div>\s*<Input([^>]*)className=\{cn\(inputCls,\s*'font-mono'\)\}([^>]*)\/>\s*<\/div>/g, '<Input$1className="font-mono"$2/>');

// Remaining ones that might just have \n and spaces
c2 = c2.replace(/<div>\s*<Input([^>]*)\/>\s*<\/div>/g, '<Input$1/>');

c2 = c2.replace(/Descripci\?\?n/g, 'Descripción');
c2 = c2.replace(/b\?\?sica/g, 'básica');
c2 = c2.replace(/Pr\?\?ximamente/g, 'Próximamente');
c2 = c2.replace(/Categor\?\?a/g, 'Categoría');

fs.writeFileSync(f2, c2);
console.log("Fixed " + f2);
