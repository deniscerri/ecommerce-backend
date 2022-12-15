const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    }else{
        res.status(403).send({error: "Forbidden"})
    }
}

const isAuthAdmin = (req, res, next) => {
    if(req.session.isAdmin){
        next()
    }else{
        res.status(403).send({error: "Forbidden"})
    }
}

module.exports = {isAuth,isAuthAdmin}