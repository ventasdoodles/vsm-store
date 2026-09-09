import fs from "fs/promises";
import path from "path";

const targetPath = process.argv[2];
if (!targetPath) {
    console.error("Uso: node generate-tdd-stub.mjs <ruta-al-archivo>");
    process.exit(1);
}

async function run() {
    const fullPath = path.resolve(targetPath);
    const dir = path.dirname(fullPath);
    const ext = path.extname(fullPath);
    const baseName = path.basename(fullPath, ext);
    
    const isReact = ext === ".tsx" || ext === ".jsx";
    const testDir = path.join(dir, "__tests__");
    const testFile = path.join(testDir, `${baseName}.test${ext}`);
    
    await fs.mkdir(testDir, { recursive: true });
    
    try {
        await fs.access(testFile);
        console.log(`El archivo de prueba ya existe: ${testFile}`);
        return;
    } catch {}

    const importStatement = isReact 
        ? `import { render, screen } from "@testing-library/react";\nimport { describe, it, expect } from "vitest";\nimport { ${baseName} } from "../${baseName}";\n`
        : `import { describe, it, expect } from "vitest";\nimport * as ${baseName}Module from "../${baseName}";\n`;

    const stub = `${importStatement}
describe("${baseName}", () => {
    it("debería fallar inicialmente (Red-Green TDD)", () => {
        // TODO: Implementar prueba
        expect(true).toBe(false);
    });
});
`;

    await fs.writeFile(testFile, stub, "utf-8");
    console.log(`? TDD Stub generado exitosamente en: ${testFile}`);
}

run().catch(console.error);
