const db = require('../models')
const Product = db.products

const getNewProducts = async (req, res) => {
    try {
        let products = await Product.findAll({limit: 50, order: [['updatedAt', 'DESC']]})
        if (products == null) products = []
        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

const getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category
        if (category == null) throw {message: "Category not given"}

        let products = await Product.findAll({where: {product_category: category}, order: [['updatedAt', 'DESC']]})
        if (products == null) products = []
        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({error : error.message})
    }

}

const getProductById = async (req, res) => {
    try {
        const product_id = req.params.product_id
        if (product_id == null) throw {message: "Product ID not given"}

        let product = await Product.findOne({where: {product_id: product_id}})
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
        return res.status(201).json({
            success: "Product created",
            product
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
    getNewProducts,
    getProductsByCategory,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}
