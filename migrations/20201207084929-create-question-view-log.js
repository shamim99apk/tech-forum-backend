'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Question_view_logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            data: {
                type: Sequelize.JSON
            },
            pinned_by_user: {
                type: Sequelize.ARRAY(Sequelize.INTEGER)
            },
            upvote_data: {
                type: Sequelize.ARRAY(Sequelize.INTEGER)
            },
            down_vote_data: {
                type: Sequelize.ARRAY(Sequelize.INTEGER)
            },
            questionId: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Question_view_logs');
    }
};