import fs from "fs/promises";
import path from "path";

const targetDir = process.argv[2] || "src";
const outputFile = "ai-map.md";

async function walk(dir, fileList = []) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const stat = await fs.stat(path.join(dir, file));
        if (stat.isDirectory()) {
            if (!file.includes("__tests__") && !file.includes("node_modules")) {
                await walk(path.join(dir, file), fileList);
            }
        } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
            fileList.push(path.join(dir, file));
        }
    }
    return fileList;
}

async function distill() {
    console.log(`Destilando contexto desde: ${targetDir}...`);
    const files = await walk(path.resolve(targetDir));
    let mapContent = "# Mapa de Contexto (Destilado)\n\n";

    for (const file of files) {
        const content = await fs.readFile(file, "utf-8");
        const lines = content.split("\n");
        const exports = [];
        
        let inBlock = false;
        let blockStr = "";

        for (const line of lines) {
            const cleanLine = line.trim();
            // Extraer firmas de exportaciones
            if (cleanLine.startsWith("export type") || cleanLine.startsWith("export interface") || cleanLine.startsWith("export const") || cleanLine.startsWith("export function") || cleanLine.startsWith("export class")) {
                exports.push(cleanLine);
            }
        }

        if (exports.length > 0) {
            const relPath = path.relative(process.cwd(), file);
            mapContent += `### ${relPath}\n\`\`\`typescript\n${exports.join("\n")}\n\`\`\`\n\n`;
        }
    }

    await fs.writeFile(outputFile, mapContent, "utf-8");
    console.log(`? Mapa destilado generado en: ${outputFile} (${Buffer.byteLength(mapContent, "utf8")} bytes)`);
}

distill().catch(console.error);
