const express = require('express');
const sequelize = require('sequelize');
const mysql = require('mysql');

const app = express();
const port = 8080;


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
});

connection.connect((err) => {
    if (err) throw err;
    console.log('connected !');
});

checkDataBaseConnection();

app.listen(port, () => {
    console.log('app is listen on ' + port);
});

async function checkDataBaseConnection() {
    try {
        await sequelize.authenticate;
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}


// routes