# ÁRBOL GO — Backend

API REST de ÁRBOL GO para registrar árboles, organizar cuidados, consultar su
crecimiento y conectar a la comunidad mediante publicaciones y gamificación.
El backend se implementa con NestJS, TypeORM y MySQL.

## Funcionalidades principales

- Gestión de usuarios, autenticación JWT y autorización por roles.
- Administración de árboles, especies, cuidados e historial de crecimiento.
- Recordatorios automáticos y tareas programadas.
- Fotografías almacenadas en Cloudinary.
- Publicaciones, comentarios y moderación mediante reportes.
- XP, puntos, niveles y logros automáticos.
- Notificaciones push con Firebase Cloud Messaging.
- Documentación OpenAPI/Swagger en `/api` fuera de producción.

## Stack tecnológico

- Node.js y TypeScript
- NestJS 12
- TypeORM y MySQL
- Passport y JWT
- Cloudinary para imágenes
- Firebase Admin / FCM para notificaciones
- Jest para pruebas unitarias y E2E

## Requisitos previos

- Node.js 20.18 o superior y npm.
- MySQL 8.0.16 o superior.
- Una cuenta de Cloudinary.
- Un proyecto Firebase con Firebase Cloud Messaging habilitado y una cuenta de
  servicio con permisos para enviar notificaciones.

MySQL 8.0.16+ es recomendado porque el esquema emplea restricciones `CHECK`.

## Instalación local

1. Clona el repositorio y entra al directorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd arbol-go_backend
   ```

2. Instala las dependencias usando el lockfile:

   ```bash
   npm ci
   ```

3. Crea una copia local del archivo de ejemplo.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

4. Crea la base de datos en MySQL:

   ```sql
   CREATE DATABASE arbol_go
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

5. Completa `.env` con los datos de MySQL, JWT, Cloudinary y Firebase de tu
   entorno. Consulta la sección siguiente antes de iniciar la API.

## Variables de entorno

`.env.example` documenta todas las variables leídas por la aplicación:

| Variable | Propósito |
| --- | --- |
| `PORT` | Puerto HTTP de NestJS; predeterminado: `3000`. |
| `NODE_ENV` | Entorno de ejecución. Usa `development` localmente y `production` al desplegar. |
| `CORS_ORIGINS` | Orígenes web permitidos, separados por comas. Producción requiere orígenes explícitos y no acepta `*`. |
| `DB_HOST`, `DB_PORT` | Host y puerto TCP de MySQL. |
| `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Credenciales y nombre de la base de datos. |
| `JWT_SECRET` | Secreto para firmar y verificar tokens JWT. Debe ser único, aleatorio y confidencial por entorno. |
| `JWT_EXPIRATION` | Duración del token en segundos. |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales de almacenamiento de imágenes. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Ruta al archivo JSON de cuenta de servicio de Firebase, fuera del repositorio. |
| `FIREBASE_PROJECT_ID` | ID del proyecto Firebase usado para FCM. |

Genera un secreto JWT aleatorio, por ejemplo:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

No agregues `.env`, claves de Cloudinary ni archivos de servicio Firebase al
control de versiones. En producción configura estos valores en el gestor de
secretos del proveedor de despliegue.

El módulo de notificaciones requiere `GOOGLE_APPLICATION_CREDENTIALS` y
`FIREBASE_PROJECT_ID` durante el arranque. Mantén el JSON de Firebase fuera de
la raíz pública y limita sus permisos de lectura.

## Recordatorios y notificaciones

La tarea programada procesa recordatorios vencidos cada hora y puede enviar
notificaciones push al token FCM registrado por el propietario del árbol. Los
clientes autenticados pueden registrar o reemplazar su token con
`POST /notifications/device-token` (`{ "fcmToken": "..." }`) y retirarlo con
`DELETE /notifications/device-token`.

Los cuidados vencidos se marcan como `vencido` y el árbol pasa a
`requiere_atencion`. Al completar el último cuidado vencido, el estado del árbol
puede volver a `saludable`. La recurrencia de recordatorios admite `ninguna`,
`diaria`, `semanal` y `mensual`; las recurrencias mensuales preservan el día
original, ajustándolo al último día disponible si el mes es más corto.

## Migraciones de base de datos

Las migraciones TypeORM están en `src/migrations`. La aplicación tiene
`synchronize` habilitado únicamente cuando `NODE_ENV=development`; en producción
está deshabilitado. No habilites `synchronize` en producción.

Compila antes de usar el CLI:

```bash
npm run build
```

Revisa las migraciones pendientes:

```bash
npm run migration:show
```

Aplica las migraciones pendientes en orden:

```bash
npm run migration:run
```

Revierte la última migración aplicada:

```bash
npm run migration:revert
```

La reversión puede descartar información transformada por una migración. Haz un
respaldo y revisa el método `down` antes de ejecutarla en un entorno compartido.

Las migraciones también introducen las relaciones entre cuidados y recordatorios,
la recurrencia y los tokens privados de notificación, el archivado de registros,
la moderación de publicaciones y comentarios, y los timestamps generados por el
servidor. La migración `1794445000000-ConvertCareFieldsToEnums` valida los valores
existentes antes de convertirlos a enums estrictos; resuelve cualquier valor no
compatible reportado antes de volver a ejecutar esa migración.

## Ejecución

### Desarrollo

Con `.env` configurado:

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000` (o en el puerto configurado).
En entornos distintos de `production`, Swagger se expone en
`http://localhost:3000/api`.

### Producción

1. Configura todos los secretos y `NODE_ENV=production`.
2. Construye la aplicación y aplica las migraciones:

   ```bash
   npm ci
   npm run build
   npm run migration:run
   ```

3. Inicia el servidor:

   ```bash
   npm run start:prod
   ```

En producción, `CORS_ORIGINS` debe contener los orígenes exactos del frontend,
por ejemplo `https://app.example.com`. No uses `*`.

## Pruebas y calidad

Ejecuta la suite unitaria:

```bash
npm test -- --runInBand
```

Ejecuta las pruebas E2E:

```bash
npm run test:e2e -- --runInBand
```

Ejecuta el lint:

```bash
npm run lint
```

## Documentación de API

Swagger está disponible en `/api` en desarrollo y otros entornos no productivos.
Se desactiva en producción para no exponer el esquema de la API públicamente.

## Colaboración

- Crea una rama por cambio y abre un pull request para revisión.
- Añade una migración TypeORM para cambios de esquema.
- No edites `.env.example` con credenciales reales.
- Ejecuta build, lint y las pruebas relacionadas antes de enviar cambios.
