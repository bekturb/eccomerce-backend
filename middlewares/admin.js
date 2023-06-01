const {User} = require("../models/user");
module.exports = async function admin(req, res, next) {

    let user = await User.findById(req.user._id);
    if (!user)
        return res.status(400).send('User not Found');

    const admin = user.role === "admin";

    if (!admin)
        return res.status(403).send("Access denied");
    next();
}