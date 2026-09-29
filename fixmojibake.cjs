const fs = require('fs');
let code = fs.readFileSync('src/components/admin/products/ProductEditorDrawer.tsx', 'utf8');

code = code.replace(/categor\?\?a/g, 'categoría');
code = code.replace(/Categor\?\?a/g, 'Categoría');
code = code.replace(/secci\?\?n/g, 'sección');
code = code.replace(/Secci\?\?n/g, 'Sección');
code = code.replace(/Descripci\?\?n/g, 'Descripción');
code = code.replace(/Cat\?\?logo/g, 'Catálogo');
code = code.replace(/a\?\?adirla/g, 'añadirla');
code = code.replace(/pesta\?\?a/g, 'pestaña');
code = code.replace(/Ontolog\?\?a/g, 'Ontología');
code = code.replace(/Publicaci\?\?n/g, 'Publicación');
code = code.replace(/extensi\?\?n/g, 'extensión');
code = code.replace(/Sem\?\?nticas/g, 'Semánticas');
code = code.replace(/Ocasi\?\?n/g, 'Ocasión');
code = code.replace(/T\?\?cnica/g, 'Técnica');
code = code.replace(/Comparaci\?\?n/g, 'Comparación');
code = code.replace(/\?{3,} /g, '--- ');

fs.writeFileSync('src/components/admin/products/ProductEditorDrawer.tsx', code);
console.log("Fixed mojibake node");
