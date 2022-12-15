require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const server = require('../server')
const {isAuth, isAuthAdmin} = require('../helpers/isAuth')

app.get('/', isAuth, async (req, res) => {
    try {
        const pgPool = server.pgPool
        let orders
        let response = await pgPool.query(`Select * from orders where user_id = '${req.session.user.user_id}'`)
        if (response.rows.length == 0) orders = []
        orders = response.rows
        return res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.post('/create', isAuth, async (req, res) => {
    let {address_id, order_date, shipping_date, status} = req.body
    if(address_id == null || order_date == null || shipping_date == null || status == null) return res.status(500).json({error : "Impartial Data"})
    
    try {
        const pgPool = server.pgPool

        let user = await pgPool.query(`Select * from users where user_id = ${req.session.user.user_id}`)
        if (user.rows.length == 0) return res.status(404).send({error : "User not Found!"})
        user = user.rows[0]

        let address = await pgPool.query(`Select * from addresses where address_id = ${address_id}`)
        if (address.rows.length == 0) return res.status(404).send({error : "Address not Found!"})
        
        await pgPool.query(`Insert into orders (user_id, address_id, order_date, shipping_date, status)` +
                                              `values (${user.user_id}, ${address_id}, '${order_date}', '${shipping_date}', '${status}')`)
        return res.status(200).json({
            success : "Order created Successfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})


app.patch('/update/:order_id', isAuthAdmin, async (req, res) => {
    const order_id = req.params.order_id
    const {address_id, shipping_date, status} = req.body
    if(order_id == null || address_id == null || shipping_date || status == null) return res.status(500).json({error : "Impartial Data"})
    try {
        const pgPool = server.pgPool

        let order = await pgPool.query(`Select * from orders where order_id = ${order_id}`)
        if (order.rows.length == 0) return res.status(404).send({error : "Order not Found!"})

        let address = await pgPool.query(`Select * from addresses where address_id = ${address_id}`)
        if (address.rows.length == 0) return res.status(404).send({error : "Address not Found!"})

        await pgPool.query(`Update orders
                            Set address_id='${address_id}',  shipping_date='${shipping_date}' , status='${status}'
                            Where order_id=${order_id}`)
        return res.status(200).json({
            success : "Order updated Successfully"        
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.delete('/:order_id', isAuthAdmin, async (req, res) => {
    const order_id = req.params.order_id
    try {
        const pgPool = server.pgPool
        let order = await pgPool.query(`Select * from orders where order_id = ${order_id}`)
        if (order.rows.length == 0) return res.status(404).json({error : "Order not found"})

        await pgPool.query(`Delete from orders
                            Where order_id=${order_id}`)
        return res.status(200).json({
            success: "Order Deleted Succesfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})
