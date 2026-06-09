const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Iniciando QA Test Súper Mega Completo del Storefront...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    const errors = [];
    const consoleLogs = [];

    // Capture console logs and errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`[CONSOLE ERROR] ${msg.text()}`);
        } else {
            consoleLogs.push(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        errors.push(`[PAGE ERROR] ${err.toString()}`);
    });

    page.on('requestfailed', request => {
        errors.push(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
    });

    console.log('🌐 Navegando a http://localhost:5173/');
    
    try {
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
        console.log('✅ Página cargada.');
        
        // Take a screenshot
        await page.screenshot({ path: 'qa-home-screenshot.png', fullPage: true });
        console.log('📸 Screenshot guardado en qa-home-screenshot.png');

        // Check for key elements
        const bodyHtml = await page.evaluate(() => document.body.innerHTML);
        
        // Look for MegaHero or other sections
        const hasHeader = bodyHtml.includes('<header');
        const hasMegaHero = bodyHtml.includes('MegaHero') || bodyHtml.includes('Promociones destacadas');
        const hasProducts = bodyHtml.includes('product-card') || bodyHtml.includes('Los Más Vendidos') || bodyHtml.includes('Nuevos Lanzamientos');
        
        console.log('\n--- 📊 RESULTADOS DE RENDERIZADO ---');
        console.log(`Header renderizado: ${hasHeader ? '✅ Sí' : '❌ No'}`);
        console.log(`Mega Hero renderizado: ${hasMegaHero ? '✅ Sí' : '❌ No'}`);
        console.log(`Productos renderizados: ${hasProducts ? '✅ Sí' : '❌ No'}`);

    } catch (e) {
        console.error('❌ Error cargando la página:', e.message);
    }

    console.log('\n--- 🛑 ERRORES ATRAPADOS EN EL NAVEGADOR ---');
    if (errors.length === 0) {
        console.log('✅ Ningún error detectado en el navegador.');
    } else {
        errors.forEach(e => console.log(e));
    }

    await browser.close();
    console.log('\n✅ QA Test finalizado.');
})();
