const Sequelize = require("sequelize");
const sequelize = require("../config/database.config");
const { Entity, Channel, User, Group } = require("./entity.model");

const Membership = sequelize.define(
    "Membership", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
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

Entity.hasOne(Membership, {
    foreignKey: {
        name: "eid1",
        allowNull: true,
    },
});
Membership.belongsTo(Entity, {
    foreignKey: {
        name: "eid1",
        allowNull: true,
    },
});
Entity.hasOne(Membership, {
    foreignKey: { name: "eid2", allowNull: true },
});
Membership.belongsTo(Entity, {
    foreignKey: { name: "eid2", allowNull: true },
});

module.exports = Membership;