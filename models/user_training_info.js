'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_training_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_training_info.belongsTo(models.User, {foreignKey: 'user_id', constraints: false});
    }
  };
  User_training_info.init({
    institue_name: DataTypes.STRING,
    course_name: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User_training_info',
  });
  return User_training_info;
};