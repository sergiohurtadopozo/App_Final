// backend/config/config.js
module.exports = {
    development: {
      dialect: 'sqlite',
      storage: './database.sqlite'
    },
    production: {
      use_env_variable: 'DATABASE_URL',
      dialect: 'postgres',
      dialectOptions: {
        ssl: { rejectUnauthorized: false }
      }
    }
  };
  