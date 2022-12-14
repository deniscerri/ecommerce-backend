require('dotenv').config();
const express = require("express")
const bcrypt = require("bcryptjs")
const app = module.exports = express();
const isAuth = require("../helpers/isAuth")
const server = require('../server')


app.post('/login', async (req, res) => {
    var {email, password} = req.body
    try {
        const pgPool = server.pgPool
        let user = await pgPool.query(`Select * from users where email = '${email}'`)
        if (user.rows.length == 0) return res.status(404).send("User not found")
        user = user.rows[0]

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) return res.status(403).send('Wrong Password')
        req.session.isAuth = true
        req.session.user = (({password, ...u}) => u)(user) //remove password from the object
        return res.status(200).send('Welcome')
    } catch (error) {
        res.status(500).json(error.message)
    }
})

app.post('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send(err.message)
        res.status(200).send("Logged Out")
    })
})

app.post("/register", async (req, res)=>{
    var {name, surname, email, password} = req.body
    if (name == undefined || surname == undefined || email == undefined || password == undefined) return res.status(500).send("Impartial Data")
    try {
        const pgPool = server.pgPool
        password = await bcrypt.hash(password, 12)
        let user = await pgPool.query(`Select * from users where email = '${email}'`)
        if (user.rows.length > 0) return res.status(409).send('User already Exists with this email')

        await pgPool.query(`Insert into users (name, surname, email, password) values ('${name}', '${surname}', '${email}', '${password}')`)
        return res.status(201).send('User Created')
    } catch (error) {
        res.status(500).json(error.message)
    }
})