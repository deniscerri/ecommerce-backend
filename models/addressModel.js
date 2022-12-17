const {sequelize} = require(".");

module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define("addresses", {
        address_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        address_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address_surname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address_email : {
            type: DataTypes.STRING,
            allowNull: false
        },
        address_country : {
            type: DataTypes.STRING,
            allowNull: false
        },
        address_city : {
            type: DataTypes.STRING
        },
        address_line1 : {
            type: DataTypes.STRING,
            allowNull: false
        },
        address_line2 : {
            type: DataTypes.STRING
        },
        address_phone : {
            type: DataTypes.STRING,
            allowNull: false
        }
    },{
        timestamps: true
    })

    return Address
}