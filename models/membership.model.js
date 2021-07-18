const Sequelize = require('sequelize');
const sequelize = require('../config/database.config');
const entity = require('./entity.model');

const Membership = sequelize.define('Membership', {
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
});

Membership.belongsTo(entity, { foreignKey: { name: 'eid1', allowNull: false } });
Membership.belongsTo(entity, { foreignKey: { name: 'eid2', allowNull: false } });

module.exports = Membership;