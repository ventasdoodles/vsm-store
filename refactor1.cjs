const fs = require('fs');
const glob = require('glob');

function replaceAll(str, mapObj) {
    const re = new RegExp(Object.keys(mapObj).join("|"),"g");
    return str.replace(re, function(matched){
        return mapObj[matched];
    });
}

function processFile(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    let original = content;
    
    // Add import
    if (!content.includes('import { Input } from "@/components/ui/Input";') && !content.includes("import { Input } from '@/components/ui/Input';")) {
        // Find last import
        content = content.replace(/import .*\n/s, (match) => {
            // we will just prepend it to the first import
            return 'import { Input } from "@/components/ui/Input";\n' + match;
        });
        // If it didn't work well we do it explicitly
        if (content === original) {
           content = 'import { Input } from "@/components/ui/Input";\n' + content;
        }
    }
    
    // Specific regexes to replace inputs
    
    // TabInteractions
    if (path.includes('TabInteractions')) {
        content = content.replace(/<input\s+type="text"\s+placeholder="Ej: Recuerda ofrecer color azul\.\.\."\s+className="[^"]*"\s+value=\{activeInteractionId === interaction\.id \? note : ''\}\s+onChange=\{\(e\) => \{\s*setActiveInteractionId\(interaction\.id\);\s*setNote\(e\.target\.value\);\s*\}\}\s*\/>/m,
            `<Input \n                                        variant="admin"\n                                        type="text" \n                                        placeholder="Ej: Recuerda ofrecer color azul..."\n                                        className="flex-1"\n                                        value={activeInteractionId === interaction.id ? note : ''}\n                                        onChange={(e) => {\n                                            setActiveInteractionId(interaction.id);\n                                            setNote(e.target.value);\n                                        }}\n                                    />`);
    }

    // TabTraining
    if (path.includes('TabTraining')) {
        content = content.replace(/<input\s+type="url"\s+placeholder="https:\/\/\.\.\."\s+className="[^"]*"\s*\/>/m,
            `<Input \n                                variant="admin"\n                                type="url" \n                                placeholder="https://..."\n                                className="flex-1"\n                            />`);
            
        content = content.replace(/<div>\s*<label className="([^"]*)">([^<]*)<\/label>\s*<input\s+type="text"\s+defaultValue="Cesarin"\s+className="[^"]*"\s*\/>\s*<\/div>/m,
            `<Input \n                                    variant="admin"\n                                    labelClassName="$1"\n                                    label="$2"\n                                    type="text" \n                                    defaultValue="Cesarin"\n                                    className="w-full"\n                                />`);
            
        content = content.replace(/<div>\s*<label className="([^"]*)">([^<]*)<\/label>\s*<input\s+type="text"\s+defaultValue="Eres un vendedor experto, amable y muy servicial\."\s+className="[^"]*"\s*\/>\s*<\/div>/m,
            `<Input \n                                    variant="admin"\n                                    labelClassName="$1"\n                                    label="$2"\n                                    type="text" \n                                    defaultValue="Eres un vendedor experto, amable y muy servicial."\n                                    className="w-full"\n                                />`);
    }

    fs.writeFileSync(path, content, 'utf8');
}

['src/components/admin/cesarin/TabInteractions.tsx', 'src/components/admin/cesarin/TabTraining.tsx'].forEach(f => {
    processFile('C:/dev/vsm-store-fresh/' + f);
});
