# Vortex Cloud Dev Runbook

Objetivo: trabajar Vortex desde cloud para que la PC local no pague el costo de RAM de builds, TypeScript, Prisma ni Next.

## Opcion recomendada: GitHub Codespaces

1. Abrir el repo `gautama001/vortex-engine` en GitHub.
2. Ir a `Code` -> `Codespaces` -> `Create codespace on main`.
3. Esperar el `postCreateCommand`: `npm ci`.
4. Cargar secrets del entorno como Codespaces Secrets o pegarlos en `.env.local` dentro del codespace.
5. Validar liviano:

```bash
npm run typecheck
```

6. Validar build en cloud:

```bash
npm run build
```

7. Empujar a `main` solo cuando el build cloud este verde.

## Secrets necesarios

No versionar estos valores reales en el repo.

```env
DATABASE_URL=
DIRECT_URL=
TIENDANUBE_APP_ID=
TIENDANUBE_CLIENT_SECRET=
TIENDANUBE_APP_URL=https://vortexai.com.ar
TIENDANUBE_SCOPES=read_products,write_scripts
TIENDANUBE_API_VERSION=2025-03
TIENDANUBE_API_BASE_URL=https://api.tiendanube.com
TIENDANUBE_AUTH_BASE_URL=https://www.tiendanube.com
TIENDANUBE_PARTNER_USER_AGENT=
TIENDANUBE_SCRIPT_ID=
VORTEX_DEFAULT_LIMIT=4
```

## Regla operativa

- Local desktop: solo edicion chica, diffs, commits y navegador.
- Codespaces: `npm ci`, `npm run typecheck`, `npm run build`, Prisma y pruebas pesadas.
- Hostinger: deploy productivo desde `main`.

## Checklist antes de homologacion

- `npm run typecheck` verde en cloud.
- `npm run build` verde en cloud.
- `/api/health` responde `ok: true` en produccion.
- `/privacy` y `/support` publicos.
- OAuth install/callback funcional.
- Widget PDP/cart funcional.
- Descuento real y segunda unidad validados en tienda viva.
