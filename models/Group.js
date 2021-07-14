const Sequelize = require('sequelize');
const sequelize = require('../database');

const Group = sequelize.define('Group', {
    groupId: {
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


module.exports = Group;