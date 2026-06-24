const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Prueba de conexión y arranque del servidor
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a PostgreSQL', err);
  } else {
    console.log('Conexión exitosa a PostgreSQL');

    // Solo arrancamos el servidor si la base de datos responde
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Servidor escuchando en el puerto ${port}`);
    });
  }
});

// Rutas de tu aplicación
app.get('/', (req, res) => {
  res.send('¡Servidor Pulse funcionando correctamente!');
});

app.get('/inicio', (req, res) => {
  res.send('<h1>Bienvenido a mi App Pulse</h1>');
});


