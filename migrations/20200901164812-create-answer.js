'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Answers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            body: {
                type: Sequelize.TEXT
            },
            upvote_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            down_vote_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            accepted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            respondentId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            questionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            approval: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Answers');
    }
};