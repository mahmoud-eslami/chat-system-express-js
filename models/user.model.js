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
        phoneNumber: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                len: { args: [11, 11], msg: "Phone Number is invalid" },
                isInt: { args: true, msg: "You must enter Phone Number" },
            },
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
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
        indexes: [{
            unique: true,
            fields: ["phoneNumber", "email"],
        }, ],
    }
);

module.exports = User;