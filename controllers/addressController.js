const db = require('../models')
const Address = db.addresses

const getUserAddresses = async (req, res) => {
    try {
        let addresses = await Address.findAll({where: {user_id: req.session.user.user_id}})
        if (addresses == null) addresses = []
        return res.status(200).json(addresses)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

const createAddress = async (req, res) => {
    try{
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });

        let info = {
            address_name: req.body.name,
            address_surname: req.body.surname,
            address_email: req.body.email,
            address_country: req.body.country,
            address_city: req.body.city,
            address_line1: req.body.line1,
            address_line2: req.body.line2,
            address_phone: req.body.phone,
            user_id: req.session.user.user_id
        }
        
        let address = await Address.create(info)
        return res.status(201).json({
            success: "Address created",
            address
        })
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

const updateAddress = async (req, res) => {
    try {
        const address_id = req.params.address_id
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });
        if (address_id == null) throw {message: "No address ID given"}

        let address = await Address.findOne({where: {address_id: address_id, user_id: req.session.user.user_id}})
        if (address == null) return res.status(404).send({error : "Address not Found!"})

        let info = {
            address_name: req.body.name,
            address_surname: req.body.surname,
            address_email: req.body.email,
            address_country: req.body.country,
            address_city: req.body.city,
            address_line1: req.body.line1,
            address_line2: req.body.line2,
            address_phone: req.body.phone
        }

        await Address.update(info, {where: {address_id: address_id}})
        return res.status(200).json({
            success : "Address updated Successfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

const deleteAddress = async (req, res) => {
    try {
        const address_id = req.params.address_id
        if (address_id == null ) throw {message: "No address ID given"}
        
        let address = await Address.findOne({where: {address_id: address_id, user_id: req.session.user.user_id}})
        if (address == null) return res.status(404).send({error : "Address not Found!"})

        await Address.destroy({where: {address_id: address_id}})
        return res.status(200).json({
            success: "Address Deleted Succesfully"
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

module.exports = {
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress
}
