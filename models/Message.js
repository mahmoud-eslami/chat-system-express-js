const Sequelize = require('sequelize');
const sequelize = require('../database');

const Message = sequelize.define('Message', {
    //todo : user snow flake here
    messageId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },

}, {
    freezeTableName: true,
});

module.exports = Message;