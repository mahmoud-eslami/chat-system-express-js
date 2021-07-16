const Sequelize = require('sequelize');
const sequelize = require('../database');
const group = require('../models/Group');
const channel = require('../models/Channel');
const user = require('../models/User');


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