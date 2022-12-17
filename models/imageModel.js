module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define("images", {
        image_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },{
        timestamps: false
    })

    return Image
}