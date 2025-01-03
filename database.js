const { Pool } = require('pg');

// URL de conexión a la base de datos en Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:eEpoCxvTHYcBqrTsPaytKUecQiGRZAnL@junction.proxy.rlwy.net:34053/railway', // Reemplaza con tu URL real de PostgreSQL
  ssl: {
    rejectUnauthorized: false, // Necesario para conexiones seguras
  },
});

// Probar la conexión
pool.connect((err) => {
  if (err) {
    console.error('Error al conectar con PostgreSQL:', err.stack);
  } else {
    console.log('Conexión exitosa con PostgreSQL');
  }
});

module.exports = pool;
