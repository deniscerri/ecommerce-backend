require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const bcrypt = require("bcryptjs")
const server = require('../server')
const {isAuth, isAuthAdmin} = require('../helpers/isAuth')
const userController = require('../controllers/userController')

app.get('/info', isAuth, userController.getUserInfo)
app.patch('/info', isAuth, userController.updateUserInfo)
app.patch('/password', isAuth, userController.updateUserPassword)

// ADMIN OPERATIONS

app.get('/all', isAuthAdmin, userController.getAllUsers)
app.post('/create', isAuthAdmin, userController.createUser)
