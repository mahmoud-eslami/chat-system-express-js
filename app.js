const
    sequelize = require('./database');

const User = require('./models/User');

syncDatabase();
checkDb();

async function syncDatabase() {
    try {
        sequelize.sync();
    } catch (err) {
        console.log(err);
    }
}

async function checkDb() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}