# Deploy en Vercel + Upstash

## 1. Subir a GitHub

```bash
git add .
git commit -m "Prode TUC inicial"
git push origin main
```

## 2. Importar en Vercel

1. Ir a [vercel.com/new](https://vercel.com/new) e importar el repositorio.
2. Usar el plan **Hobby** (gratis).

## 3. Configurar Upstash Redis

1. En el proyecto Vercel → **Storage** / **Marketplace**.
2. Instalar **Upstash Redis** con plan **Free**.
3. Conectar la base al proyecto (inyecta `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`).

## 4. Variables de entorno

En Vercel → Settings → Environment Variables:

| Variable | Valor |
|----------|-------|
| `JWT_SECRET` | Generar con `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Email del administrador del torneo |

Las variables de Upstash se agregan automáticamente al conectar Redis.

## 5. Deploy

Vercel despliega automáticamente. Compartir la URL con el grupo.

## Desarrollo local

```bash
cp .env.local.example .env.local
# Completar variables en .env.local
npm install
npm run dev
```

El primer usuario registrado con el email de `ADMIN_EMAIL` será administrador. Si no se define `ADMIN_EMAIL`, el primer usuario registrado será admin.
