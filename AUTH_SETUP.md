# Configuración del Sistema de Autenticación

## Archivos Creados

### 1. Tipos de Autenticación (`app/types/auth.ts`)

- Define las interfaces para User, LoginCredentials, RegisterData, AuthResponse y AuthContextType
- Tipos TypeScript para mantener la consistencia en toda la aplicación

### 2. Contexto de Autenticación (`app/contexts/AuthContext.tsx`)

- AuthProvider: Proporciona el estado de autenticación a toda la aplicación
- useAuth: Hook personalizado para acceder al contexto de autenticación
- Funciones: login, register, logout, updateUser
- Verificación automática de token al cargar la aplicación

### 3. Página de Registro (`app/register/page.tsx`)

- Formulario completo de registro con validaciones
- Campos: nombre, correo, contraseña, confirmación de contraseña, moneda preferida
- Integración con la API de registro
- Redirección automática al dashboard después del registro exitoso

### 4. Página de Login Modificada (`app/login/page.tsx`)

- Integración con la API de login
- Manejo de estados de carga y errores
- Enlaces a la página de registro

### 5. Componente de Protección de Rutas (`app/components/ProtectedRoute.tsx`)

- Protege rutas que requieren autenticación
- Muestra loading mientras verifica la autenticación
- Redirección automática a login si no está autenticado

### 6. Layout Principal Modificado (`app/layout.tsx`)

- Incluye el AuthProvider para toda la aplicación
- Idioma cambiado a español

### 7. Layout de Main Modificado (`app/main/layout.tsx`)

- Incluye información del usuario en el sidebar
- Botón de cerrar sesión
- Protección de rutas con ProtectedRoute

### 8. Middleware (`middleware.ts`)

- Maneja redirecciones a nivel de servidor
- Permite rutas públicas (login, register)
- Redirección automática de la ruta raíz a login

### 9. Archivo de Configuración (`env.example`)

- Variables de entorno necesarias
- URL base de la API configurada para localhost:8000

## Configuración Requerida

### 1. Variables de Entorno

Crea un archivo `.env.local` con:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=GastoGenius
```

### 2. API Backend

Asegúrate de que tu API backend esté ejecutándose en `http://localhost:8000` con los siguientes endpoints:

- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener información del usuario autenticado

### 3. Flujo de Autenticación

1. **Usuario no autenticado**: Redirigido automáticamente a `/login`
2. **Login exitoso**: Redirigido a `/main/dashboard`
3. **Registro exitoso**: Login automático y redirección a `/main/dashboard`
4. **Rutas protegidas**: Solo accesibles con autenticación válida
5. **Cerrar sesión**: Limpia el token y redirige a `/login`

## Características Implementadas

✅ **Autenticación completa** con JWT
✅ **Protección de rutas** automática
✅ **Registro de usuarios** con validaciones
✅ **Login con manejo de errores**
✅ **Persistencia de sesión** en localStorage
✅ **Verificación automática** de token al cargar
✅ **Interfaz de usuario** consistente
✅ **Redirecciones automáticas**
✅ **Información del usuario** en el sidebar
✅ **Botón de cerrar sesión**

## Uso

1. Inicia tu API backend en `http://localhost:8000`
2. Ejecuta `npm run dev`
3. Navega a `http://localhost:3000`
4. Serás redirigido automáticamente a `/login`
5. Puedes registrarte o iniciar sesión
6. Todas las rutas de `/main/*` están protegidas
