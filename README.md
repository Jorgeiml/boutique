# Onboarding local — Boutique (Windows + WSL2)

> Objetivo: levantar **API + Web + DB** en local con Docker y WSL2 (Ubuntu 24.04), y dejar listo el flujo de trabajo con Git.

---

## 0) Requisitos

- Windows 10/11 (permiso administrador)
- **WSL2** + **Ubuntu 24.04**
- **Docker Desktop** (con WSL2 backend)
- **VS Code** + extensión **Remote – WSL**
- **Git** y **Node.js 20.x** instalados en Ubuntu
- Cuenta de GitHub con acceso al repo

---

## 1) Instalar WSL2 + Ubuntu

1. Abre **PowerShell (Administrador)** y ejecuta:
   ```powershell
   wsl --install
   ```
   Reinicia si te lo pide.
2. Desde Microsoft Store instala **Ubuntu 24.04** y crea tu usuario Linux (ej: `rebeca`).

---

## 2) Docker Desktop (WSL2 backend)

1. Instala **Docker Desktop** para Windows.
2. Abre **Settings → Resources → WSL Integration**:
   - Marca **Use the WSL 2 based engine**.
   - Activa tu distro **Ubuntu**.
3. Aplica cambios y reinicia Docker Desktop.

---

## 3) VS Code + WSL

1. Instala **VS Code** y la extensión **Remote – WSL**.
2. En Ubuntu (terminal), abre VS Code:
   ```bash
   code .
   ```
   Verás `[WSL: Ubuntu]` en la barra inferior.

---

## 4) Preparar Ubuntu (una sola vez)

```bash
# Actualiza paquetes
sudo apt update && sudo apt -y upgrade

# Herramientas base
sudo apt -y install git curl build-essential openssl

# Node.js 20.x (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs

# Verifica versiones
node -v
npm -v
```

> **Opcional:** si prefieres `pnpm`, instálalo con `npm i -g pnpm`. El proyecto funciona con **npm** sin problemas.

---

## 5) Configurar SSH con GitHub

```bash
# Genera clave (usa tu correo de GitHub)
ssh-keygen -t ed25519 -C "tu-correo@ejemplo.com"

# Muestra la clave pública y cópiala
cat ~/.ssh/id_ed25519.pub
```

- Pega la clave en **GitHub → Settings → SSH and GPG keys → New SSH key**.
- Prueba la conexión:
```bash
ssh -T git@github.com
```

---

## 6) Clonar el repositorio

```bash
mkdir -p ~/projects && cd ~/projects
git clone git@github.com:Jorgeiml/boutique.git
cd boutique
```

Si el remoto quedó en HTTPS (y te pide user/pass), cámbialo a SSH:
```bash
git remote set-url origin git@github.com:Jorgeiml/boutique.git
```

---

## 7) Levantar servicios (DB + Redis)

Desde la **raíz** del repo:

```bash
docker compose up -d
docker ps   # debes ver 'boutique-db-1' y 'boutique-redis-1' en Up
```

---

## 8) Variables de entorno

### `/api/.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boutique_local?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="PEGA_AQUI_UN_SECRETO"
```
Genera un secreto:
```bash
openssl rand -hex 32
```

### `/web/.env`
```env
VITE_API_URL="http://localhost:3000"
VITE_RUC="1790012345001"
```

---

## 9) API (NestJS + Prisma)

```bash
cd ~/projects/boutique/api
npm install

# Migraciones y cliente Prisma
npx prisma migrate dev

# (Primera vez o para datos demo)
npx prisma db seed

# Opcional: inspeccionar datos
npx prisma studio   # http://localhost:5555

# Levantar API
npm run start:dev   # http://localhost:3000  (Swagger en /docs)
```

El seed crea:
- Empresa demo (RUC `1790012345001`)
- Usuario admin: `admin@demo.ec` / `admin123` (solo para pruebas)
- Productos con variantes y un cliente demo

---

## 10) Web (Vite + React + TS)

```bash
cd ~/projects/boutique/web
npm install
npm run dev   # http://localhost:5173
```

---

## 11) Probar API

```bash
# Listar productos por RUC (paginación/búsqueda opcional)
curl "http://localhost:3000/products?ruc=1790012345001&page=1&limit=20"
curl "http://localhost:3000/products?ruc=1790012345001&q=blusa"

# Swagger
# http://localhost:3000/docs
```

---

## 12) Flujo de trabajo (Git)

- Ramas por desarrollador:
  - Jorge → `devJM`
  - Rebeca → `devRB`
- Subramas por tarea (se borran al merge):
  - `devRB/feat-clients-ui`, `devJM/feat-clients-api`

```bash
# Crear tu rama personal
git checkout -b devRB
git push -u origin devRB

# Crear rama de feature desde tu rama personal
git checkout -b devRB/feat-clients-ui
# ... cambios ...
git add -A
git commit -m "feat(web): clients list + create"
git push -u origin devRB/feat-clients-ui

# Abrir Pull Request → base: main, compare: tu-rama
# Hacer squash merge, y borrar la rama al finalizar
```

> **PRs**: usa títulos tipo `feat: …`, descripción con **qué cambia** y **cómo probar**, y referencia el ticket de Jira (ej. `BOUT-123`).

---

## Troubleshooting

**No puedo pushear (pide user/pass):**  
Remoto en HTTPS → cambia a SSH:
```bash
git remote set-url origin git@github.com:Jorgeiml/boutique.git
```

**`PrismaClient` no existe / tipos rotos:**  
Falta generar cliente o reinstalar deps.
```bash
cd ~/projects/boutique/api
rm -rf node_modules
npm install
npx prisma generate
```

**Error de migración (columna requerida con NULLs):**  
En dev, puedes resetear:
```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

**Swagger no abre:**  
Asegúrate de tener `@nestjs/swagger` y `swagger-ui-express` instalados y el bloque en `main.ts`.  
Reinicia `npm run start:dev`.

**Docker no levanta:**  
Abre Docker Desktop, ve a **Settings → Resources → WSL Integration** y activa **Ubuntu**.

---

## Direcciones útiles

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- Web: `http://localhost:5173`
- Prisma Studio: `http://localhost:5555`

---

## Definición de Ready / Done (Kanban)

- **Ready:** descripción clara, criterios de aceptación, endpoints/notas técnicas, links a PRs relacionados.
- **Done:** PR mergeado a `main`, Swagger actualizado, probado localmente, rama borrada.

---

## Convenciones

- Commits: `feat:`, `fix:`, `chore:`, `docs:`.
- Ramas: `devXX/feat-lo-que-sea`.
- PR: título claro, descripción con pasos de prueba y referencia a Jira (p. ej., `BOUT-123`).

