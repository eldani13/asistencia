## Asistencia QR + Face

Sistema de control de asistencia 100% frontend con Next.js App Router, Firebase y reconocimiento facial.

## Requisitos

- Node.js 20+
- Proyecto Firebase con Auth, Firestore y Storage habilitados

## Configuracion

1. Copia `.env.local.example` a `.env.local` y completa las variables de Firebase.
2. Descarga los modelos de face-api.js y colocalos en `public/models`.
3. Crea el primer admin en Firebase Auth y agrega su perfil en Firestore.

### Documento admin inicial

Coleccion `admins`, documento con ID = UID del usuario admin:

```json
{
	"uid": "UID_DEL_ADMIN",
	"email": "admin@colegio.com",
	"role": "admin",
	"createdAt": "timestamp"
}
```

## Reglas Firestore

Aplica las reglas en `firestore.rules` y los indices en `firestore.indexes.json`.

## Comandos

```bash
npm run dev
npm run build
npm run start
```

## Rutas principales

- `/` Inicio
- `/scan` Flujo de asistencia por QR + rostro
- `/login` Acceso admin
- `/admin` Panel administrativo
