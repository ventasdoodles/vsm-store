import fs from "fs/promises";
import path from "path";

const targetDir = "src";

const replacements = [
    // Radios (Bordes)
    { regex: /rounded-\[10px\]|rounded-\[12px\]|rounded-\[14px\]|rounded-\[16px\]/g, replacement: "rounded-xl" },
    { regex: /rounded-\[8px\]/g, replacement: "rounded-lg" },
    { regex: /rounded-\[20px\]|rounded-\[24px\]/g, replacement: "rounded-2xl" },
    
    // Tipografía (Micro)
    { regex: /text-\[10px\]|text-\[11px\]/g, replacement: "text-2xs" },
    { regex: /text-\[12px\]/g, replacement: "text-xs" },
    { regex: /text-\[13px\]|text-\[14px\]/g, replacement: "text-sm" },
    { regex: /text-\[15px\]|text-\[16px\]/g, replacement: "text-base" },
    
    // Superficies
    { regex: /bg-\[#13141f\]/gi, replacement: "bg-surface-base" },
    { regex: /bg-\[#1a1c29\]/gi, replacement: "bg-surface-card" },
    { regex: /bg-\[#1e2538\]/gi, replacement: "bg-surface-elevated" },
    { regex: /bg-\[#0a0a0f\]/gi, replacement: "bg-surface-overlay" },
    { regex: /bg-\[#111827\]|bg-\[#1f2937\]|bg-\[#000000\]/gi, replacement: "bg-surface-base" }, // Oscuros genéricos
    
    // Textos
    { regex: /text-\[#a1a1aa\]|text-\[#9ca3af\]|text-\[#8b8d98\]|text-\[#6b7280\]/gi, replacement: "text-theme-secondary" },
    { regex: /text-\[#ffffff\]|text-\[#f8fafc\]|text-\[#f1f5f9\]/gi, replacement: "text-theme-primary" },
    { regex: /text-\[#3b82f6\]|text-\[#60a5fa\]|text-\[#2563eb\]/gi, replacement: "text-theme" }
];

async function walk(dir, fileList = []) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const stat = await fs.stat(path.join(dir, file));
        if (stat.isDirectory()) {
            await walk(path.join(dir, file), fileList);
        } else if (file.endsWith(".tsx")) {
            fileList.push(path.join(dir, file));
        }
    }
    return fileList;
}

async function normalize() {
    console.log("Iniciando barrido de normalizacion UI...");
    const files = await walk(path.resolve(targetDir));
    let totalModificados = 0;

    for (const file of files) {
        let content = await fs.readFile(file, "utf-8");
        let modified = false;

        for (const rule of replacements) {
            if (rule.regex.test(content)) {
                content = content.replace(rule.regex, rule.replacement);
                modified = true;
            }
        }

        if (modified) {
            await fs.writeFile(file, content, "utf-8");
            totalModificados++;
            console.log(`Normalizado: ${path.relative(process.cwd(), file)}`);
        }
    }

    console.log(`\n? Normalizacion completa. Archivos modificados: ${totalModificados}`);
}

normalize().catch(console.error);
