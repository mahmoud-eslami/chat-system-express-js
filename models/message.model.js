const Sequelize = require("sequelize");
const sequelize = require("../config/database.config");
const { Entity, Channel, User, Group } = require("./entity.model");
const Membership = require("./membership.model");

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

Entity.hasMany(Message, {
    foreignKey: { name: "eid_sender", allowNull: false },
});
Message.belongsTo(Entity, {
    foreignKey: { name: "eid_sender", allowNull: false },
});
Entity.hasMany(Message, {
    foreignKey: { name: "eid_receiver", allowNull: false },
});
Message.belongsTo(Entity, {
    foreignKey: { name: "eid_receiver", allowNull: false },
});

Message.hasMany(Message, {
    foreignKey: { name: "replay_mid", allowNull: true },
});
Message.belongsTo(Message, {
    foreignKey: { name: "replay_mid", allowNull: true },
});

Membership.hasMany(Message, {
    foreignKey: { name: "membershipId", allowNull: false },
});

Message.belongsTo(Membership, {
    foreignKey: { name: "membershipId", allowNull: false },
});

module.exports = Message;