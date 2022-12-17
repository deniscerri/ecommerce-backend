const {sequelize} = require(".");

module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define("products", {
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        product_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        product_description: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        product_price : {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        product_discounted_price : {
            type: DataTypes.BIGINT
        },
        product_stock : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_category : {
            type: DataTypes.STRING(30),
            allowNull: false
        }
    },{
        timestamps: true
    })

    return Product
}