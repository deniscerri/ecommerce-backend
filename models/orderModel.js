module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define("orders", {
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        order_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        order_shipping_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        order_status : {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'Processing'
        }
    },{
        timestamps: true
    })

    return Order
}