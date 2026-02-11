# 🗄️ Database Schema - Supabase

> Estado: **Pendiente** — Se implementará en Bloque 2.

## Schema Planificado

### Tabla: `products`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | gen_random_uuid() |
| name | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL |
| description | text | |
| price | numeric(10,2) | NOT NULL, >= 0 |
| stock | integer | DEFAULT 0 |
| sku | text | UNIQUE |
| section | text | 'vape' \| '420' |
| category_id | uuid (FK) | → categories.id |
| tags | text[] | DEFAULT '{}' |
| images | text[] | URLs de Storage |
| status | text | 'active' \| 'legacy' \| 'discontinued' \| 'coming_soon' |
| is_featured | boolean | DEFAULT false |
| is_new | boolean | DEFAULT false |
| is_active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### Tabla: `categories`

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | gen_random_uuid() |
| name | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL |
| section | text | 'vape' \| '420' |
| parent_id | uuid (FK, nullable) | → categories.id (subcategorías) |
| order_index | integer | Para ordenamiento |
| is_active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

## RLS (Row Level Security)

- Lectura pública para productos y categorías activas
- Escritura solo para usuarios con rol `admin`
- Políticas específicas se definirán en Bloque 2

## Próximos pasos

1. Crear migraciones SQL en `supabase/migrations/`
2. Configurar seed data con categorías predefinidas
3. Implementar RLS policies
