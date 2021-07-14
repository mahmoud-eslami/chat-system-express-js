const Sequelize = require('sequelize');
const sequelize = require('../database');

const Channel = sequelize.define('Channel', {
    channelId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    freezeTableName: true,
});

module.exports = Channel;