require('dotenv').config();
const express = require("express")
const bcrypt = require("bcryptjs")
const app = module.exports = express();
const server = require('../server')
const authController = require('../controllers/authController')


app.post('/login', authController.login)
app.post('/logout', authController.logout)
app.post("/register", authController.register)
