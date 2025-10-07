# AmaDeCasa — Frontend

Interfaz web de **AmaDeCasa**, construida con **React + Vite + TypeScript**. Implementa el **login con sesión por cookie** y flujo de **aprobación por Telegram** (primera autenticación de dispositivo o inactividad ≥ 30 días), consumiendo la API del backend.

---

## 🧱 Stack

* **React 18** + **Vite** (TypeScript)
* Fetch nativo con `credentials: "include"` (cookies)
* Docker (desarrollo y producción)
* Nginx (solo en producción) para servir la SPA y proxy de `/api` hacia el backend

---

## 📁 Estructura del proyecto

```
web/
├─ index.html
├─ nginx.conf                 # Nginx para producción (se copia al contenedor)
├─ src/
│  ├─ api/
│  │  └─ auth.ts             # API client (login, status, logout) + deviceId
│  ├─ pages/
│  │  └─ Login.tsx           # Pantalla de login y flujo “pending_telegram”
│  ├─ App.tsx                # Monta LoginPage
│  ├─ main.tsx               # Entrypoint React
│  └─ index.css              # Estilos básicos
├─ Dockerfile                # Dev (Vite) | Build | Prod (Nginx)
├─ .env.example              # Variables de entorno (ejemplo)
└─ README.md                 # Este archivo
```

---

## ⚙️ Variables de entorno

Crea un archivo `.env` (no se versiona) a partir de `.env.example`:

```env
# Dirección del backend (API)
VITE_API_BASE=http://localhost:3001
```

> **Desarrollo local (sin Docker):** usa `http://localhost:3001` o la IP de tu máquina en la LAN.
>
> **Docker (dev):** el `docker-compose.yml` del monorepo inyecta `VITE_API_BASE`. Si accedes desde otro dispositivo de la red, ajusta a `http://IP_DE_TU_PC:3001`.
>
> **Producción (Docker):** el Nginx de `web` hace **proxy** de `/api` hacia el servicio `api`, por lo que `VITE_API_BASE` no es necesario; las peticiones se realizan contra el **mismo origen** (`/api/...`).

---

## 🚀 Puesta en marcha

### Opción A — Desarrollo local (sin Docker)

1. Instala dependencias:

```bash
npm ci
```

2. Crea `.env` (ver sección anterior).
3. Arranca Vite:

```bash
npm run dev
```

4. Abre `http://localhost:5173`.

> Requiere el backend corriendo (puerto 3001 por defecto).

### Opción B — Con Docker Compose (recomendado)

> Los archivos `Dockerfile` y `nginx.conf` viven en `web/`, pero el `docker-compose.yml` está en la raíz del monorepo (junto a `api/` y `web/`).

**Desarrollo:**

```bash
# desde la raíz del monorepo (../amade)
docker compose --profile dev up --build
# Frontend: http://localhost:5173  |  Backend: http://localhost:3001
```

**Producción (build estático + Nginx + API prod):**

```bash
docker compose --profile prod up --build -d
# Frontend: http://localhost:8080 (sirve SPA); /api se proxya al servicio api
```

Para detener:

```bash
docker compose --profile dev down
# o
docker compose --profile prod down
```

---

## 🔐 Autenticación (resumen)

* **Login** con `ownerName`, `role` (`admin|assistant|guest`) y `password` (según rol).
* El **deviceId** se genera y persiste en `localStorage` (`amade_device_id`).
* El backend responde:

  * `200 OK` + cookie **JWT** si el dispositivo ya está **aprobado**.
  * `202 Accepted` con `status: "pending_telegram"` si requiere **aprobación por Telegram**. Tras aprobar, volver a presionar **“Ya aprobé”** o reintentar el login.
* Sesión mantenida por **cookie HTTP-only** (el frontend NO maneja tokens directamente).

Componentes clave:

* `src/api/auth.ts` — funciones `login/status/logout` y utilidades (deviceId).
* `src/pages/Login.tsx` — UI de login y flujo *pending_telegram*.

---

## 🧪 Scripts de npm

```bash
# Ejecuta Vite en desarrollo
npm run dev

# Compila build estático a /dist
npm run build

# Previsualiza el build localmente (sirve /dist)
npm run preview
```

---

## 🛡️ Buenas prácticas de seguridad

* **Nunca** commitear `.env` reales. Este repo incluye `.env.example`.
* Evitar poner claves en el código. Configurar `VITE_API_BASE` desde entorno.
* En producción, usar **mismo origen** y proxy `/api` via Nginx (evita CORS expuesto).

---

## 🧩 Resolución de problemas

* **Página en blanco / error “Illegal invocation”**: asegúrate de tener la versión de `randomId` que usa `globalThis.crypto.getRandomValues` y que `main.tsx` monte `<App />` en `#root`.
* **No llega Telegram al loguear**: verifica en backend `APP_PUBLIC_BASE_URL` (URL que se envía en el mensaje), conectividad a Telegram desde el contenedor y que el dispositivo sea **nuevo** (regenerar `amade_device_id`).
* **CORS** en desarrollo: el backend debe permitir `credentials` y el `origin` del Vite (`5173`). Con Docker (prod) se evita usando proxy de Nginx.
* **404 favicon** en dev: opcional; agrega un `favicon.ico` o ignora el warning.

---

## 🤝 Contribución

* Metodología: **“solo una instrucción a la vez”** para tareas, pruebas y conversaciones.
* Crea ramas `feature/*`, PRs pequeños, y añade notas de configuración si tocas `.env`.

---

## 📄 Licencia

Privado para uso doméstico (AmaDeCasa). Ajusta según necesidades si decides abrir el proyecto.
