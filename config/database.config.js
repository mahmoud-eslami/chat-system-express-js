const Sequelize = require('sequelize')
const sequelize = new Sequelize(
    'test',
    'root',
    '', {
        host: 'localhost',
        dialect: 'mysql',
        logging: false,
    });


module.exports = sequelize