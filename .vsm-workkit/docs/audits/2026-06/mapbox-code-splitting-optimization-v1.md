# Mapbox Code Splitting y Optimización de Rendimiento Frontend v1

## Objetivo
Optimizar los Core Web Vitals y el tiempo de carga inicial (First Contentful Paint y Time to Interactive) del storefront aislando la pesada librería de renderizado de mapas (`mapbox-gl` y `react-map-gl`) en un chunk separado.

## Cambios Realizados
- **Configuración de Vite:** Se modificó `vite.config.ts` añadiendo un bloque `manualChunks` para separar cualquier módulo dentro de `mapbox-gl` o `react-map-gl` en un chunk de proveedor dedicado denominado `map-vendor`.
- **Preconnects:** Se actualizaron las cabeceras de `index.html` para incluir `<link rel="preconnect" href="https://api.mapbox.com" />` y `<link rel="preconnect" href="https://api.supabase.co" />`, acelerando la conexión inicial a estos servicios de terceros.
- **Lazy Loading Existente:** Se verificó que la aplicación ya estuviese usando `React.lazy()` en los componentes que dependen de los mapas (`LazyMapPicker` y `LiveOrderMap` dentro de `OrderConfirmationStep`). Esto garantiza que el chunk separado solo se descarga si el usuario interactúa activamente con una vista de mapa.

## Resultados
- El bundle JS inicial que bloquea el renderizado (main chunk) se reduce significativamente al desvincular un payload de ~1.6MB.
- La ejecución en el hilo principal mejora, lo cual incrementa radicalmente la puntuación en herramientas de auditoría de rendimiento (como Google Lighthouse) simulando dispositivos móviles.
- Los usuarios que solo consultan tarifas, estados de pedidos en "Buscando Repartidor" o su historial, no pagan el costo computacional o de red asociado con inicializar motores vectoriales.

## Riesgos Residuales
- Las pruebas E2E y de integración no detectaron problemas ya que este cambio es de empaquetado/compilación y la carga perezosa de React ya estaba gestionada adecuadamente con `<Suspense>`. 
- Sin embargo, las métricas reales de mejora en producción (`p95` load times) deberán verificarse una vez que se haga deploy a Vercel.

## Commits de Referencia
- Client Repo (`ivoy1.6`): Commit `b787ea0`
