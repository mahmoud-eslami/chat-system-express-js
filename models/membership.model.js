const Sequelize = require("sequelize");
const sequelize = require("../config/database.config");

const Membership = sequelize.define(
    "Membership", {
        Role: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        LastVisitDate: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    }, {
        updatedAt: false,
    }
);

module.exports = Membership;