module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite'
  },
  production: {
    dialect: 'sqlite',
    storage: process.env.DATABASE_STORAGE
  }
};
