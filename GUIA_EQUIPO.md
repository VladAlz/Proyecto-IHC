# 👥 Guía rápida para el Grupo 4 — cómo ejecutar el proyecto

> **Repositorio:** https://github.com/VladAlz/Proyecto-IHC
> **Rama del proyecto:** `feature/ihc-ai-1.1` ⚠️ *(la rama `main` está vacía; el código está en esta rama)*
> **Ver la rama directamente:** https://github.com/VladAlz/Proyecto-IHC/tree/feature/ihc-ai-1.1

---

## 1. Requisitos (una sola vez)

| Programa | Versión | Comprobar con |
|---|---|---|
| **Node.js** | 18 o superior (recomendado 22) — https://nodejs.org | `node --version` |
| **Git** | cualquiera reciente — https://git-scm.com | `git --version` |

**No necesitan** Docker, PostgreSQL ni instalar una base de datos: el proyecto usa SQLite embebido.

---

## 2. Descargar el proyecto

Abran una terminal (Warp, PowerShell, Git Bash o la del VS Code) en la carpeta donde lo quieran guardar:

```bash
git clone -b feature/ihc-ai-1.1 https://github.com/VladAlz/Proyecto-IHC.git
```

```bash
cd Proyecto-IHC
```

Si **ya tenían** el repo clonado, en su carpeta del repo ejecuten:

```bash
git fetch origin
```

```bash
git checkout feature/ihc-ai-1.1
```

---

## 3. Instalar dependencias (solo la primera vez)

Desde la carpeta raíz del proyecto (`Proyecto-IHC`):

```bash
npm run setup
```

Instala el frontend y el backend (tarda 1–2 minutos).

---

## 4. 🔑 Dónde colocar su API key de IA

La IA lee las keys de **un solo archivo**: **`backend/.env`**

```
Proyecto-IHC/
└── backend/
    ├── .env.example   ← plantilla (ya viene en el repo)
    └── .env           ← ESTE lo crean ustedes y aquí van las keys
```

**Pasos:**

1. Dentro de la carpeta `backend`, **copien** `.env.example` y renombren la copia a **`.env`** (con el punto al inicio y sin extensión).
   En terminal, desde la raíz del proyecto:

   ```bash
   cp backend/.env.example backend/.env
   ```

   *(En PowerShell: `Copy-Item backend\.env.example backend\.env`)*

2. Cada uno crea **su propia key gratuita** (no compartan la misma, la cuota es por cuenta):
   - **Gemini (principal):** https://aistudio.google.com/app/apikey → *Create API key* (sin tarjeta)
   - **Groq (respaldo, opcional):** https://console.groq.com/keys → *Create API Key*

3. Abran `backend/.env` y peguen las keys después del `=`, **sin comillas ni espacios**:

   ```env
   GEMINI_API_KEY=pegar_aqui_su_key_de_gemini
   GROQ_API_KEY=pegar_aqui_su_key_de_groq
   ```

   No cambien nada más del archivo; los modelos ya vienen configurados.

> ⚠️ **Nunca suban `backend/.env` a GitHub.** Ya está excluido en `.gitignore`, pero no lo fuercen con `git add -f`.
> Si alguien sube una key por error, que la borre y genere otra en la página del proveedor.

> 💡 **Sin key la app también funciona**: el Asistente IA usa un *motor heurístico local*. Con la key de Gemini obtienen
> análisis mucho más completos.

---

## 5. Ejecutar

Desde la carpeta raíz del proyecto:

```bash
npm run dev
```

Cuando la consola muestre `🟢 API activa en: http://localhost:3000/api`, abran:

| Qué | Dirección |
|---|---|
| **La aplicación** | http://localhost:5173 |
| Documentación de la API (Swagger) | http://localhost:3000/api/docs |

**Comprobar la IA:** arriba a la derecha de la app debe decir **"IA: Gemini"**.
Si dice **"IA: Motor local"**, revisen el paso 4 y reinicien con `Ctrl + C` y otra vez `npm run dev`.

Para detener: `Ctrl + C` en la terminal.

---

## 6. Problemas comunes

| Síntoma | Solución |
|---|---|
| `No se puede iniciar: puertos ocupados` o `EADDRINUSE` | Quedó abierta otra ejecución. Ejecuten `npm run stop` y luego `npm run dev` |
| La app dice **"Backend sin conexión"** | El backend no arrancó: revisen la terminal, normalmente es lo anterior |
| Sigue diciendo **"IA: Motor local"** con la key puesta | El archivo no se llama exactamente `.env` o no está dentro de `backend/`, o falta reiniciar `npm run dev` |
| Aviso amarillo en el análisis con `HTTP 429` | Se acabó la cuota gratuita del día; la app usa Groq o el motor local automáticamente |
| Quieren empezar con los datos de ejemplo limpios | Botón **"Restaurar datos"** arriba a la derecha (o `npm run db:reset`) |
| `npm` no se reconoce | Falta instalar Node.js (paso 1) y reabrir la terminal |

---

## 7. Trabajo en equipo (recordatorio)

- Cada uno trabaja en **su propia rama** a partir de esta: `git checkout -b feature/HU-XX-descripcion`.
- Commits con Conventional Commits (`feat:`, `fix:`, `docs:`…), ver [`CONTRIBUTING.md`](CONTRIBUTING.md).
- Los cambios llegan a `develop` mediante **Pull Request** revisado por el equipo.

Más detalles técnicos: [`README.md`](README.md) · IA gratuita: [`docs/IA_GRATUITA.md`](docs/IA_GRATUITA.md) ·
Qué cambió y qué falta: [`docs/CAMBIOS_Y_DECISIONES.md`](docs/CAMBIOS_Y_DECISIONES.md)
