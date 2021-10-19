'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Answer extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here questionId
            Answer.belongsTo(models.User, {
                foreignKey: 'respondentId'
            });

            Answer.belongsTo(models.Question, {
                foreignKey: 'questionId'
            });

            Answer.hasOne(models.Ansewer_log, {
                foreignKey: 'answer_id'
            });
            
            //polymorphic association
            Answer.hasMany(models.Comment, {
                foreignKey: 'commentableId',
                constraints: false,
                scope: {
                    commentableType: 'answer'
                }
            });
        }
    }

    Answer.init({
        body: DataTypes.TEXT,
        approval: DataTypes.BOOLEAN,
        upvote_count: DataTypes.INTEGER,
        down_vote_count: DataTypes.INTEGER,
        accepted: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Answer',
    });
    return Answer;
};