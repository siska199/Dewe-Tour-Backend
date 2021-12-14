//Import package that required
const jwt = require('jsonwebtoken')

exports.auth = (req, res, next)=>{
    //Request Header from token that user's have:
    const autoHeader = req.header('Authorization')
    const token = autoHeader && autoHeader.split(' ')[1]
    //Cek token exist or not
    if(!token){
        return res.status(401).send({
            message: 'Access denied'
        })
    }
    try {
        const verified = jwt.verify(token,process.env.TOKEN_USER)
        req.user = verified
        next()
    } catch (error) {
        res.status(400).send({
            message: 'Invalid token'
        })
    }
}

