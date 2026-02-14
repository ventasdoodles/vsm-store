// Script to resize PWA icons and optimize logo
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');
const logoPath = path.join(publicDir, 'logo-vsm.png');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function run() {
    console.log('🔧 Optimizing PWA icons...\n');

    // Check source logo
    const logoStats = fs.statSync(logoPath);
    console.log(`📦 Original logo: ${(logoStats.size / 1024 / 1024).toFixed(2)} MB`);

    // Resize each icon
    for (const size of ICON_SIZES) {
        const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
        const beforeSize = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;

        await sharp(logoPath)
            .resize(size, size, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(outputPath + '.tmp');

        // Replace
        fs.renameSync(outputPath + '.tmp', outputPath);
        const afterSize = fs.statSync(outputPath).size;

        console.log(
            `  ✅ icon-${size}x${size}.png: ${(beforeSize / 1024).toFixed(0)}KB → ${(afterSize / 1024).toFixed(0)}KB`
        );
    }

    // Optimize logo itself
    const optimizedLogoPath = path.join(publicDir, 'logo-vsm-optimized.png');
    await sharp(logoPath)
        .resize(512, 512, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
        .png({ quality: 85, compressionLevel: 9 })
        .toFile(optimizedLogoPath);

    const optimizedSize = fs.statSync(optimizedLogoPath).size;
    console.log(`\n  ✅ logo-vsm-optimized.png: ${(logoStats.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024).toFixed(0)}KB`);

    // Replace original
    fs.copyFileSync(optimizedLogoPath, logoPath);
    fs.unlinkSync(optimizedLogoPath);
    console.log('  ✅ Replaced original logo-vsm.png');

    const totalBefore = ICON_SIZES.length * logoStats.size + logoStats.size;
    let totalAfter = fs.statSync(logoPath).size;
    for (const size of ICON_SIZES) {
        totalAfter += fs.statSync(path.join(iconsDir, `icon-${size}x${size}.png`)).size;
    }

    console.log(`\n📊 Total: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024).toFixed(0)}KB`);
    console.log('🎉 Done!');
}

run().catch(console.error);
