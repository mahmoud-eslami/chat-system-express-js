const Sequelize = require('sequelize');
const sequelize = require('../config/database.config');

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
    updatedAt: false,
});


module.exports = Group;