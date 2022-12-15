require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const server = require('../server')
const {isAuth, isAuthAdmin} = require('../helpers/isAuth')

app.get('/new', isAuth, async (req, res) => {
    try {
        const pgPool = server.pgPool
        let products
        let response = await pgPool.query(`Select * from products order by updated_at desc limit 100`)
        if (response.rows.length == 0) products = []
        products = response.rows
        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.get('/category/:category', isAuth, async (req, res) => {
    const category = req.params.category
    try {
        const pgPool = server.pgPool
        let products
        let response = await pgPool.query(`Select * from products where product_category ='${category}' order by updated_at`)
        if (response.rows.length == 0) products = []
        products = response.rows
        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.get('/:product_id', isAuth, async (req, res) => {
    const product_id = req.params.product_id
    try {
        const pgPool = server.pgPool
        let products
        let response = await pgPool.query(`Select * from products where product_id = ${product_id}`)
        if (response.rows.length == 0) products = []
        products = response.rows
        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.post('/create', isAuthAdmin, async (req, res) => {
    let {name, description, price, discounted_price, stock, category} = req.body
    if(name == null || description == null || price == null || discounted_price == null
        || stock == null || category == null) 
        return res.status(500).json({error : "Impartial Data"})
    try {
        const pgPool = server.pgPool
        const currentDate = new Date().toLocaleDateString('en-CA');
        await pgPool.query(`Insert into products (product_name, product_description, product_price, product_discounted_price,
                            product_stock, product_category, created_at, updated_at)` +
                            `values ('${name}', '${description}', '${price}', '${discounted_price}', ${stock},
                            '${category}', '${currentDate}', '${currentDate}')`)
        return res.status(200).json({
            success : "Product created Successfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})


app.patch('/:product_id', isAuthAdmin, async (req, res) => {
    const product_id = req.params.product_id
    let {name, description, price, discounted_price, stock, category} = req.body
    if(product_id == null || name == null || description == null || price == null || discounted_price == null
        || stock == null || category == null) 
        return res.status(500).json({error : "Impartial Data"})    
    try {
        const pgPool = server.pgPool

        let product = await pgPool.query(`Select * from products where product_id = ${product_id}`)
        if (product.rows.length == 0) return res.status(404).send({error : "Product not Found!"})
        const currentDate = new Date().toLocaleDateString('en-CA');

        await pgPool.query(`Update products
                            Set product_name='${name}', product_description='${description}', product_price='${price}',
                            product_discounted_price='${discounted_price}', product_stock=${stock},product_category='${category}',updated_at = '${currentDate}'
                            Where product_id=${product_id}`)
        return res.status(200).json({
            success : "Product updated Successfully"        
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.delete('/:product_id', isAuthAdmin, async (req, res) => {
    const product_id = req.params.product_id
    try {
        const pgPool = server.pgPool
        let product = await pgPool.query(`Select * from products where product_id = ${product_id}`)
        if (product.rows.length == 0) return res.status(404).json({error : "Product not found"})

        await pgPool.query(`Delete from products
                            Where product_id=${product_id}`)
        return res.status(200).json({
            success: "Product Deleted Succesfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})
