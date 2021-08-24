const Sequelize = require("sequelize");
const sequelize = require("../config/database.config");
const { Entity, Channel, User, Group } = require("./entity.model");
const Membership = require("./membership.model");

const seenMessage = sequelize.define("seenMessage", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
});

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
            type: Sequelize.JSON,
            allowNull: false,
        },
        selfDelete: {
            type: Sequelize.INTEGER,
            allowNull: true,
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

// seen message fk

Message.hasMany(seenMessage, {
    foreignKey: { name: "mid", allowNull: true },
});
seenMessage.belongsTo(Message, {
    foreignKey: { name: "mid", allowNull: true },
});

Entity.hasMany(seenMessage, {
    foreignKey: { name: "eid", allowNull: true },
});
seenMessage.belongsTo(Entity, {
    foreignKey: { name: "eid", allowNull: true },
});

module.exports = { Message, seenMessage };