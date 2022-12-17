const db = require('../models')
const User = db.users
const bcrypt = require("bcryptjs")

const login = async (req, res) => {
    try {
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });

        let user = await User.findOne({where: {user_email: req.body.email}})
        if (user == null) return res.status(404).json({error: "User not found"})
        user = user.dataValues
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.user_password)
        if (!isPasswordMatch) return res.status(403).json({error: 'Wrong Password'})
        req.session.isAuth = true
        if (user.user_type == 'admin') req.session.isAdmin = true
        req.session.user = (({user_password, ...u}) => u)(user) //remove password from the object
        return res.status(200).json({
            success: 'Welcome',
            user: req.session.user
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send(err.message)
        res.status(200).json({
            success: "Logged Out"
        })
    })
}

const register = async (req, res) => {
    try {
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });

        let user = await User.findOne({where: {user_email: req.body.email}})
        if (user != null) return res.status(409).json({error: 'User already Exists with this email'})

        password = await bcrypt.hash(req.body.password, 12)

        let info = {
            user_name: req.body.name,
            user_surname: req.body.surname,
            user_email: req.body.email,
            user_password: password,
        }

        user = await User.create(info)
        return res.status(201).json({
            success: "User created",
            user
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}


module.exports = {
    login,
    logout,
    register,

}