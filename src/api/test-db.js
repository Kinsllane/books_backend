const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: 'bookswap',
  username: 'postgres', 
  password: '123456', // попробуй этот пароль
  host: 'localhost',
  port: 5432,
  dialect: 'postgres'
});

async function test() {
  try {
    await sequelize.authenticate();
    console.log('✅ УСПЕХ! PostgreSQL подключен!');
    
    // Проверим есть ли база bookswap
    const result = await sequelize.query("SELECT datname FROM pg_database WHERE datname = 'bookswap'");
    if (result[0].length > 0) {
      console.log('✅ База bookswap существует');
    } else {
      console.log('❌ База bookswap не найдена. Создай ее через pgAdmin или командой:');
      console.log('   CREATE DATABASE bookswap;');
    }
  } catch (error) {
    console.log('❌ Ошибка подключения:', error.message);
    console.log('💡 Попробуй другие пароли: password, postgres, admin');
  }
}

test();