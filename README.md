# Vortex Engine

Motor de recomendaciones para TiendaNube orientado a upsell/cross-sell, construido sobre Next.js App Router, Prisma y PostgreSQL.

## Stack

- Next.js 15 con App Router y TypeScript strict
- Prisma ORM + PostgreSQL
- Tailwind CSS 4 + componentes base con Radix UI
- Endpoints listos para despliegue en Vercel

## Setup

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea variables de entorno:

   ```bash
   cp .env.example .env
   ```

3. Aplica la migracion inicial:

   ```bash
   npx prisma migrate dev
   ```

4. Levanta la app:

   ```bash
   npm run dev
   ```

## Variables clave

- `DATABASE_URL`: connection string pooler de PostgreSQL para runtime.
- `DIRECT_URL`: connection string directa para migraciones Prisma.
- `TIENDANUBE_APP_ID`: App id del partner portal.
- `TIENDANUBE_CLIENT_SECRET`: Secret para OAuth, middleware admin y validacion de webhooks.
- `TIENDANUBE_APP_URL`: URL publica de la app.
- `TIENDANUBE_SCRIPT_ID`: Opcional. Si el ScriptTag no es auto-installed, Vortex lo asocia a la store tras el callback.

### Supabase + Prisma

- Usa `DATABASE_URL` con el pooler (`6543`) para la app.
- Usa `DIRECT_URL` (`5432`) para `prisma migrate deploy`.

## Endpoints

- `GET /oauth/tiendanube/install`
  - Redirecciona al flujo de instalacion OAuth 2.0.
- `GET /oauth/tiendanube/callback`
  - Intercambia `code` por `access_token`, persiste `Store` y crea cookie admin firmada.
- `GET /api/v1/recommendations`
  - Params: `store_id`, `product_id?`, `limit?`.
  - Estrategia: related by tag/category, fallback a best sellers.
- `POST /api/webhooks/tiendanube`
  - Verifica `X-Linkedstore-HMAC-SHA256` y sincroniza `status` de la store.

## Storefront script

El injector vive en `public/vortex-injector.js`.

- Detecta Product Page y Cart usando selectores `data-store`.
- Resuelve `store_id` desde el query param `store` que TiendaNube agrega al ScriptTag.
- Consume `/api/v1/recommendations`.
- Renderiza widget con Quick Add usando `LS.cart.addItem`.

## Estructura

```text
src/
  app/
  components/
  lib/
    tiendanube/
  services/
prisma/
public/
```
