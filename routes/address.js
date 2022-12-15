require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const server = require('../server')
const {isAuth} = require('../helpers/isAuth')

app.get('/', isAuth, async (req, res) => {
    try {
        const pgPool = server.pgPool
        let orders
        let response = await pgPool.query(`Select * from addresses where user_id = '${req.session.user.user_id}'`)
        if (response.rows.length == 0) orders = []
        orders = response.rows
        return res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.post('/create', isAuth, async (req, res) => {
    const {name, surname, email, country, city, line1, line2, phone} = req.body
    if(name == null || surname == null || email == null || country == null || city == null, line1 == null
        || line2 == null || phone == null) return res.status(500).json({error : "Impartial Data"})
    try {
        const pgPool = server.pgPool
        let createdAddress = await pgPool.query(`Insert into addresses (user_id, address_name, address_surname, 
                                                address_email, address_country, address_city, address_line1, address_line2, address_phone)` +
                                              `values (${req.session.user.user_id}, '${name}', '${surname}', '${email}', '${country}', '${city}', '${line1}', '${line2}', '${phone}')`)
        return res.status(200).json({
            success : "Address created Successfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})


app.patch('/update/:address_id', isAuth, async (req, res) => {
    const address_id = req.params.address_id
    const {name, surname, email, country, city, line1, line2, phone} = req.body
    if(address_id == null || name == null || surname == null || email == null || country == null || city == null, line1 == null
        || line2 == null || phone == null) return res.status(500).json({error : "Impartial Data"})
    try {
        const pgPool = server.pgPool

        let address = await pgPool.query(`Select * from addresses where address_id = ${address_id} and user_id = ${req.session.user.user_id}`)
        if (address.rows.length == 0) return res.status(404).send({error : "Address not Found!"})

        await pgPool.query(`Update addresses
                            Set address_name='${name}', address_surname='${name}', address_email='${email}', address_country='${country}', address_city='${city}',
                            address_line1='${line1}', address_line2='${line2}', address_phone='${phone}'
                            Where address_id=${address_id}`)
        return res.status(200).json({
            success : "Address updated Successfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.delete('/:address_id', isAuth, async (req, res) => {
    const address_id = req.params.address_id
    try {
        const pgPool = server.pgPool
        let address = await pgPool.query(`Select * from addresses where address_id = ${address_id} and user_id = ${req.session.user.user_id}`)
        if (address.rows.length == 0) return res.status(404).json({error : "Address not found"})

        let orders = await pgPool.query(`Select * from orders where address_id = ${address_id}`)
        if(orders.rows.length > 0){
            for (let i = 0; i < orders.rows.length; i++) {
                const order = orders.rows[i];
                if(order.status != 'Completed') {
                    return res.status(403).json({error: "Cannot delete Address. In-progress orders are using it!"})
                }
            }
        }

        await pgPool.query(`Delete from addresses
                            Where address_id=${address_id}`)
        return res.status(200).json({
            success: "Address Deleted Succesfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

