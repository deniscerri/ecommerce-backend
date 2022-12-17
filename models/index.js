const dbConfig = require('../config/dbConfig')
const {Sequelize, DataTypes} = require('sequelize')

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        logging: false
    }
)

sequelize.authenticate()
.then(()=> {
    console.log('Connected to DB!')
})
.catch(err => {
    console.log(err.message)
})

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

db.images = require('./imageModel')(sequelize, DataTypes)
db.products = require('./productModel')(sequelize, DataTypes)
db.addresses = require('./addressModel')(sequelize, DataTypes)
db.users = require('./userModel')(sequelize, DataTypes)
db.orders = require('./orderModel')(sequelize, DataTypes)

//user has many addresses
db.users.hasMany(db.addresses, {
    foreignKey: 'user_id',
    as: 'addresses'
})
db.addresses.belongsTo(db.users, {
    foreignKey: 'user_id',
    as: 'user'
})

//user has many orders
db.users.hasMany(db.orders, {
    foreignKey: "user_id",
    as: 'orders'
})

//order and product many to many relationship
db.orders.belongsToMany(db.products, {
    through: 'product_order',
    as: 'products',
    foreignKey: 'order_id'
})

db.products.belongsToMany(db.orders, {
    through: 'product_order',
    as: 'orders',
    foreignKey: 'product_id'
})

//order has one address
db.orders.belongsTo(db.addresses, {
    foreignKey: "address_id"
})

//product has many images
db.products.hasMany(db.images, {
    foreignKey: 'product_id',
    as: 'images'
})
db.images.belongsTo(db.products, {
    foreignKey: 'product_id',
    as: 'product'
})

db.sequelize.sync({force: false})
.then(() => {
    console.log('DB Synced!')
})
.catch(err => {
    console.log(err)
})

module.exports = db