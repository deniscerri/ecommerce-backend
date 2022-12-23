const db = require('../models')
const Order = db.orders
const Product = db.products
const User = db.users
const Address = db.addresses
const {getPagination, getPagingData} = require("../helpers/pagination")


const getUserOrders = async (req, res) => {
    try {
        const {page, size} = req.query
        let {limit, offset} = getPagination(page, size)
        let orders = await Order.findAndCountAll({
            order: [['order_date', 'DESC']],
            limit,
            offset,
            include: [
                {
                    model: Product,
                    as: 'products'
                },
                {
                    model: Address,
                    as: 'address'
                }
            ],
            distinct: true,
            where: {user_id: req.session.user.user_id}
        }).then(o => {
            const data = getPagingData(o, page, limit)
            return data
        })
        if (orders == null) orders = []
        if(orders.currentPage > orders.totalPages)
            return res.status(404).json({
                error: `Page Index Out of Bounds. Page Nr Provided: ${orders.currentPage}, Total Pages: ${orders.totalPages}`
            })
        return res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

const createOrder = async (req, res) => {
    try{
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });

        let user = await User.findOne({where: {user_id: req.session.user.user_id}})
        if(user == null) throw {message : "User not found"}

        let address = await Address.findOne({where: {address_id: req.body.address_id, user_id: req.session.user.user_id}})
        if (address == null) return res.status(404).send({error : "Address not Found!"})
        let date = new Date()
        let info = {
            order_date: date,
            order_shipping_date: new Date(+date + 12096e5), // 2 weeks after
            user_id: req.session.user.user_id,
            address_id: address.address_id
        }

        
        let order = await Order.create(info)
        let products = req.body.products
        //add products
        products.forEach(async p => {
            let product = await Product.findOne({where: {product_id: p}})
            if(product != null) await order.addProduct(product, {through: {order_id: order.order_id}})
        });
        return res.status(201).json({
            success: "Order created"
        })
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

const updateOrder = async (req, res) => {
    try {
        const order_id = req.params.order_id
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });
        if (order_id == null) throw {message: "No Order ID given"}

        let order = await Order.findOne({where: {order_id: order_id, user_id: req.session.user.user_id}})
        if (order == null) return res.status(404).send({error : "Order not Found!"})

        let info = {
            address_id: req.body.address_id,
            order_shipping_date: req.body.shipping_date,
            order_status: req.body.status
        }

        await Order.update(info, {where: {order_id: order_id}})
        return res.status(200).json({
            success : "Order updated Successfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

const deleteOrder = async (req, res) => {
    try {
        const order_id = req.params.order_id
        if (order_id == null ) throw {message: "No Order ID given"}
        
        let order = await Order.findOne({where: {order_id: order_id, user_id: req.session.user.user_id}})
        if (order == null) return res.status(404).send({error : "Order not Found!"})

        await Order.destroy({where: {order_id: order_id}})
        return res.status(200).json({
            success: "Order Deleted Succesfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

module.exports = {
    getUserOrders,
    createOrder,
    updateOrder,
    deleteOrder
}
