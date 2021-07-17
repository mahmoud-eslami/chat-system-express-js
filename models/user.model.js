const Sequelize = require('sequelize');
const sequelize = require('../config/database.config');

const User = sequelize.define('User', {
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    }
}, {
    freezeTableName: true,
});


module.exports = User;