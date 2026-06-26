const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a PostgreSQL', err);
  } else {
    console.log('Conexión exitosa a PostgreSQL');
  }
});

pool.query(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE
  );
`, (err, res) => {
  if (err) console.error('Error al crear la tabla', err);
  else console.log('Tabla "usuarios" lista o creada correctamente');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

app.get('/', (req, res) => {
  res.send('¡Servidor Pulse funcionando correctamente!');
});

app.get('/inicio', (req, res) => {
  res.send('<h1>Bienvenido a mi App Pulse</h1>');
});
// Ruta para registrar un usuario de prueba
app.get('/registrar-prueba', (req, res) => {
  const query = 'INSERT INTO usuarios(nombre, email) VALUES($1, $2) RETURNING *';
  const values = ['Usuario Prueba', 'prueba@ejemplo.com'];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al insertar:', err);
      res.send('Error al registrar: ' + err.message);
    } else {
      res.send('¡Usuario registrado con éxito! Datos: ' + JSON.stringify(result.rows[0]));
    }
  });
});
// Ruta para ver todos los usuarios registrados
app.get('/usuarios', (req, res) => {
  pool.query('SELECT * FROM usuarios', (err, result) => {
    if (err) {
      console.error('Error al consultar:', err);
      res.send('Error al obtener usuarios: ' + err.message);
    } else {
      // Convertimos los resultados a una lista legible
      const lista = result.rows.map(u => `<li>${u.nombre} (${u.email})</li>`).join('');
      res.send(`<h1>Lista de Usuarios</h1><ul>${lista}</ul>`);
    }
  });
});

           

