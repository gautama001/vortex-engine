# Vortex Anchor Context

Este documento es la memoria portatil de Vortex Engine para Codex Desktop, Codex Cloud, Codespaces y cualquier agente que trabaje sobre el repo.

## Identidad

Vortex Engine es una app SaaS para TiendaNube/Nuvemshop que aumenta AOV, venta cruzada y ganancia atribuida mediante una capa liviana de recomendaciones, quick add, descuentos reales y analitica comercial.

La vision de largo plazo es Nitro: una red de intercambio de trafico non-compete entre merchants independientes. Nitro busca reducir dependencia de marketplaces y publicidad extractiva, conectando tiendas compatibles sin centralizar el checkout ni erosionar marca con descuentos masivos.

## Principios de trabajo

- Main es la rama productiva principal.
- No romper storefront vivo.
- No deployar cambios grandes sin validacion cloud.
- No depender de RAM local para build, typecheck, Prisma o dev server.
- No versionar secrets reales.
- No mezclar features con cambios pendientes no relacionados.
- Stagear archivos explicitamente.
- Evitar logs tecnicos visibles al merchant.
- Homologacion TiendaNube tiene prioridad sobre exploraciones Nitro.

## Entorno

Repo: `gautama001/vortex-engine`.

Dominio productivo: `https://vortexai.com.ar`.

Deploy productivo: Hostinger conectado a GitHub, rama `main`.

Entorno cloud recomendado: GitHub Codespaces con `.devcontainer/devcontainer.json`.

Comandos pesados deben correrse en cloud:

```bash
npm run typecheck
npm run build
npm run prisma:generate
npm run prisma:migrate
```

En desktop local solo usar operaciones livianas: inspeccion de archivos, diffs, commits chicos y push.

## Stack

- Next.js 15 App Router.
- React 19.
- TypeScript strict.
- Tailwind CSS 4.
- Prisma 6.
- PostgreSQL/Supabase.
- TiendaNube API.
- Script storefront desacoplado: `public/vortex-injector.js`.

## Variables criticas

Usar `.env.codespaces.example` como referencia. Secrets reales viven fuera del repo.

Variables principales:

- `DATABASE_URL`
- `DIRECT_URL`
- `TIENDANUBE_APP_ID`
- `TIENDANUBE_CLIENT_SECRET`
- `TIENDANUBE_APP_URL`
- `TIENDANUBE_SCOPES`
- `TIENDANUBE_API_VERSION`
- `TIENDANUBE_API_BASE_URL`
- `TIENDANUBE_AUTH_BASE_URL`
- `TIENDANUBE_PARTNER_USER_AGENT`
- `TIENDANUBE_SCRIPT_ID`
- `VORTEX_DEFAULT_LIMIT`

Scopes actuales esperados para homologacion y operacion:

- `read_products`
- `write_scripts`
- `read_orders`
- `write_coupons`
- `write_discounts`
- `write_charges`

Validar contra Partner Portal antes de homologar.

## Superficie publica

Rutas publicas:

- `/`
- `/privacy`
- `/support`
- `/api/health`

La homepage debe ser merchant-friendly, no tecnica. Debe explicar:

- que Vortex aumenta ticket promedio,
- que recomienda productos en PDP/carrito,
- que permite quick add,
- que puede aplicar descuentos reales,
- que muestra ganancia atribuida y ROI,
- que instala una capa liviana sin rearmar la tienda.

Evitar mostrar runtime/release/build state en narrativa comercial publica.

## App merchant

Ruta principal: `/app`.

Objetivo:

- configurar widget,
- elegir algoritmo,
- elegir productos manuales,
- setear descuentos por producto,
- preview desktop/mobile,
- abrir storefront,
- ver analytics y ganancia atribuida.

Algoritmos actuales:

- IA Engine / related semantic fallback.
- FBT / comprados juntos.
- Seleccion manual.

La preview debe mantener producto semilla visible aunque tambien este seleccionado como manual, porque eso habilita campañas de segunda unidad.

## Storefront

Injector principal: `public/vortex-injector.js`.

Debe:

- detectar PDP y carrito,
- resolver `store_id`,
- pedir recomendaciones a `/api/v1/recommendations`,
- renderizar widget liviano,
- ejecutar quick add,
- preparar descuento real via `/api/v1/store/discount-session`,
- no bloquear Core Web Vitals,
- funcionar aun si la API responde con fallback.

## Descuentos reales

Rutas relevantes:

- `POST /api/v1/store/discount-session`
- `POST /api/discounts/callback`

Modelo:

1. El storefront pide una discount session cuando el usuario elige una recomendacion con descuento.
2. Vortex valida proof/firma y crea o reutiliza promocion TiendaNube.
3. TiendaNube llama el callback de descuentos.
4. Vortex responde comandos `create_or_update_discount` o `remove_discount`.

Casos obligatorios:

- Cross-sell: producto A en carrito habilita descuento en producto B.
- Segunda unidad: producto A repetido habilita descuento solo sobre unidades elegibles de A.
- Si hay 1 unidad, no descuenta.
- Si hay 2 unidades, descuenta 1.
- Si hay 3 unidades, descuenta 1.
- Si hay 4 unidades, descuenta 2.
- Debe soportar que TiendaNube represente unidades repetidas como una linea con cantidad 2 o como varias lineas separadas.

No usar cupones compartibles para este flujo. El descuento debe quedar atado a callback/promotion/session.

## Analitica y ROI

Objetivo: reemplazar metricas dummy por datos reales.

Eventos importantes:

- impression,
- click,
- quick_add,
- discount_session_created,
- discount_applied,
- conversion/order attribution.

Principio de idempotencia:

- cada evento debe tener id deterministico o dedupe key,
- no duplicar conversiones por reload/callback repetido,
- atribuir revenue a Vortex solo si hay evidencia de interaccion con widget/session.

## Homologacion TiendaNube

Checklist P0:

- OAuth install/callback funcional.
- `/privacy` publico.
- `/support` publico.
- Webhooks privacy/customer/store redact implementados.
- Scopes consistentes con lo solicitado.
- App no muestra errores tecnicos al merchant.
- `/api/health` responde ok en produccion.
- Widget no rompe storefront si Vortex cae.
- Descuentos reales validados en tienda viva.

## Nitro Roadmap

Nitro es V1.1+ y no debe bloquear homologacion.

Pilares:

- discovery federado o pre-indexing por afinidad,
- origin token anonimo,
- handshake seguro para cross-store,
- descuentos cruzados no compartibles,
- grafo de intereses sin PII,
- loader asincronico con bajo CLS,
- governance anti-competidores directos.

Riesgo principal: privacidad, latencia, confianza merchant, y abuso de margen.

## Reglas para agentes cloud

Antes de editar:

1. Leer este documento.
2. Revisar `git status --short`.
3. Identificar archivos exactos a tocar.
4. No tocar cambios no relacionados.
5. No correr comandos destructivos.

Antes de push:

1. Correr validacion en cloud si es posible:

```bash
npm run typecheck
npm run build
```

2. Si la tarea es urgente y no se puede validar local/cloud, declarar explicitamente el riesgo.
3. Stagear solo archivos de la tarea.
4. Commit atomico.
5. Push a `main` solo si el cambio es productivo y aprobado.

## Estado mental del producto

Vortex no es solo un widget. Es una capa de inteligencia comercial para merchants independientes.

La prioridad actual es homologar, mantener estabilidad productiva y demostrar valor real en tiendas con ventas recurrentes.

La narrativa comercial debe ser simple:

> Vortex aumenta el ticket promedio recomendando productos correctos en el momento correcto, con quick add, descuentos inteligentes y ROI visible.
