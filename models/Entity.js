const Sequelize = require('sequelize');
const sequelize = require('../database');
const User = require('./User');
const Group = require('./Group');
const Channel = require('./Channel');

const Entity = sequelize.define('Entity', {
    entityId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: User,
            key: 'userId'
        }
    },
    groupId: {
        type: Sequelize.INTEGER,
        references: {
            model: Group,
            key: 'groupId'
        }
    },
    channelId: {
        type: Sequelize.INTEGER,
        references: {
            model: Channel,
            key: 'channelId'
        }
    },
});

module.exports = Entity;