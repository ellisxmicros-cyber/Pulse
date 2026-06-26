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
app.get('/', (req, res) => res.send('Servidor Pulse OK'));

app.get('/inicio', (req, res) => res.send('<h1>Bienvenido a App Pulse</h1>'));

app.get('/registrar-prueba', (req, res) => {
  const query = 'INSERT INTO usuarios(nombre, email) VALUES($1, $2) RETURNING *';
  pool.query(query, ['Usuario Prueba', 'prueba@ejemplo.com'], (err, result) => {
    if (err) res.send('Error: ' + err.message);
    else res.send('¡Usuario registrado! Datos: ' + JSON.stringify(result.rows[0]));
  });
});

app.get('/usuarios', (req, res) => {
  pool.query('SELECT * FROM usuarios', (err, result) => {
    if (err) res.send('Error: ' + err.message);
    else {
      const lista = result.rows.map(u => `<li>${u.nombre} (${u.email})</li>`).join('');
      res.send(`<h1>Lista de Usuarios</h1><ul>${lista}</ul>`);
    }
  });
});

// 4. Servidor
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));
<!DOCTYPE html>
<html>
<head>
    <title>App Pulse</title>
</head>
<body>
    <h1>Registro en Pulse</h1>
    <form action="/registrar" method="POST">
        <input type="text" name="nombre" placeholder="Tu nombre" required>
        <input type="email" name="email" placeholder="Tu correo" required>
        <button type="submit">Registrarse</button>
    </form>
</body>
</html>
                     

           

