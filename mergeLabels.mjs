import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

walk('src/pages', (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let code = fs.readFileSync(filePath, 'utf8');
    
    const regex = /<label[^>]*>([^<]+)<\/label>[\s\n\r]*<Input([\s\S]*?)\/>/g;
    
    let replaced = false;
    code = code.replace(regex, (match, labelText, inputAttrs) => {
        // Prevent matching across elements
        if (inputAttrs.includes('<Input')) return match;
        
        replaced = true;
        // get the label class if it exists
        let labelClassMatch = match.match(/<label[^>]*className="([^"]*)"/);
        let labelClasses = labelClassMatch ? labelClassMatch[1] : '';
        
        inputAttrs = inputAttrs.replace(/\s*label="[^"]*"/, '');
        inputAttrs = inputAttrs.replace(/\s*labelClassName="[^"]*"/, '');
        
        return `<Input labelClassName="${labelClasses}" label="${labelText}"${inputAttrs}/>`;
    });
    
    if (replaced) {
        fs.writeFileSync(filePath, code);
        console.log("Merged labels in: " + filePath);
    }
});

