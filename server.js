
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// --- RUTA DE HEALTHCHECK PARA EL DESPLIEGUE ---
app.get('/', (req, res) => {
  res.status(200).json({ status: 'PULSE_SERVER_OK', timestamp: new Date() });
});
// ----------------------------------------------

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Probar conexión a la base de datos
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a PostgreSQL:', err);
  } else {
    console.log('Conexión exitosa a PostgreSQL');
  }
});

// Aquí irían tus rutas de API existentes...
// app.post('/api/auth/register', ...);
// app.post('/api/auth/login', ...);

// Nota: Asegúrate de tener al final de tu archivo algo como:
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en el puerto ${PORT}`);
// });
