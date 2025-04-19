// backend/models/task.js
module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
      title:       { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.STRING, defaultValue: '' },
      status:      { type: DataTypes.STRING, defaultValue: 'pending' },
      dueDate:     { type: DataTypes.DATE, allowNull: true }
    });
    Task.associate = db => Task.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    return Task;
  };
  