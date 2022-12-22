require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const server = require('../server')
const {isAuth, isAuthAdmin} = require('../helpers/isAuth')
const productController = require('../controllers/productController')

app.get('/', isAuth, productController.getProducts)
app.get('/category/:category', isAuth, productController.getProductsByCategory)
app.get('/:product_id', isAuth, productController.getProductById)
app.post('/create', isAuthAdmin, productController.createProduct)
app.patch('/:product_id', isAuthAdmin, productController.updateProduct)
app.delete('/:product_id', isAuthAdmin, productController.deleteProduct)
