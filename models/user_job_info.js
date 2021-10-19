'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_job_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_job_info.belongsTo(models.User, {foreignKey: 'user_id', constraints: false});
    }
  };
  User_job_info.init({
    organization_name: DataTypes.STRING,
    position: DataTypes.STRING,
    duration: DataTypes.DATE,
    designation: DataTypes.STRING,
    responsibilities: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User_job_info',
  });
  return User_job_info;
};