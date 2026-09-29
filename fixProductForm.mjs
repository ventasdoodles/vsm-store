import fs from 'fs';

let file = 'src/pages/admin/AdminProductForm.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove labelClassName="..."
code = code.replace(/\blabelClassName="[^"]*"\s*/g, '');

// 2. Remove className={inputCls} from Input tags specifically
// Let's match `<Input ... className={inputCls} ... />`
code = code.replace(/(<Input[^>]*?)\s*className=\{inputCls\}\s*([^>]*>)/g, '$1 $2');
code = code.replace(/(<Input[^>]*?)\s*className=\{cn\(inputCls,\s*'font-mono'\)\}\s*([^>]*>)/g, '$1 className="font-mono" $2');

// 3. Remove wrapper divs safely
// Match: <div className="sm:col-span-2">\s*<Input ... />\s*</div>
code = code.replace(/<div className="sm:col-span-2">\s*(<Input[^>]*\/>)\s*<\/div>/g, (match, inputTag) => {
    return inputTag.replace('<Input ', '<Input containerClassName="sm:col-span-2" ');
});

// Match: <div>\s*<Input ... />\s*</div>
code = code.replace(/<div>\s*(<Input[^>]*\/>)\s*<\/div>/g, '$1');

fs.writeFileSync(file, code);
console.log("Fixed AdminProductForm.tsx");
