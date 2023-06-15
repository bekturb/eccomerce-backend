const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const seller = require("../middlewares/seller");

router.post("/", orderController.create);
router.get("/get-all-orders/:userId", orderController.getAll);
router.get("/get-seller-all-orders/:shopId", orderController.getSellerOrders);
router.put("/update-order-status/:id", [auth, seller], orderController.updateStatus);
// router.get("/get-product/:id", orderController.getOne);
// router.put("/update/:id", [auth], orderController.update);
// router.delete("/delete/:id", [auth], orderController.delete);

module.exports = router;