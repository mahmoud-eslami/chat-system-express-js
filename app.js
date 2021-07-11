require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

const { login, refresh } = require('./authentication')
app.use(bodyParser.json())
app.use(cookieParser())

app.post('/login', login)
app.post('/refrsh', refresh)