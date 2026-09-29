import fs from 'fs';

let f2 = 'src/pages/admin/AdminProductForm.tsx';
let c2 = fs.readFileSync(f2, 'utf8');

c2 = c2.replace(/className=\{inputCls\}\s*/g, '');
c2 = c2.replace(/className=\{cn\(inputCls,\s*'font-mono'\)\}/g, 'className="font-mono"');

c2 = c2.replace(/<div className="sm:col-span-2">\s*(<Input[^>]+\/>)\s*<\/div>/g, (m, g1) => {
    return g1.replace('<Input ', '<Input containerClassName="sm:col-span-2" ');
});
c2 = c2.replace(/<div>\s*(<Input[^>]+\/>)\s*<\/div>/g, '$1');

c2 = c2.replace(/Descripci\?\?n/g, 'Descripción');
c2 = c2.replace(/b\?\?sica/g, 'básica');
c2 = c2.replace(/Pr\?\?ximamente/g, 'Próximamente');
c2 = c2.replace(/Categor\?\?a/g, 'Categoría');

fs.writeFileSync(f2, c2);
console.log("Fixed " + f2);
