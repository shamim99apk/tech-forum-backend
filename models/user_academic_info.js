'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_academic_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_academic_info.belongsTo(models.User, {foreignKey: 'user_id', constraints: false});

    }
  };
  User_academic_info.init({
    degree_name: DataTypes.STRING,
    institution_name: DataTypes.STRING,
    passing_year: DataTypes.DATE,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User_academic_info',
  });
  return User_academic_info;
};