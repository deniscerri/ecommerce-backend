require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const server = require('../server')
const {isAuth} = require('../helpers/isAuth')
const addressController = require('../controllers/addressController')

app.get('/', isAuth, addressController.getUserAddresses)
app.post('/create', isAuth, addressController.createAddress)
app.patch('/update/:address_id', isAuth, addressController.updateAddress)
app.delete('/:address_id', isAuth, addressController.deleteAddress)

