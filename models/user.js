'use strict';
const {
    Model
} = require('sequelize');
const http = require('http')

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.belongsToMany(models.Role, {
                through: 'UserRoles',
                // as: 'roles',
                foreignKey: 'userId',
            });

            User.hasMany(models.Question, {
                foreignKey: 'questionerId'
            });

            User.hasMany(models.Answer, {
                foreignKey: 'respondentId'
            });
            User.hasMany(models.Comment, {
                foreignKey: 'UserId'
            });
            User.hasMany(models.User_academic_info, {
                foreignKey: 'user_id'
            });
            User.hasMany(models.User_job_info, {
                foreignKey: 'user_id'
            });
            User.hasMany(models.User_training_info, {
                foreignKey: 'user_id'
            });
        }
    }

    //working with this....
    User.init({
        profile: {
            type: DataTypes.STRING,
            get() {
                const path = this.getDataValue("profile");
                const pathSplit = path ? path.split("/") : null
                const profileUrl =path? 'profile'+'/'+pathSplit[2]:null
                return profileUrl;
            }
        },
        userName: DataTypes.STRING,
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        password: DataTypes.STRING,
        email: DataTypes.STRING,
        phoneNo: DataTypes.STRING,
        status: DataTypes.STRING,
        about: DataTypes.STRING,
        is_superAdmin: DataTypes.BOOLEAN,
        banned: DataTypes.BOOLEAN,
        emailVerification: DataTypes.BOOLEAN,
        verifyToken: DataTypes.UUID,
        forgotCode: DataTypes.STRING,
        forgotCodeDateTime: DataTypes.DATE,
        gender: DataTypes.CHAR,
        country: DataTypes.STRING,
        website: DataTypes.STRING,
        social_information: DataTypes.JSON,
        cv: DataTypes.STRING,
        sna: DataTypes.STRING,
        dob: DataTypes.DATE,
        bio: DataTypes.TEXT,
    }, {
        sequelize,
        modelName: 'User',
    });

    return User;
};