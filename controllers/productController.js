const db = require('../models')
const Product = db.products
const Image = db.images
const Op = db.Sequelize.Op
const {getPagination, getPagingData} = require("../helpers/pagination")

const getProducts = async (req, res) => {
    try {
        let {search_query, page, size, is_stock, sort_by, order} = req.query
        
        if(search_query) search_query = `%${search_query}%`
        if(!sort_by) sort_by = 'updatedAt'
        if(!order) order = 'DESC'

        let where_clause = {
            [Op.or] : [
                {
                    product_name: {[Op.substring]: search_query}
                },
                {
                    product_name: {[Op.iLike]: search_query}
                }
            ]
        }
        if(is_stock){
            Object.assign(where_clause, {product_stock : {[Op.gt]: 0}})
        }

        let {limit, offset} = getPagination(page, size)
        let products = await Product.findAndCountAll({
            order: [[sort_by, order]],
            limit,
            offset,
            include: [
                {
                    model: Image,
                    as: 'images',
                    attributes: ["image_url"]
                }
            ],
            where: where_clause,
            distinct: true
        }).then(p => {
            p.rows.forEach(product => {
                product.dataValues.images.map(i => i.dataValues = i.dataValues.image_url)
            })
            const data = getPagingData(p, page, limit)
            return data
        })
        if (products == null) products = []
        if(products.currentPage > products.totalPages) 
            return res.status(404).json({
                error: `Page Index Out of Bounds. Page Nr Provided: ${products.currentPage}, Total Pages: ${products.totalPages}`
            })
        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

const getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category
        let {search_query, page, size, is_stock, sort_by, order} = req.query
        if(search_query) search_query = `%${search_query}%`

        if (category == null) throw {message: "Category not given"}
        if(!sort_by) sort_by = 'updatedAt'
        if(!order) order = 'DESC'
        if (is_stock == 'true') is_stock = true
        else is_stock = false

        let where_clause = {product_category: category}
        if(is_stock){
            Object.assign(where_clause, {product_stock : {[Op.gt]: 0}})
        }

        let {limit, offset} = getPagination(page, size)

        let products = await Product.findAndCountAll({
            order: [[sort_by, order]],
            limit,
            offset, 
            include: [
                {
                    model: Image,
                    as: 'images',
                    attributes: ["image_url"]
                }
            ],
            where: where_clause,
            distinct: true
        }).then(p => {
            p.rows.forEach(product => {
                product.dataValues.images.map(i => i.dataValues = i.dataValues.image_url)
            })
            const data = getPagingData(p, page, limit)
            return data
        })
        if (products == null) products = []
        if(products.currentPage > products.totalPages) 
            return res.status(404).json({
                error: `Page Index Out of Bounds. Page Nr Provided: ${products.currentPage}, Total Pages: ${products.totalPages}`
            })
        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({error : error.message})
    }

}

const getProductById = async (req, res) => {
    try {
        const product_id = req.params.product_id
        if (product_id == null) throw {message: "Product ID not given"}

        let product = await Product.findOne({
            where: {product_id: product_id},
            include: [
                {
                    model: Image,
                    as: 'images',
                    attributes: ["image_url"]
                }
            ]
        }).then(p => {
            p.forEach(product => {
                product.dataValues.images.map(i => i.dataValues = i.dataValues.image_url)
            })
            return p
        })
        if (product == null) return res.status(404).json({
            error: "Product not found"
        })
        return res.status(200).json(product)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}


const createProduct = async (req, res) => {
    try{
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });

        let info = {
            product_name: req.body.name,
            product_description: req.body.description,
            product_price: req.body.price,
            product_discounted_price: req.body.discounted_price,
            product_stock: req.body.stock,
            product_category: req.body.category
        }
        
        let product = await Product.create(info)
        let images = req.body.images
        //add images
        images.forEach(async i => {
            await Image.create({product_id: product.product_id, image_url: i})
        });
        return res.status(201).json({
            success: "Product created"
        })
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

const updateProduct = async (req, res) => {
    try {
        const product_id = req.params.product_id
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });
        if (product_id == null) throw {message: "No Product ID given"}

        let product = await Product.findOne({where: {product_id: product_id}})
        if (product == null) return res.status(404).send({error : "Product not Found!"})

        let info = {
            product_name: req.body.name,
            product_description: req.body.description,
            product_price: parseInt(req.body.price),
            product_discounted_price: parseInt(req.body.discounted_price) || 0,
            product_stock: parseInt(req.body.stock) || 0,
            product_category: req.body.category
        }

        await Product.update(info, {where: {product_id: product_id}})
        let images = req.body.images
        //delete old images
        await Image.destroy({where: {product_id: product.product_id}})
        //add images
        images.forEach(async i => {
            await Image.create({product_id: product.product_id, image_url: i})
        });
        return res.status(200).json({
            success : "Product updated Successfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

const deleteProduct = async (req, res) => {
    try {
        const product_id = req.params.product_id
        if (product_id == null ) throw {message: "No Product ID given"}
        
        let product = await Product.findOne({where: {product_id: product_id}})
        if (product == null) return res.status(404).send({error : "Product not Found!"})

        await Product.destroy({where: {product_id: product_id}})
        return res.status(200).json({
            success: "Product Deleted Succesfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

module.exports = {
    getProducts,
    getProductsByCategory,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}
