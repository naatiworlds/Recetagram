# Recetagram

Repositorio unificado de `Recetagram` con frontend y backend separados por carpetas:

- `Frontend/`: aplicación Vue + Vite.
- `Backend/`: API Laravel.

## Estructura

```text
recetagram/
├── Frontend/
└── Backend/
```

## Configuración local

1. Copia `Frontend/.env.example` a `Frontend/.env` y define la URL del backend.
2. Copia `Backend/.env.example` a `Backend/.env` y ajusta base de datos y dominios.
3. Instala dependencias en cada carpeta.

## Arranque

Frontend:

```bash
cd /home/ubuntu/recetagram/Frontend
npm install
npm run dev
```

Backend:

```bash
cd /home/ubuntu/recetagram/Backend
composer install
php artisan serve
```

## Variables clave

- `Frontend/.env`: `VITE_API_URL=http://localhost:8000`
- `Backend/.env`: `FRONTEND_URL=http://localhost:5173`

## Nota

El frontend toma la URL base del backend desde `VITE_API_URL`, y el backend permite ese origen en CORS y Sanctum.