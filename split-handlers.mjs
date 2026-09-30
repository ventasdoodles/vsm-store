import fs from 'fs';
import path from 'path';

const fileContent = fs.readFileSync('src/services/concierge/capsule-dispatcher.ts', 'utf8');

const importsMatch = fileContent.match(/^(import.*?)\n\nexport interface/s);
const imports = importsMatch ? importsMatch[1] : '';

const typesMatch = fileContent.match(/(export interface DispatchClientCapsuleParams.*?\}\n\nexport interface ClientCapsuleDispatchResult.*?\}\n)/s);
const types = typesMatch ? typesMatch[1] : '';

// Move types to a types file if not there, but they are in capsule-dispatcher.ts. We can just import them.
const handlerTemplate = (name, body) => `
${imports}
import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';

export async function handle_${name}(
    params: DispatchClientCapsuleParams,
    noWriteSmokeActive: boolean
): Promise<ClientCapsuleDispatchResult | null> {
    const { data, query, history, customerProfile, catalogGate, turnAnalysis, sourceContext, invokeStart, effectiveTelemetrySessionId } = params;
    
${body}
}
`;

const blocks = [];
const lines = fileContent.split('\n');

let currentBlockName = null;
let currentBlockLines = [];

for (let i = 81; i < lines.length; i++) {
    const line = lines[i];
    
    const match = line.match(/^\s*if\s*\(data\.capsule_name\s*===\s*'([^']+)'\)\s*\{\s*$/);
    if (match) {
        if (currentBlockName) {
            blocks.push({ name: currentBlockName, lines: currentBlockLines });
        }
        currentBlockName = match[1];
        currentBlockLines = []; // Don't include the 'if' line itself
        continue;
    }
    
    if (currentBlockName) {
        // Stop if we hit the end of the file or something else outside the ifs.
        // Wait, each block ends with `                }`
        if (line.match(/^\s*\}\s*$/) && (lines[i+1] === '' || lines[i+1] === undefined || lines[i+1].match(/^\s*if/))) {
            // End of block
            blocks.push({ name: currentBlockName, lines: currentBlockLines });
            currentBlockName = null;
            currentBlockLines = [];
            continue;
        }
        currentBlockLines.push(line);
    }
}

if (currentBlockName) {
    blocks.push({ name: currentBlockName, lines: currentBlockLines });
}

if (!fs.existsSync('src/services/concierge/handlers')) {
    fs.mkdirSync('src/services/concierge/handlers');
}

let strategyRegistry = `
import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
`;

const indexExports = [];
const handlerMappings = [];

blocks.forEach(block => {
    // Strip one level of indentation (16 spaces or 4 indents) if possible, but safely.
    const body = block.lines.map(l => l.replace(/^ {20}/, '    ')).join('\n');
    
    // Some lines might have extra 'return null;' at the end of the file.
    const cleanBody = body;

    const safeName = block.name.replace(/_/g, '-');
    const funcName = `handle${block.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    
    const fileOutput = `
${imports}
import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';

export const ${funcName} = async (
    params: DispatchClientCapsuleParams,
    noWriteSmokeActive: boolean
): Promise<ClientCapsuleDispatchResult | null> => {
    const { data, query, history, customerProfile, catalogGate, turnAnalysis, sourceContext, invokeStart, effectiveTelemetrySessionId } = params;
    
${cleanBody}
};
`;
    
    fs.writeFileSync(`src/services/concierge/handlers/${safeName}.handler.ts`, fileOutput.trim() + '\n');
    
    strategyRegistry += `import { ${funcName} } from './${safeName}.handler';\n`;
    handlerMappings.push(`    '${block.name}': ${funcName},`);
});

strategyRegistry += `

export type CapsuleHandlerFn = (params: DispatchClientCapsuleParams, noWriteSmokeActive: boolean) => Promise<ClientCapsuleDispatchResult | null>;

export const capsuleHandlers: Record<string, CapsuleHandlerFn> = {
${handlerMappings.join('\n')}
};
`;

fs.writeFileSync('src/services/concierge/handlers/index.ts', strategyRegistry.trim() + '\n');
console.log("Extracted " + blocks.length + " handlers.");
