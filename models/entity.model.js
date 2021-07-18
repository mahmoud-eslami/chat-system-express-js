const Sequelize = require('sequelize');
const sequelize = require('../config/database.config');
const group = require('./group.model');
const channel = require('../models/channel.model');
const user = require('./user.model');


const Entity = sequelize.define('Entity', {
    entityId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
}, {
    timestamps: false,
});

Entity.belongsTo(channel, { foreignKey: { name: 'cid', allowNull: true } });
Entity.belongsTo(group, { foreignKey: { name: 'gid', allowNull: true } });
Entity.belongsTo(user, { foreignKey: { name: 'uid', allowNull: true } });

module.exports = Entity;