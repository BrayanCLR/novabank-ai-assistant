/**
 * Script de una sola ejecución: aplica init-production.sql contra el
 * Autonomous Database real, usando el mismo driver (oracledb, modo
 * Thin) y wallet que ya usa el backend. Evita depender de sqlplus/
 * Oracle Instant Client, que no tenemos instalados en el servidor.
 *
 * Uso: node scripts/apply-schema.js
 * Variables de entorno requeridas: ORACLE_USER, ORACLE_PASSWORD,
 * ORACLE_CONNECT_STRING, ORACLE_WALLET_LOCATION, ORACLE_WALLET_PASSWORD
 */
const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');

async function main() {
  const {
    ORACLE_USER,
    ORACLE_PASSWORD,
    ORACLE_CONNECT_STRING,
    ORACLE_WALLET_LOCATION,
    ORACLE_WALLET_PASSWORD,
  } = process.env;

  if (!ORACLE_PASSWORD || !ORACLE_CONNECT_STRING || !ORACLE_WALLET_LOCATION) {
    console.error('Faltan variables de entorno. Corre este script con:');
    console.error('  export $(grep -v "^#" .env.production | xargs) && node scripts/apply-schema.js');
    process.exit(1);
  }

  const connection = await oracledb.getConnection({
    user: ORACLE_USER,
    password: ORACLE_PASSWORD,
    connectString: ORACLE_CONNECT_STRING,
    configDir: ORACLE_WALLET_LOCATION,
    walletLocation: ORACLE_WALLET_LOCATION,
    walletPassword: ORACLE_WALLET_PASSWORD,
  });

  console.log('Conectado al Autonomous Database.');

  const sqlPath = path.resolve(__dirname, '..', 'init-production.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    console.log(`Ejecutando: ${statement.slice(0, 60)}...`);
    try {
      await connection.execute(statement);
      console.log('  OK');
    } catch (error) {
      console.error('  ERROR:', error.message);
    }
  }

  await connection.commit();
  await connection.close();
  console.log('Esquema aplicado. Listo.');
}

main().catch((err) => {
  console.error('Fallo general:', err);
  process.exit(1);
});
