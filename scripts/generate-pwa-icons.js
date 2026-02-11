/**
 * Generador de iconos PWA - VSM Store
 *
 * Usa sharp para redimensionar el logo a múltiples tamaños.
 *
 * Uso:
 *   npm install sharp --save-dev
 *   node scripts/generate-pwa-icons.js
 *
 * Si sharp no está instalado, copia manualmente logo-vsm.png
 * a public/icons/ con los nombres requeridos.
 */
const path = require('path');
const fs = require('fs');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const INPUT = path.resolve(__dirname, '../public/logo-vsm.png');
const OUTPUT_DIR = path.resolve(__dirname, '../public/icons');

async function main() {
    // Crear carpeta de salida
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let sharp;
    try {
        sharp = require('sharp');
    } catch {
        console.log('⚠️  sharp no está instalado.');
        console.log('   Instálalo con: npm install sharp --save-dev');
        console.log('   O copia manualmente logo-vsm.png a public/icons/ con los tamaños requeridos.');
        console.log('');
        console.log('   Creando copias del logo como placeholder...');

        // Fallback: copiar el logo original a cada tamaño
        for (const size of SIZES) {
            const dest = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
            fs.copyFileSync(INPUT, dest);
            console.log(`   ✓ ${dest}`);
        }
        console.log('\n✅ Placeholders creados. Reemplazar con iconos redimensionados para producción.');
        return;
    }

    // Generar iconos redimensionados
    console.log('🎨 Generando iconos PWA...\n');

    for (const size of SIZES) {
        const output = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
        await sharp(INPUT)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 }, // #0f172a
            })
            .png()
            .toFile(output);

        console.log(`  ✓ icon-${size}x${size}.png`);
    }

    console.log('\n✅ Iconos PWA generados en public/icons/');
}

main().catch(console.error);
