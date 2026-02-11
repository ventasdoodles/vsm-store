# 🏗️ Visión General - VSM Store

## ¿Qué es?

VSM Store es un e-commerce dual que vende productos de **Vape** (vapeo tradicional) y **420** (cannabis/herbal) desde una sola plataforma.

## Modelo de Negocio

- **Secciones:** 2 (Vape + 420)
- **Categorías:** 11 total (5 vape + 6 herbal)
- **Target:** Usuarios mayores de edad en México
- **Dominio futuro:** vsm.app

## Categorías

### Vape (5)

1. **Mods** — Dispositivos de vapeo
2. **Atomizadores** — Tanques y RDAs
3. **Líquidos** — Subcategorías: Base Libre, Sales
4. **Coils/Resistencias** — Repuestos
5. **Accesorios** — Baterías, algodón, herramientas

### 420 (6)

6. **Vaporizers** — Vaporizadores de hierba
2. **Fumables** — Flores, pre-rolls
3. **Comestibles** — Gomitas, bebidas, chocolates
4. **Concentrados** — Wax, aceites, shatter
5. **Tópicos** — Cremas, bálsamos
6. **Accesorios** — Grinders, papeles, bongs

## Arquitectura General

```
Usuario → React SPA → Supabase (Auth + DB + Storage)
```

- **Frontend:** React 18 SPA con React Router
- **Backend:** Supabase (BaaS) — Auth, PostgreSQL, Storage
- **Estado:** React Query para cache de servidor
- **Estilos:** Tailwind CSS con colores por sección

## Fases del Proyecto

| Bloque | Descripción | Estado |
|--------|------------|--------|
| 1. Foundation | Estructura base del proyecto | ✅ Completo |
| 2. Database | Schema Supabase + migraciones | 🔲 Pendiente |
| 3. Products | CRUD productos + listados | 🔲 Pendiente |
| 4. Auth | Autenticación + perfiles | 🔲 Pendiente |
| 5. Cart | Carrito + checkout | 🔲 Pendiente |
| 6. Admin | Panel de administración | 🔲 Pendiente |
