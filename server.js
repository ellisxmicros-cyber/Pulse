
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

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
    console.error('Error conectando a PostgreSQL:', err.stack);
  } else {
    console.log('Conexión exitosa a PostgreSQL realizada a las:', res.rows[0].now);
  }
});

// ========================================================
// ENDPOINTS DEL SISTEMA (API)
// ========================================================

// 1. Registro de Usuarios
app.post('/api/usuarios/registro', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const nuevoUsuario = await pool.query(
      'INSERT INTO usuarios (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, monedas_balance',
      [username, email, password]
    );
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al registrar usuario o el email/username ya existe.' });
  }
});

// 2. Crear una Batalla en Vivo
app.post('/api/batallas/crear', async (req, res) => {
  const { creador_alfa_id, creador_beta_id, duracion_minutos } = req.body;
  try {
    const termina_en = new Date(Date.now() + duracion_minutos * 60 * 1000);
    const nuevaBatalla = await pool.query(
      'INSERT INTO batallas_en_vivo (creador_alfa_id, creador_beta_id, termina_en) VALUES ($1, $2, $3) RETURNING *',
      [creador_alfa_id, creador_beta_id, termina_en]
    );
    res.status(201).json(nuevaBatalla.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al iniciar la batalla en vivo.' });
  }
});

// 3. Enviar Regalo (Transacción de monedas entre usuarios)
app.post('/api/transacciones/regalo', async (req, res) => {
  const { emisor_id, receptor_id, regalo_id, costo_monedas } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Iniciar transacción SQL

    // Verificar saldo del emisor
    const resSaldo = await client.query('SELECT monedas_balance FROM usuarios WHERE id = $1', [emisor_id]);
    if (resSaldo.rows.length === 0 || resSaldo.rows[0].monedas_balance < costo_monedas) {
      throw new Error('Saldo insuficiente de monedas para enviar este regalo.');
    }

    // Calcular comisión de la plataforma (10%)
    const comision = Math.floor(costo_monedas * 0.10);
    const netoReceptor = costo_monedas - comision;

    // Restar monedas al emisor
    await client.query('UPDATE usuarios SET monedas_balance = monedas_balance - $1 WHERE id = $2', [costo_monedas, emisor_id]);
    
    // Sumar monedas netas al receptor
    await client.query('UPDATE usuarios SET monedas_balance = monedas_balance + $1 WHERE id = $2', [netoReceptor, receptor_id]);

    // Registrar movimiento en el historial
    const historial = await client.query(
      'INSERT INTO historial_transacciones (emisor_id, receptor_id, tipo_movimiento, monedas_gastadas, comision_plataforma_monedas) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [emisor_id, receptor_id, 'REGALO_EN_VIVO', costo_monedas, comision]
    );

    await client.query('COMMIT'); // Confirmar cambios en la BD
    res.status(200).json({ mensaje: 'Regalo enviado y procesado correctamente', transaccion: historial.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK'); // Cancelar cambios si algo falla
    console.error(error.message);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Puerto de escucha del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor híbrido Pulse corriendo en el puerto ${PORT}`);
});
