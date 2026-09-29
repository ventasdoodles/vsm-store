const fs = require('fs');

function refactorFile(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');

    // Replaces: <label...>Text</label> <input ... className={INPUT_CLS} ... />
    const regex = /<label className="[^"]*">([^<]+)<\/label>\s*<input([^>]*)className=\{INPUT_CLS\}([^>]*)\/>/g;
    code = code.replace(regex, (match, labelText, attr1, attr2) => {
        return `<Input variant="admin" labelClassName="text-2xs font-bold uppercase tracking-wider text-white/40" label="${labelText}"${attr1}${attr2}/>`;
    });

    // Replaces: <label...>Text</label> <input ... className={`${INPUT_CLS} ...`} ... />
    const regex2 = /<label className="[^"]*">([^<]+)<\/label>\s*<input([^>]*)className=\{\`\$\{INPUT_CLS\}([^`]*)\`\}([^>]*)\/>/g;
    code = code.replace(regex2, (match, labelText, attr1, attr2, attr3) => {
        return `<Input variant="admin" labelClassName="text-2xs font-bold uppercase tracking-wider text-white/40" label="${labelText}"${attr1}className="${attr2.trim()}"${attr3}/>`;
    });

    fs.writeFileSync(filepath, code);
}

refactorFile('src/components/admin/products/ProductEditorDrawer.tsx');
console.log("Replaced!");
