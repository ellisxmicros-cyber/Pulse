const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para procesar el registro (Lógica del formulario)
app.post('/registrar', (req, res) => {
  const { nombre, email } = req.body;
  const query = 'INSERT INTO usuarios(nombre, email) VALUES($1, $2) ON CONFLICT (email) DO NOTHING';
  
  pool.query(query, [nombre, email], (err, result) => {
    if (err) {
      console.error(err);
      res.send('<h1>Error</h1><p>Hubo un problema de conexión.</p><a href="/">Volver</a>');
    } else if (result.rowCount === 0) {
      res.send('<h1>Aviso</h1><p>Este correo ya está registrado.</p><a href="/">Volver</a>');
    } else {
      res.send('<h1>¡Registro exitoso!</h1><p>Gracias por unirte a Pulse.</p><a href="/usuarios">Ver lista de usuarios</a>');
    }
  });
});

// Ruta para ver la lista de usuarios
app.get('/usuarios', (req, res) => {
  pool.query('SELECT * FROM usuarios', (err, result) => {
    if (err) res.send('Error al consultar la base de datos.');
    else {
      const lista = result.rows.map(u => `<li>${u.nombre} - ${u.email}</li>`).join('');
      res.send(`<h1>Usuarios registrados</h1><ul>${lista}</ul><a href="/">Volver</a>`);
    }
  });
});

// Servidor escuchando (ESTO SIEMPRE VA AL FINAL)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor activo en puerto ${port}`);
});



           

