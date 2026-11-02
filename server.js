const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;
const DIST_FOLDER = path.join(__dirname, 'dist/pokedex-angular');

// =============================================
// SECURITY HEADERS MIDDLEWARE
// =============================================
app.use((req, res, next) => {
  // Fuerza HTTPS - A+ en SecurityHeaders.com
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Previene ataques XSS e inyección de contenido
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'sha256-QmIi/LDJnOEYAO9CVS/+JVvnKMiVsY6fn0FVoHnkPfg='; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://assets.pokemon.com https://raw.githubusercontent.com https://pokeapi.co https://img.pokemondb.net; " +
    "connect-src 'self' https://pokeapi.co https://beta.pokeapi.co; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none';"
  );

  // Previene Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Previene MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Control de información de referencia
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Desactiva APIs del navegador no necesarias
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()');

  // Protección XSS legacy (navegadores antiguos)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
});

// =============================================
// SERVIR ARCHIVOS ESTÁTICOS DE ANGULAR
// =============================================
app.use(express.static(DIST_FOLDER));

// SPA Fallback: todas las rutas apuntan a index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PokeDex server running on port ${PORT}`);
});
