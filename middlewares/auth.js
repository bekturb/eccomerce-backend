require("dotenv").config()
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
    const token = req.header("x-auth-token");
    if (!token)
        return res.status(401).send("Token doesn\'t exist");
    try{
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        req.user = decoded;
        next();
    }catch (err){
        return res.status(400).send("Unexpected Token");
    }
}