const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/couponController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/", [auth, admin], CouponController.create);
router.get("/get-all", [auth, admin], CouponController.getAll);
router.put("/update/:id", [auth, admin], CouponController.update);
router.delete("/delete/:id", [auth, admin], CouponController.delete);

module.exports = router;