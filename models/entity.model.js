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

// Entity.belongsTo(channel, { foreignKey: { name: "cid", allowNull: true } });
// Entity.belongsTo(group, { foreignKey: { name: "gid", allowNull: true } });
// Entity.belongsTo(user, { foreignKey: { name: "uid", allowNull: true } });

module.exports = Entity;