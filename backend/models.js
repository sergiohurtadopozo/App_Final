const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Modelo para los usuarios
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Nuevo campo para definir el rol del usuario
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user' // Por defecto, el usuario tiene el rol 'user'
  }
});

// Modelo para las tareas (incluyendo la asociación con el usuario)
const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Asociaciones
Task.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Task, { foreignKey: 'userId' });

module.exports = { sequelize, Task, User };
