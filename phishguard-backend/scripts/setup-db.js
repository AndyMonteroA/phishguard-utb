// ============================================================
// PhishGuard UTB - Setup completo de base de datos
// Ejecutar: npm run setup
// ============================================================

const { execSync } = require('child_process');
const path = require('path');

async function setup() {
  console.log('========================================');
  console.log('  PhishGuard UTB - Setup de Base de Datos');
  console.log('========================================\n');

  try {
    // Paso 1: Sincronizar modelos (crear tablas)
    console.log('[1/3] Sincronizando modelos con la base de datos...');
    const { sequelize } = require('../src/models');

    await sequelize.authenticate();
    console.log('  -> Conexion a PostgreSQL exitosa.');

    await sequelize.sync({ alter: true });
    console.log('  -> Tablas creadas/actualizadas correctamente.\n');

    // Paso 2: Ejecutar seeder
    console.log('[2/3] Ejecutando seeder (datos iniciales)...');
    require('../src/seeders/seed');

    // Esperar a que el seeder termine
    await new Promise((resolve) => {
      const check = setInterval(async () => {
        // El seeder hace process.exit, asi que esperamos un poco
        clearInterval(check);
        resolve();
      }, 5000);
    });

  } catch (error) {
    console.error('\n[ERROR] Error en el setup:', error.message);
    console.error('\nAsegurate de que:');
    console.error('  1. PostgreSQL esta corriendo');
    console.error('  2. La base de datos "phishguard_utb" existe');
    console.error('  3. Las credenciales en .env son correctas');
    console.error('\nPara crear la base de datos manualmente:');
    console.error('  psql -U postgres -c "CREATE DATABASE phishguard_utb;"');
    process.exit(1);
  }
}

setup();
