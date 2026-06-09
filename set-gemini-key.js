const { execSync } = require('child_process');
const fs = require('fs');

const apiKey = process.argv[2];

if (!apiKey) {
    console.error('\n❌ ERROR: Debes incluir tu API Key al ejecutar el script.');
    console.error('👉 Ejemplo: node set-gemini-key.js "AIzaSyXYZ..."\n');
    process.exit(1);
}

console.log('🚀 Inyectando Gemini API Key en el entorno local de Supabase...');

try {
    // 1. Guardar la variable en el sistema para Windows (User) para que write-edge-env la detecte
    console.log('1️⃣ Guardando la variable en el entorno de Windows...');
    execSync(`powershell -Command "[Environment]::SetEnvironmentVariable('GEMINI_API_KEY', '${apiKey}', 'User')"`, { stdio: 'inherit' });
    // Also set it in current process so the rest of the script works
    process.env.GEMINI_API_KEY = apiKey;

    // 2. Ejecutar el script que genera el .env de las edge functions
    console.log('\n2️⃣ Construyendo el .env local para las Edge Functions...');
    execSync('npm run local:write-edge-env', { stdio: 'inherit' });

    // 3. Inyectar los secretos directamente a Supabase local para asegurar
    console.log('\n3️⃣ Inyectando secretos en Supabase Local...');
    // Create a temporary .env just for the secret injection
    const tempEnvPath = require('path').join(require('os').tmpdir(), 'vsm-store-local-edge.env');
    if (fs.existsSync(tempEnvPath)) {
        execSync(`npx supabase secrets set --env-file "${tempEnvPath}"`, { stdio: 'inherit' });
    }

    // 4. Reiniciar las Edge Functions para que tomen la llave
    console.log('\n4️⃣ Reiniciando las Edge Functions...');
    execSync('npx supabase functions serve --env-file "%TEMP%\\vsm-store-local-edge.env" --no-verify-jwt --background', { stdio: 'ignore' }).catch(() => {
         // It might already be serving or background flag might fail, so we'll just restart
         try {
             execSync('npx supabase restart', { stdio: 'inherit' });
         } catch(e) {}
    });

    console.log('\n====================================================');
    console.log('✅ ¡GEMINI API KEY CONFIGURADA CORRECTAMENTE!');
    console.log('====================================================');
    console.log('El Asistente Concierge ahora debería funcionar al 100%.');
    console.log('Si quieres correr la auditoría de escenarios, ejecuta:');
    console.log('👉 npm run test:qa');

} catch (error) {
    console.error('\n❌ Hubo un error al configurar la llave:', error.message);
}
