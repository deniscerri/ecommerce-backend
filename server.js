require('dotenv').config();

const express = require("express");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000
const pg = require("pg")
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)

const user = require('./routes/user')
const auth = require('./routes/auth')


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
app.use(cors())
app.use('/user', user)
app.use('/auth', auth)

app.get('/', (req, res)=>{
    res.json("Hi")
})

exports.pgPool = pgPool

app.listen(port, console.log(`Server is ready on port ${port}`))