const Sequelize = require('sequelize');
const sequelize = require('../database');
const entity = require('./Entity');

const Message = sequelize.define('Message', {
    //todo : user snow flake here
    messageId: {
        type: Sequelize.STRING,
        allowNull: false,
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
});

Message.belongsTo(entity, { foreignKey: { name: 'eid', allowNull: false } });
Message.belongsTo(entity, { foreignKey: { name: 'eid_receiver', allowNull: false } });
Message.belongsTo(Message, { foreignKey: { name: 'replay_mid', allowNull: true } });

module.exports = Message;