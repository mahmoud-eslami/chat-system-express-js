const Sequelize = require("sequelize");
const sequelize = require("../config/database.config");
const bcrypt = require("bcrypt");

const User = sequelize.define(
    "User", {
        userId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Must be a valid email address",
                },
            },
        },

        username: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
        updatedAt: false,
    }
);

module.exports = User;