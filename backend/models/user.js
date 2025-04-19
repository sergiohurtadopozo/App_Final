// backend/models/user.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      username: { type: DataTypes.STRING, unique: true, allowNull: false },
      email:    { type: DataTypes.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
      password: { type: DataTypes.STRING, allowNull: false },
      role:     { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' }
    });
    User.associate = db => User.hasMany(db.Task, { foreignKey: 'userId' });
    return User;
  };
  