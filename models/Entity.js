const Sequelize = require('sequelize');
const sequelize = require('../database');


const Entity = sequelize.define('Entity', {
    entityId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
});

module.exports = Entity;