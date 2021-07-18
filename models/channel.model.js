const Sequelize = require('sequelize');
const sequelize = require('../config/database.config');

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
    updatedAt: false,
});


module.exports = Channel;