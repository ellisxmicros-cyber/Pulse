const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuración para leer datos de formularios
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 1. Conexión a BD
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Error conectando a BD', err);
  else console.log('Conexión exitosa a PostgreSQL');
});

// 2. Crear tabla
pool.query(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE
  );
`, (err, res) => {
  if (err) console.error('Error al crear tabla', err);
  else console.log('Tabla "usuarios" lista');
});

// 3. Rutas
// Servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Procesar el registro del formulario
app.post('/registrar', (req, res) => {
  const { nombre, email } = req.body;
  const query = 'INSERT INTO usuarios(nombre, email) VALUES($1, $2)';
  
  pool.query(query, [nombre, email], (err, result) => {
    if (err) {
      console.error('Error al insertar:', err);
      res.send('Error: El usuario ya existe o hubo un problema.');
    } else {
      res.send('<h1>¡Registro exitoso!</h1><a href="/">Volver al inicio</a> | <a href="/usuarios">Ver lista</a>');
    }
  });
});

// Ver todos los usuarios
app.get('/usuarios', (req, res) => {
  pool.query('SELECT * FROM usuarios', (err, result) => {
    if (err) res.send('Error: ' + err.message);
    else {
      const lista = result.rows.map(u => `<li>${u.nombre} (${u.email})</li>`).join('');
      res.send(`<h1>Lista de Usuarios</h1><ul>${lista}</ul><a href="/">Volver</a>`);
    }
  });
});

// 4. Servidor
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));
                      

           

