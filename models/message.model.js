const Sequelize = require("sequelize");
const sequelize = require("../config/database.config");

const Message = sequelize.define(
    "Message", {
        messageId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        viewCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            default: 0,
        },
        Text: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
        updatedAt: false,
    }
);

module.exports = Message;