require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const server = require('../server')
const {isAuth, isAuthAdmin} = require('../helpers/isAuth')
const orderController = require('../controllers/orderController')

app.get('/', isAuth, orderController.getUserOrders)
app.post('/create', isAuth, orderController.createOrder)


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
