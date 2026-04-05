# Recetagram Realtime

Servicio Socket.IO para recibir eventos desde `backend/` y emitirlos al frontend en tiempo real.

## Ejecutar

```bash
cd /home/ubuntu/recetagram/realtime
npm install
npm run dev
```

## Endpoint interno

- `POST /internal/notify`
- Requiere header `X-Internal-Secret`
- Emite `notification:new` al room `user:{id}`
