# recetagram

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Notificación automática de nueva versión

Se añadió un flujo para avisar por push cuando hay un despliegue nuevo:

- Backend interno: `POST /api/v1/internal/release-notify` (protegido por secreto).
- Workflow: `/.github/workflows/release-push-notify.yml` (se ejecuta en `push` a `developer`).

### Variables necesarias

En backend (`backend/.env`):

- `APP_RELEASE_NOTIFY_SECRET=<secreto-largo-y-unico>`

En GitHub Actions (Secrets):

- `RELEASE_NOTIFY_URL` (ejemplo: `https://tu-api/api/v1/internal/release-notify`)
- `RELEASE_NOTIFY_SECRET` (mismo valor que `APP_RELEASE_NOTIFY_SECRET`)
- `FRONTEND_URL` (opcional, por defecto `https://recetagram.netlify.app`)

### Qué ocurre

1. Se hace `push` a `developer`.
2. El workflow llama al endpoint interno.
3. Backend envía push FCM global con mensaje de actualización.
4. Si el usuario toca la notificación, se abre la app en la URL configurada.
