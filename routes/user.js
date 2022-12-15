require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const bcrypt = require("bcryptjs")
const server = require('../server')
const {isAuth, isAuthAdmin} = require('../helpers/isAuth')

app.get('/info', isAuth, async (req, res) => {
    try {
        const pgPool = server.pgPool
        let user = await pgPool.query(`Select * from users where user_id = '${req.session.user.user_id}'`)
        if (user.rows.length == 0) throw {message: "Error finding user info"}
        user = user.rows[0]
        if (user.gender) user.gender = 'Female'
        else user.gender = 'Male'
        return res.status(200).json((({password, user_id, ...u}) => u)(user))
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.patch('/info', isAuth, async (req, res) => {
    var {name, surname, email, gender, birthday} = req.body
    if (name == undefined || surname == undefined || gender == undefined || birthday == undefined) return res.status(500).json({error: "Impartial Data"})
    try {
        const pgPool = server.pgPool
        let user = await pgPool.query(`Select * from users where user_id = ${req.session.user.user_id}`)
        if (user.rows.length == 0) return res.status(404).json({error: "User not found"})

        if (gender == 'Male') gender = false
        else if (gender == 'Female') gender = true
        else gender = null
        await pgPool.query(`Update users
                            Set name='${name}', surname='${surname}', email='${email}', gender=${gender}, birthday='${birthday}'
                            Where user_id=${req.session.user.user_id}`)
        return res.status(200).json({success: "User Updated Succesfully"})
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.patch('/password', isAuth, async (req, res) => {
    var {password} = req.body
    if (password == undefined) return res.status(500).json({error: "Impartial Data"})
    try {
        const pgPool = server.pgPool
        let user = await pgPool.query(`Select * from users where user_id = ${req.session.user.user_id}`)
        if (user.rows.length == 0) return res.status(404).json({error: "User not found"})

        password = await bcrypt.hash(password, 12)
        await pgPool.query(`Update users
                            Set password='${password}'
                            Where user_id=${req.session.user.user_id}`)
        return res.status(200).json({
            success: 'Password Updated Successfully'
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

// ADMIN OPERATIONS

app.get('/all', isAuthAdmin, async (req, res) => {
    try {
        const pgPool = server.pgPool
        let users = await pgPool.query(`Select * from users`)
        if (users.rows.length == 0) throw {message: "Error finding users"}
        return res.status(200).json(users.rows)
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})

app.post('/create', isAuthAdmin, async (req, res) => {
    var {name, surname, email, password, type} = req.body
    if (name == undefined || surname == undefined || email == undefined || password == undefined || type == undefined) return res.status(500).json({error : "Impartial Data"})
    try {
        const pgPool = server.pgPool
        let user = await pgPool.query(`Select * from users where email = '${email}'`)
        if (user.rows.length > 0) return res.status(409).json({error: 'User already Exists with this email'})

        password = await bcrypt.hash(password, 12)
        
        await pgPool.query(`Insert into users (name, surname, email, password, type) values ('${name}', '${surname}', '${email}', '${password}', '${type}')`)
        return res.status(201).json({
            success: 'User Created'
        })
    } catch (error) {
        res.status(500).json({error : error.message})
    }
})
