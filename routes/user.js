require('dotenv').config();
const express = require("express");
const app = module.exports = express();
const bcrypt = require("bcryptjs")
const server = require('../server')
const isAuth = require('../helpers/isAuth')

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
        res.status(500).json(error.message)
    }
})

app.patch('/updateinfo', isAuth, async (req, res) => {
    var {name, surname, email, gender, birthday} = req.body
    if (name == undefined || surname == undefined || gender == undefined || birthday == undefined) return res.status(500).send("Impartial Data")
    try {
        const pgPool = server.pgPool
        let user = await pgPool.query(`Select * from users where user_id = ${req.session.user.user_id}`)
        if (user.rows.length == 0) return res.status(404).send("User not found")

        if (gender == 'Male') gender = false
        else if (gender == 'Female') gender = true
        else gender = null
        let updatedUser = await pgPool.query(`Update users
                            Set name='${name}', surname='${surname}', email='${email}', gender=${gender}, birthday='${birthday}'
                            Where user_id=${req.session.user.user_id}`)
        return res.status(200).send("User Updated Succesfully")
    } catch (error) {
        res.status(500).json(error.message)
    }
})

app.patch('/updatepassword', isAuth, async (req, res) => {
    var {password} = req.body
    if (password == undefined) return res.status(500).send("Impartial Data")
    try {
        const pgPool = server.pgPool
        let user = await pgPool.query(`Select * from users where user_id = ${req.session.user.user_id}`)
        if (user.rows.length == 0) return res.status(404).send("User not found")

        password = await bcrypt.hash(password, 12)
        await pgPool.query(`Update users
                            Set password='${password}'
                            Where user_id=${req.session.user.user_id}`)
        return res.status(200).send('Password Updated Successfully')
    } catch (error) {
        res.status(500).json(error.message)
    }
})
