import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Catch uncaught exceptions
    page.on('pageerror', err => {
        console.error('Page error:', err.toString());
    });

    // Catch console logs
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('Console error:', msg.text());
        }
    });

    const urlsToTest = [
        'http://localhost:5173/',
        'http://localhost:5173/vape',
        'http://localhost:5173/vape/mods',
        'http://localhost:5173/vape/mod-starter-kit-200w', // guessing a slug
    ];

    for (const url of urlsToTest) {
        console.log(`Testing ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        // Check if ErrorBoundary text is present
        const hasError = await page.evaluate(() => {
            return document.body.innerText.includes('Algo salió mal');
        });
        if (hasError) {
            console.log(`❌ ${url} CRASHED (Error Boundary detected)!`);
        } else {
            console.log(`✅ ${url} loaded fine.`);
        }
    }

    await browser.close();
})();
