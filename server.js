app.post('/registrar', (req, res) => {
  const { nombre, email } = req.body;

  // Validación básica: asegura que no estén vacíos y que el email tenga un @
  if (!nombre || !email || !email.includes('@')) {
    return res.send('<h1>Error</h1><p>Datos inválidos. Asegúrate de incluir un email con @.</p><a href="/">Volver</a>');
  }

  const query = 'INSERT INTO usuarios(nombre, email) VALUES($1, $2) ON CONFLICT (email) DO NOTHING';
  
  pool.query(query, [nombre, email], (err, result) => {
    if (err) {
      console.error(err);
      res.send('<h1>Error</h1><p>Hubo un problema con la base de datos.</p><a href="/">Volver</a>');
    } else if (result.rowCount === 0) {
      res.send('<h1>Aviso</h1><p>Este correo ya está registrado.</p><a href="/">Volver</a>');
    } else {
      res.send('<h1>¡Registro exitoso!</h1><p>Gracias por unirte a Pulse.</p><a href="/usuarios">Ver lista</a>');
    }
  });
});




           

