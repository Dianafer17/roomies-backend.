const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conexión exitosa con la base de datos.');
  }
});

// Crear la tabla de usuarios
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      phone TEXT NOT NULL,
      gender TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error('Error al crear la tabla:', err);
      } else {
        console.log('Tabla de usuarios creada.');
      }
    }
  );
});

module.exports = db;
