const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database'); // Ajusta la ruta según tu proyecto


// Depuración: verifica el contenido de 'db'
console.log('Estado de la conexión a la base de datos:', db);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Ruta para registrar usuarios
app.post('/register', (req, res) => {
  const { email, password, full_name, birth_date, phone, gender } = req.body;

  const query = `INSERT INTO users (email, password, full_name, birth_date, phone, gender)
                 VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(
    query,
    [email, password, full_name, birth_date, phone, gender],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ message: 'El correo ya está registrado.' });
        } else {
          res.status(500).json({ message: 'Error al registrar el usuario.' });
        }
      } else {
        res.status(201).json({ message: 'Usuario registrado con éxito.' });
      }
    }
  );
});
// Ruta para verificar ingreso
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ? AND password = ?`;

  db.get(query, [email, password], (err, row) => {
    if (err) {
      res.status(500).json({ message: 'Error al verificar el usuario.' });
    } else if (row) {
      res.status(200).json({ message: 'Ingreso exitoso.' });
    } else {
      res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }
  });
});


// Ruta para obtener información del usuario
app.post('/user-info', (req, res) => {
  const { email } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener datos.' });
    }
    res.json(row || { message: 'Usuario no encontrado.' });
  });
});

// Ruta para actualizar datos del usuario
app.post('/update-user', (req, res) => {
  const { field, value, email } = req.body;
  const validFields = ['phone', 'password'];

  if (!validFields.includes(field)) {
    return res.status(400).json({ message: 'Campo no válido.' });
  }

  const query = `UPDATE users SET ${field} = ? WHERE email = ?`;
  db.run(query, [value, email], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al actualizar datos.' });
    }
    res.json({ message: 'Datos actualizados correctamente.' });
  });
});

app.post('/delete-user', (req, res) => {
  console.log('Solicitud recibida:', req.body); // Verifica si la solicitud llega
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña requeridos.' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], (err, user) => {
    if (err) {
      console.error('Error al buscar usuario:', err); // Depuración de errores
      return res.status(500).json({ message: 'Error al buscar usuario.' });
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const deleteQuery = `DELETE FROM users WHERE email = ?`;

    db.run(deleteQuery, [email], function (err) {
      if (err) {
        console.error('Error al eliminar usuario:', err); // Depuración de errores
        return res.status(500).json({ message: 'Error al eliminar usuario.' });
      }
      res.status(200).json({ message: 'Usuario eliminado con éxito.' });
    });
  });
});

app.post('/change-password', (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], (err, user) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ message: 'Error al buscar usuario.' });
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta.' });
    }

    const updateQuery = `UPDATE users SET password = ? WHERE email = ?`;

    db.run(updateQuery, [newPassword, email], function (err) {
      if (err) {
        console.error('Error al actualizar contraseña:', err);
        return res.status(500).json({ message: 'Error al actualizar contraseña.' });
      }
      res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
    });
  });
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
