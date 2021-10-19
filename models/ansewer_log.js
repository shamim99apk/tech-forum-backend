'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ansewer_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ansewer_log.belongsTo(models.Answer, {
        foreignKey: 'answer_id',
    });
    }
  };
  Ansewer_log.init({
    upvote: DataTypes.ARRAY(DataTypes.INTEGER),
    down_vote: DataTypes.ARRAY(DataTypes.INTEGER)
  }, {
    sequelize,
    modelName: 'Ansewer_log',
  });
  return Ansewer_log;
};