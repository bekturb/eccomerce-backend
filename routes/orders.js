const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const seller = require("../middlewares/seller");

router.post("/create-order", orderController.create);
router.get("/get-all-orders/:userId", orderController.getAll);
router.get("/get-seller-all-orders/:shopId", orderController.getSellerOrders);
router.put("/update-order-status/:id", [auth, seller], orderController.updateStatus);
router.put("/order-refund/:id", [auth], orderController.orderRefund);
router.put("/order-refund-success/:id", [auth, seller], orderController.orderRefundSuccess);
router.get("/admin-all-orders", [auth, admin], orderController.getAllAdminOrders);

module.exports = router;