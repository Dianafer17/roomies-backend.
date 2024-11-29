const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./database'); // Cambiado para usar PostgreSQL

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta para registrar usuarios
app.post('/register', async (req, res) => {
  const { email, password, full_name, birth_date, phone, gender } = req.body;

  try {
    const query = `
      INSERT INTO users (email, password, full_name, birth_date, phone, gender)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `;
    const values = [email, password, full_name, birth_date, phone, gender];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Usuario registrado con éxito', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ message: 'El correo ya está registrado.' });
    } else {
      console.error('Error al registrar usuario:', err);
      res.status(500).json({ message: 'Error al registrar usuario.' });
    }
  }
});

// Ruta para verificar ingreso
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso.' });
  } catch (err) {
    console.error('Error al verificar usuario:', err);
    res.status(500).json({ message: 'Error al verificar usuario.' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
