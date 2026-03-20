import { readFileSync, writeFileSync } from 'fs';

const buf = readFileSync('AI_CONTEXT.md');
let content = buf.toString('utf8');

// 1. Remove stray contamination in Project Status
content = content.replace(/ \|[ ]+\u00BFQu\u00E9 es esto\?/g, '');

// 2. Fix §1.9 table structure and remove malformed rows
const lines = content.split('\n');
let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('### 1.9 Nuevos archivos: Checklist')) {
        start = i;
    }
    if (start !== -1 && lines[i].includes('| Si tocaste... |')) {
        end = i;
        break;
    }
}

if (start !== -1 && end !== -1) {
    const middle = [
        '### 1.9 Nuevos archivos: Checklist',
        '',
        'Antes de crear un archivo nuevo, verificar:',
        '',
        '| Check | Pregunta |',
        '| :--- | :--- |',
        '| [ ] | ¿Respeta el flujo unidireccional (§1.1)? |',
        '| [ ] | ¿Usa tipos de `src/types/` en vez de definir inline? |',
        '| [ ] | ¿Importa `Section` de `@/types/constants`? |',
        '| [ ] | ¿Usa `useNotification` en vez de `react-hot-toast` directo? |',
        '| [ ] | ¿Usa `cn()` para clases condicionales? |',
        '| [ ] | ¿Usa `optimizeImage()` para imágenes de productos? |',
        '| [ ] | ¿Usa clases temáticas (`bg-theme-*`, `text-theme-*`)? |',
        '| [ ] | ¿Si tiene lógica \u2192 la l\u00F3gica va en `lib/domain/`? |',
        '| [ ] | ¿Si tiene lógica en `lib/domain/` \u2192 tiene tests? |',
        '| [ ] | ¿Sin `any`, sin `as X` innecesarios? |',
        '| [ ] | ¿Named export (no default)? |',
        '| [ ] | **¿Actualicé AI_CONTEXT.md para reflejar este cambio? (§1.10)** |',
        ''
    ];
    const finalContent = [...lines.slice(0, start), ...middle, ...lines.slice(end)].join('\n');
    writeFileSync('AI_CONTEXT.md', Buffer.from(finalContent, 'utf8'));
    console.log('Fixed AI_CONTEXT.md successfully.');
} else {
    console.log('Indices not found:', start, end);
}
