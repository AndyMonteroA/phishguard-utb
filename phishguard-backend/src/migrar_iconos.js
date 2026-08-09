require('dotenv').config();
const { Modulo } = require('./models');

const migrarIconos = async () => {
  try {
    const modulos = await Modulo.findAll();
    const mapaIconos = {
      '🎣': 'FiMail',
      '🎭': 'FiUsers',
      '📞': 'FiPhone',
      '🪤': 'FiHardDrive',
      '🛡️': 'FiShield'
    };

    for (const mod of modulos) {
      if (mapaIconos[mod.icono]) {
        await mod.update({ icono: mapaIconos[mod.icono] });
        console.log(`Modulo ${mod.titulo} actualizado a icono ${mapaIconos[mod.icono]}`);
      }
    }
    console.log('Migración completa.');
    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
};

migrarIconos();
