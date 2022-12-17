const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("users", {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        user_name: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        user_surname: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        user_email : {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        user_password : {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        user_gender : {
            type: DataTypes.STRING(15)
        },
        user_birthday : {
            type: DataTypes.DATE
        },
        user_type : {
            type: DataTypes.STRING(15),
            defaultValue: 'user'
        }
    },{
        timestamps: true
    })

    return User
}