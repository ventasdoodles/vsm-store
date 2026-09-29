import fs from 'fs';

function fixMojibake(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Double UTF-8 decoding technique
    // Read the string as latin1, then decode as utf8
    // Wait, it's safer to just replace known patterns
    
    code = code.replace(/categorÃ­a/g, 'categoría');
    code = code.replace(/CategorÃ­a/g, 'Categoría');
    code = code.replace(/secciÃ³n/g, 'sección');
    code = code.replace(/SecciÃ³n/g, 'Sección');
    code = code.replace(/DescripciÃ³n/g, 'Descripción');
    code = code.replace(/CatÃ¡logo/g, 'Catálogo');
    code = code.replace(/aÃ±adirla/g, 'añadirla');
    code = code.replace(/pestaÃ±a/g, 'pestaña');
    code = code.replace(/OntologÃ­a/g, 'Ontología');
    code = code.replace(/PublicaciÃ³n/g, 'Publicación');
    code = code.replace(/extensiÃ³n/g, 'extensión');
    code = code.replace(/SemÃ¡nticas/g, 'Semánticas');
    code = code.replace(/OcasiÃ³n/g, 'Ocasión');
    code = code.replace(/TÃ©cnica/g, 'Técnica');
    code = code.replace(/ComparaciÃ³n/g, 'Comparación');
    
    // Sometimes it's already encoded as ├â┬¡ in Windows
    // Let's also do a blanket replacement for anything looking like it
    code = code.replace(/categor├â┬¡a/g, 'categoría');
    code = code.replace(/Categor├â┬¡a/g, 'Categoría');
    code = code.replace(/secci├â┬│n/g, 'sección');
    code = code.replace(/Secci├â┬│n/g, 'Sección');
    code = code.replace(/Descripci├â┬│n/g, 'Descripción');
    code = code.replace(/Cat├â┬¡logo/g, 'Catálogo');
    
    fs.writeFileSync(filePath, code);
}

fixMojibake('src/components/admin/products/ProductEditorDrawer.tsx');
fixMojibake('src/pages/admin/AdminProductForm.tsx');
fixMojibake('src/pages/admin/AdminBatchManager.tsx');
console.log("Fixed mojibake properly");
