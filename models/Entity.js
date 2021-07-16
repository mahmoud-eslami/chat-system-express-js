const Sequelize = require('sequelize');
const sequelize = require('../database');
const group = require('../models/Group');


const Entity = sequelize.define('Entity', {
    entityId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
}, {
    timestamps: false,
});

module.exports = Entity;