const db = require('../models')
const User = db.users
const bcrypt = require("bcryptjs")
const Op = db.Sequelize.Op
const {getPagination, getPagingData} = require("../helpers/pagination")


const getUserInfo = async (req, res) => {
    try{
        let id = req.session.user.user_id
        let user = await User.findOne({where: {user_id: id}})
        if(user == null) throw {message : "Error finding user info"}
        return res.status(200).json((({user_password, user_id, ...u}) => u)(user.dataValues))
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

const updateUserInfo = async (req, res) => {
    try{
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });

        let id = req.session.user.user_id
        let user = await User.findOne({where: {user_id: id}})
        if(user == null) throw {message : "Error finding user info"}

        let info = {
            user_name: req.body.name,
            user_surname: req.body.surname,
            user_email: req.body.email,
            user_gender: req.body.gender,
            user_birthday: req.body.birthday
        }
        
        await User.update(info, {where: {user_id: id}})
        res.status(200).json({
            success: "User Info Updated"
        })
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

const updateUserPassword = async (req, res) => {
    try{
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });

        let id = req.session.user.user_id
        let user = await User.findOne({where: {user_id: id}})
        if(user == null) throw {message : "Error finding user info"}
        
        const password = await bcrypt.hash(req.body.password, 12)

        let info = { user_password: password }

        user = await User.update(info, {where: {user_id: id}})
        res.status(200).json({
            success: "Password Updated"
        })
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

// ADMIN OPERATIONS

const getAllUsers = async (req, res) => {
    try{
        let {search_query, page, size, sort_by, order} = req.query
        if(!sort_by) sort_by = 'updatedAt'
        if(!order) order = 'DESC'

        let where_clause = {}
        if(search_query){
            search_query = `%${search_query}%`
            where_clause = {
                [Op.or] : [
                    { user_name: {[Op.substring]: search_query}}, { user_name: {[Op.iLike]: search_query}},
                    { user_email: {[Op.substring]: search_query}}, { user_email: {[Op.iLike]: search_query}},
                    { user_surname: {[Op.substring]: search_query}}, { user_surname: {[Op.iLike]: search_query}},
                ]
            }
        }

        let {limit, offset} = getPagination(page, size)
        let users = await User.findAndCountAll({
            order: [[sort_by, order]],
            limit,
            offset,
            where: where_clause,
            distinct: true
        }).then(u => {
            const data = getPagingData(u, page, limit)
            return data
        })
        if(users == null) throw {message : "Error fetching users"}
        if(users.currentPage > users.totalPages) 
            return res.status(404).json({
                error: `Page Index Out of Bounds. Page Nr Provided: ${users.currentPage}, Total Pages: ${users.totalPages}`
            })
        return res.status(200).json(users)
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

const createUser = async (req, res) => {
    try{
        Object.entries(req.body).forEach(el => {
            if(el[1] == null) throw {message: "Impartial Data"}
        });

        let checkExistingUser = await User.findOne({where: {user_email: req.body.email}})
        if (checkExistingUser != null) return res.status(409).json({error: 'User already Exists with this email'})

        const password = await bcrypt.hash(req.body.password, 12)

        let info = {
            user_name: req.body.name,
            user_surname: req.body.surname,
            user_email: req.body.email,
            user_password: password,
            user_type: req.body.type 
        }

        let user = await User.create(info)
        return res.status(201).json({
            success: "User created",
            user
        })
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

module.exports = {
    getUserInfo,
    updateUserInfo,
    updateUserPassword,
    getAllUsers,
    createUser
}