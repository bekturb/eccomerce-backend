const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/couponController');
const auth = require("../middlewares/auth");
const seller = require("../middlewares/seller");

router.post("/", [auth, seller], CouponController.create);
router.get("/get-all", [auth, seller], CouponController.getAll);
router.get("/get-all-shop-coupons", [auth, seller], CouponController.getShopCoupons);
router.get("/get-single-coupon/:couponId", [auth, seller], CouponController.getOne);
router.get("/get-coupon-value/:name", [auth], CouponController.getCouponValue);
router.delete("/delete/:id", [auth, seller], CouponController.delete);

module.exports = router;