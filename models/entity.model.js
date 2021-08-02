const Sequelize = require("sequelize");
const sequelize = require("../config/database.config");

const Entity = sequelize.define(
    "Entity", {
        entityId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    }, {
        timestamps: false,
        updatedAt: false,
    }
);

const Channel = sequelize.define(
    "Channel", {
        channelId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        mid: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
        updatedAt: false,
    }
);

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

const Group = sequelize.define(
    "Group", {
        groupId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        mid: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
        updatedAt: false,
    }
);

Channel.hasMany(Entity, {
    foreignKey: {
        name: "cid",
        allowNull: true,
        defaultValue: null,
    },
});
Entity.belongsTo(Channel, {
    foreignKey: {
        name: "cid",
        allowNull: true,
        defaultValue: null,
    },
});

Group.hasMany(Entity, {
    foreignKey: { name: "gid", allowNull: true, defaultValue: null },
});
Entity.belongsTo(Group, {
    foreignKey: { name: "gid", allowNull: true, defaultValue: null },
});

User.hasMany(Entity, {
    foreignKey: { name: "uid", allowNull: true, defaultValue: null },
});
Entity.belongsTo(User, {
    foreignKey: { name: "uid", allowNull: true, defaultValue: null },
});

module.exports = { Entity, User, Channel, Group };