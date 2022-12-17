require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const server = require('../server')
const {isAuth, isAuthAdmin} = require('../helpers/isAuth')
const orderController = require('../controllers/orderController')

app.get('/', isAuth, orderController.getUserOrders)
app.post('/create', isAuth, orderController.createOrder)
app.patch('/update/:order_id', isAuthAdmin, orderController.updateOrder)
app.delete('/:order_id', isAuthAdmin, orderController.deleteOrder)
