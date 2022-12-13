require('dotenv').config();

const pg = require("pg")
const express = require("express");
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)
const app = express();
const bcrypt = require("bcryptjs")
const pgPool = new pg.Pool({
    connectionString: process.env.db_connection_string
})

app.use(session({
    store: new pgSession({
        pool: pgPool,
        tableName: 'session'
    }),
    secret: process.env.cookie_secret,
    resave: false,
    saveUninitialized: false,
}))
app.use(express.urlencoded({extended: true}))


const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    }else{
        res.status(403).send("Forbidden! User unauthenticated")
    }
}

app.post('/login', async (req, res) => {
    var {email, password} = req.body
    try {
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
        password = await bcrypt.hash(password, 12)
        let user = await pgPool.query(`Select * from users where email = '${email}'`)
        if (user.rows.length > 0) return res.status(409).send('User already Exists with this email')

        await pgPool.query(`Insert into users (name, surname, email, password) values ('${name}', '${surname}', '${email}', '${password}')`)
        return res.status(201).send('User Created')
    } catch (error) {
        res.status(500).json(error.message)
    }
})

app.get("/dashboard", isAuth, async (req, res)=> {
    try {
        let user = await pgPool.query(`Select * from users where user_id = '${req.session.user.user_id}'`)
        if (user.rows.length == 0) throw {message: "Error finding user info"}
        return res.status(200).json((({password, user_id, ...u}) => u)(user.rows[0]))
    } catch (error) {
        res.status(500).json(error.message)
    }
})

app.get("/", async (req, res)=> {
    res.send("Hello")
})

app.listen(5000, console.log("Server is ready on port 5000"))