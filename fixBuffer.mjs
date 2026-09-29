import fs from 'fs';

function fixBuffer(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Sometimes UTF-8 gets saved as Latin-1. We can reverse it:
    // try to find Ã and other latin1 characters that signify double encoding
    if (code.includes('Ã')) {
        // convert string back to latin1 bytes, then decode as utf8
        const buffer = Buffer.from(code, 'latin1');
        code = buffer.toString('utf8');
        fs.writeFileSync(filePath, code);
        console.log("Decoded double UTF8 in " + filePath);
    }
}

fixBuffer('src/components/admin/products/ProductEditorDrawer.tsx');
fixBuffer('src/pages/admin/AdminProductForm.tsx');
fixBuffer('src/pages/admin/AdminBatchManager.tsx');
