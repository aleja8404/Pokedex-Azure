# Despliegue de PokeDex en Azure Static Web Apps

Esta guía describe el despliegue actual del proyecto con GitHub Actions y Azure Static Web Apps. No requiere `gcloud`, `app.yaml` ni un servidor Node.js en Azure.

## Arquitectura del despliegue

1. El código fuente está en el repositorio GitHub `aleja8404/Pokedex-Azure`, rama `main`.
2. GitHub Actions obtiene el código y ejecuta la compilación Angular.
3. Angular genera el sitio estático en `dist/pokedex-angular`.
4. La acción de Azure publica esos archivos en Static Web Apps.
5. El navegador carga el frontend desde Azure y la aplicación consulta PokéAPI.

La aplicación publicada está en [https://lemon-rock-0e9f85c0f.6.azurestaticapps.net/](https://lemon-rock-0e9f85c0f.6.azurestaticapps.net/). El recurso existente usa el plan **Free**. Este plan tiene cuotas; revisa la [información oficial de precios y límites](https://azure.microsoft.com/pricing/details/app-service/static/) antes de usarlo en un sitio de producción.

## 1. Requisitos

- Cuenta de Microsoft con acceso a una suscripción de Azure.
- Cuenta de GitHub con acceso al repositorio.
- Permiso para crear Azure Static Web Apps y conectar GitHub. Una cuenta institucional puede tener restricciones; si no tienes permisos, solicita ayuda al administrador.
- Node.js y npm para validar el build localmente.

No agregues un medio de pago ni elijas un SKU de pago sin autorización. Comprueba el plan y la suscripción en el resumen de Azure antes de crear recursos.

## 2. Probar el proyecto localmente (opcional)

Clona el repositorio y ejecuta:

```powershell
git clone https://github.com/aleja8404/Pokedex-Azure.git
cd Pokedex-Azure
npm ci
npm run build
```

La salida debe quedar en `dist/pokedex-angular`. Para ejecutar el servidor local incluido, después del build:

```powershell
npm start
```

Abre `http://localhost:8080`. `server.js` sirve el build y añade encabezados para este servidor local; Azure Static Web Apps no ejecuta `server.js`.

## 3. Crear o conectar una Static Web App

Para crear un recurso nuevo desde el portal:

1. Inicia sesión en [portal.azure.com](https://portal.azure.com/) y busca **Static Web Apps**.
2. Selecciona **Crear** y elige una suscripción autorizada y un grupo de recursos.
3. En **Detalles de hospedaje**, elige un nombre y selecciona el plan **Free**. Detente si el resumen muestra **Standard** o un precio que no esperabas.
4. En **Implementación**, selecciona **GitHub** y autoriza la conexión si Azure la solicita.
5. Selecciona:
   - **Organización:** `aleja8404`
   - **Repositorio:** `Pokedex-Azure`
   - **Rama:** `main`
6. En la configuración de compilación, introduce:
   - **Preestablecido:** Angular
   - **Ubicación de la aplicación:** `/`, porque `package.json` y `angular.json` están en la raíz.
   - **Ubicación de la API:** vacía; el proyecto no tiene una API propia.
   - **Ubicación de salida:** `dist/pokedex-angular`.
7. Revisa el resumen: confirma el repositorio, la rama, las rutas y el plan **Free**. Selecciona **Crear**.

Azure configura la integración de GitHub Actions y crea el secreto de despliegue requerido. No publiques ni pegues el valor de ese token en el código, capturas o chat.

Si ya existe un recurso pero la conexión original no funciona, puedes crear otra Static Web App Free conectándola directamente con GitHub. No elimines el recurso anterior hasta comprobar que el nuevo despliegue sirve el sitio correctamente.

## 4. Compilación y despliegue automático

Azure agrega un archivo de flujo a `.github/workflows/` con un nombre parecido a `azure-static-web-apps-<identificador>.yml`. En el flujo, las rutas relevantes deben equivaler a:

```yaml
app_location: "/"
api_location: ""
output_location: "dist/pokedex-angular"
```

Los cambios enviados a `main` activan el flujo de **Azure Static Web Apps CI/CD**. Para revisar:

1. En GitHub, abre el repositorio y selecciona **Actions**.
2. Abre la ejecución llamada **Azure Static Web Apps CI/CD**.
3. Confirma que el trabajo de compilación y despliegue terminó en verde.
4. En Azure, abre la Static Web App y visita la URL de **Información general**.
5. Prueba la página, imágenes, detalles y una ruta interna recargándola.

El repositorio también contiene un flujo separado de pruebas y cobertura. Una falla de carga a Codecov no equivale por sí sola a una falla del despliegue; revisa específicamente el resultado de **Azure Static Web Apps CI/CD**.

## 5. Encabezados y rutas de Angular

La configuración HTTP está en `src/staticwebapp.config.json`. `angular.json` incluye ese archivo entre los assets, por eso aparece también en `dist/pokedex-angular` y Azure puede aplicarlo. La configuración incluye:

- `navigationFallback`: devuelve `index.html` para las rutas de la SPA.
- `globalHeaders`: agrega los encabezados de seguridad a las respuestas.

### ¿Qué significa cada protección?

| Configuración | Explicación sencilla |
|---|---|
| **CSP** (`Content-Security-Policy`) | Lista los orígenes permitidos para scripts, imágenes, conexiones, fuentes y estilos. Reduce el impacto de inyecciones de contenido y XSS. Debe permitir los recursos legítimos de Angular, Google Fonts y PokéAPI que usa la aplicación. |
| **HSTS** (`Strict-Transport-Security`) | Indica al navegador que vuelva a usar HTTPS durante el tiempo configurado. No cifra por sí mismo la conexión; HTTPS/TLS lo hace. |
| **Anti-clickjacking** (`X-Frame-Options: DENY` y `frame-ancestors 'none'` en CSP) | Impide que otro sitio inserte la aplicación dentro de un `iframe` para engañar al usuario y capturar clics. |
| **Anti-MIME sniffing** (`X-Content-Type-Options: nosniff`) | Le dice al navegador que respete el tipo de contenido enviado y que no lo adivine, reduciendo interpretaciones peligrosas de archivos. |
| **Referrer-Policy** | Limita cuánta información de la URL de origen se envía al navegar a otro sitio. |
| **Permissions-Policy** | Desactiva funciones del navegador que esta aplicación no necesita, como cámara, micrófono o geolocalización. |

El valor CSP permite solamente los orígenes de recursos utilizados por la aplicación y autoriza el script inline existente mediante un hash SHA-256, en vez de permitir cualquier script inline. Si cambian los scripts o dependencias, valida la CSP y prueba la aplicación; una política demasiado estricta puede bloquear recursos.

## 6. Verificaciones de seguridad

Prueba la URL pública en:

1. [SecurityHeaders.com](https://securityheaders.com/): revisa la presencia de CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`.
2. [SSL Labs](https://www.ssllabs.com/ssltest/): evalúa el certificado y la configuración TLS del host. En Azure Static Web Apps, TLS y el certificado para el dominio predeterminado los administra Azure.

La URL publicada obtuvo **A+** en SecurityHeaders y **A+** en SSL Labs al momento de la validación. 

## 7. Diagnóstico de problemas comunes

| Síntoma | Qué revisar |
|---|---|
| Página de felicitaciones de Azure | El contenido todavía no se ha publicado. Revisa que la ejecución de Azure Actions haya terminado correctamente. |
| Error de carpeta no encontrada | Confirma que `app_location` sea `/` y que `package.json` y `angular.json` estén en la raíz del repositorio seleccionado. |
| Azure rechaza el token | Confirma que el secreto pertenece a la Static Web App correcta. Restablece el token en Azure y actualiza el secreto correspondiente en GitHub sin revelar su valor. |
| La compilación no encuentra salida | Confirma `output_location: "dist/pokedex-angular"` y que `npm run build` finalice correctamente. |
| Las rutas internas fallan al recargar | Confirma que `staticwebapp.config.json` esté en la salida del build y contenga el fallback a `/index.html`. |
| Imágenes, fuentes o consultas bloqueadas | Revisa los errores de consola del navegador y ajusta la CSP solo para los orígenes realmente requeridos. |

## Referencias oficiales

- [Azure Static Web Apps: inicio rápido](https://learn.microsoft.com/azure/static-web-apps/getting-started)
- [Configuración de Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/configuration)
- [Configuración de compilación](https://learn.microsoft.com/azure/static-web-apps/build-configuration)
- [Administración de tokens de despliegue](https://learn.microsoft.com/azure/static-web-apps/deployment-token-management)
