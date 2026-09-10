import fs from "fs/promises";
import path from "path";

const targetDirs = [
    "src/components/cart",
    "src/components/checkout",
    "src/components/admin",
    "src/pages/admin",
    "src/components/home",
    "src/pages/Home.tsx"
];

async function walk(target, fileList = []) {
    const stat = await fs.stat(target);
    if (stat.isDirectory()) {
        const files = await fs.readdir(target);
        for (const file of files) {
            await walk(path.join(target, file), fileList);
        }
    } else if (target.endsWith(".tsx")) {
        fileList.push(target);
    }
    return fileList;
}

async function replace() {
    console.log("Iniciando reemplazo estructural de componentes UI...");
    let files = [];
    for (const dir of targetDirs) {
        try {
            files = await walk(path.resolve(dir), files);
        } catch(e) {
            console.log("No se encontro:", dir);
        }
    }
    
    let totalModificados = 0;

    for (const file of files) {
        let content = await fs.readFile(file, "utf-8");
        let modified = false;

        // Button replacements
        if (content.includes("<button") || content.includes("</button>")) {
            content = content.replace(/<button\b/g, "<Button").replace(/<\/button>/g, "</Button>");
            modified = true;
            if (!content.includes("import { Button }") && !content.includes("import {Button}")) {
                content = `import { Button } from "@/components/ui/Button";\n` + content;
            }
        }

        // Heading replacements
        const headingRegexes = [
            { tag: "h1", open: /<h1\b/g, openExact: /<h1>/g, close: /<\/h1>/g },
            { tag: "h2", open: /<h2\b/g, openExact: /<h2>/g, close: /<\/h2>/g },
            { tag: "h3", open: /<h3\b/g, openExact: /<h3>/g, close: /<\/h3>/g },
            { tag: "h4", open: /<h4\b/g, openExact: /<h4>/g, close: /<\/h4>/g },
            { tag: "h5", open: /<h5\b/g, openExact: /<h5>/g, close: /<\/h5>/g },
            { tag: "h6", open: /<h6\b/g, openExact: /<h6>/g, close: /<\/h6>/g }
        ];

        let needsHeadingImport = false;
        for (const h of headingRegexes) {
            if (content.includes(`<${h.tag}`) || content.includes(`</${h.tag}>`)) {
                content = content
                    .replace(h.openExact, `<Heading as="${h.tag}">`)
                    .replace(h.open, `<Heading as="${h.tag}"`)
                    .replace(h.close, `</Heading>`);
                modified = true;
                needsHeadingImport = true;
            }
        }

        if (needsHeadingImport && !content.includes("import { Heading }") && !content.includes("import {Heading}")) {
            content = `import { Heading } from "@/components/ui/Heading";\n` + content;
        }

        if (modified) {
            await fs.writeFile(file, content, "utf-8");
            totalModificados++;
            console.log(`Estructura actualizada: ${path.relative(process.cwd(), file)}`);
        }
    }

    console.log(`\n✅ Reemplazo completo. Archivos modificados: ${totalModificados}`);
}

replace().catch(console.error);
