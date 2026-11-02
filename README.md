# PokeDex Angular — Azure Static Web Apps

Aplicación web para explorar Pokémon, sus tipos, estadísticas y otros detalles. Está desarrollada con Angular y consulta información de [PokéAPI](https://pokeapi.co/).

## Aplicación publicada

- **Sitio:** [https://lemon-rock-0e9f85c0f.6.azurestaticapps.net/](https://lemon-rock-0e9f85c0f.6.azurestaticapps.net/)
- **Hospedaje:** Azure Static Web Apps, plan Free.
- **Repositorio:** [aleja8404/Pokedex-Azure](https://github.com/aleja8404/Pokedex-Azure)
- **Rama de despliegue:** `main`.

El plan Free tiene límites de uso y sus condiciones pueden cambiar. Revisa las [condiciones y precios oficiales](https://azure.microsoft.com/pricing/details/app-service/static/) y el consumo de la suscripción. Una alerta de presupuesto informa de gastos, pero no necesariamente los detiene.

## Tecnologías

| Tecnología | Uso |
|---|---|
| Angular 14 y TypeScript 4.6 | Interfaz de usuario |
| Apollo Angular y GraphQL | Consultas de datos de Pokémon |
| PokéAPI | Fuente externa de información |
| Azure Static Web Apps | Hospedaje del sitio estático |
| GitHub Actions | Compilación y despliegue al actualizar `main` |

No hay una API propia ni una base de datos desplegadas por este proyecto. La aplicación del navegador consume PokéAPI.

## Requisitos para trabajar localmente

- Node.js compatible con Angular 14 (Node.js 16 o 18 es apropiado para este proyecto).
- npm, incluido con Node.js.
- Git.

No necesitas instalar Azure CLI ni Angular CLI global para compilar: el proyecto incluye Angular CLI como dependencia.

## Ejecutar localmente

En PowerShell, desde la raíz del repositorio:

```powershell
npm ci
npm run build
npm start
```

El servidor local usa `server.js` y escucha en `http://localhost:8080`. El build genera los archivos en `dist/pokedex-angular`.

## Despliegue

El despliegue se realiza con GitHub Actions. Al enviar cambios a `main`, Azure compila el proyecto y publica `dist/pokedex-angular`. Para crear o volver a conectar una Static Web App, sigue [Despliegue.md](Despliegue.md).

## Seguridad y validación

Los encabezados HTTP se configuran en [`src/staticwebapp.config.json`](src/staticwebapp.config.json); Angular copia ese archivo al directorio de salida. La configuración incluye una política CSP, HSTS, protección contra iframe y MIME sniffing, política de referencia y permisos del navegador.

En la medición realizada para la URL publicada, SecurityHeaders reportó **A+** y SSL Labs reportó **A+**. Son resultados de herramientas concretas y pueden cambiar con el tiempo; no equivalen a una auditoría completa ni garantizan que la aplicación sea invulnerable.

- [Reporte SecurityHeaders](https://securityheaders.com/?q=https%3A%2F%2Flemon-rock-0e9f85c0f.6.azurestaticapps.net%2F&followRedirects=on)
- [Reporte SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=lemon-rock-0e9f85c0f.6.azurestaticapps.net)

## Documentación

- [Guía paso a paso de despliegue en Azure](Despliegue.md)
- [Angular](https://angular.io/docs)
- [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/)
- [PokéAPI](https://pokeapi.co/)

## Créditos

El proyecto se basa en el trabajo original de [Keiler Mora](https://github.com/keilermora/pokedex-angular). Consulta el repositorio original para sus créditos y condiciones de uso.
