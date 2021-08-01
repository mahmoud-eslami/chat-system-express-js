const Sequelize = require("sequelize");
const sequelize = new Sequelize("test2", "root", "", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

// // entity associate
// Group.hasOne(Entity, { foreignKey: { name: "gid", allowNull: true } });
// Entity.belongsTo(Group, { foreignKey: { name: "gid", allowNull: true } });
// Channel.hasOne(Entity, { foreignKey: { name: "cid", allowNull: true } });
// Entity.belongsTo(Channel, { foreignKey: { name: "cid", allowNull: true } });
// User.hasOne(Entity, { foreignKey: { name: "uid", allowNull: true } });
// Entity.belongsTo(User, { foreignKey: { name: "uid", allowNull: true } });

// // memberShip associate
// Entity.hasOne(Membership, { foreignKey: { name: "eid1", allowNull: true } });
// Membership.belongsTo(Entity, { foreignKey: { name: "eid1", allowNull: true } });
// Entity.hasOne(Membership, { foreignKey: { name: "eid2", allowNull: true } });
// Membership.belongsTo(Entity, { foreignKey: { name: "eid2", allowNull: true } });

// // message associate
// Entity.hasOne(Message, {
//     foreignKey: { name: "eid_sender", allowNull: false },
// });
// Message.belongsTo(Entity, {
//     foreignKey: { name: "eid_sender", allowNull: false },
// });
// Entity.hasOne(Message, {
//     foreignKey: { name: "eid_receiver", allowNull: false },
// });
// Message.belongsTo(Entity, {
//     foreignKey: { name: "eid_receiver", allowNull: false },
// });

// Message.hasOne(Message, {
//     foreignKey: { name: "replay_mid", allowNull: true },
// });
// Message.belongsTo(Message, {
//     foreignKey: { name: "replay_mid", allowNull: true },
// });

// // group associate
// // Message.hasOne(Group, { foreignKey: { name: "mid", allowNull: true } });
// // Group.belongsTo(Message, { foreignKey: { name: "mid", allowNull: true } });

// // channel associate
// // Message.hasOne(Channel, { foreignKey: { name: "mid", allowNull: true } });
// // Channel.belongsTo(Message, { foreignKey: { name: "mid", allowNull: true } });

module.exports = sequelize;