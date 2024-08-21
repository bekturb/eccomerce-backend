const {Shop} = require("../models/shop");

module.exports = async function admin(req, res, next) {

    let shop = await Shop.findById(req.user._id);
    if (!shop)
        return res.status(400).send('Seller not Found');

    const seller = shop.role === "Seller";

    if (!seller)
        return res.status(403).send("Access denied");
    next();
}