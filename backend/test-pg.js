const { Client } = require('pg');
const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'postgrespassword',
  database: 'usability_db',
  connectionTimeoutMillis: 3000,
});

client.connect()
  .then(() => {
    console.log('Postgres connection SUCCESS on 127.0.0.1');
    return client.end();
  })
  .catch((err) => {
    console.error('Postgres connection ERROR:', err.message);
    process.exit(1);
  });
