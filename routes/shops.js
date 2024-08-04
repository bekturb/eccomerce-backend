const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require("../middlewares/auth");
const seller = require("../middlewares/seller");
const admin = require("../middlewares/admin");

router.post("/register", shopController.register);
router.get("/me", [auth, seller], shopController.getMe);
router.post("/:id/verify", shopController.verify);
router.get("/:id/resend-otp", shopController.resendOtp);
router.get("/get-user/:id", [auth], shopController.getSingle);
router.get("/add-follower", [auth], shopController.addFollower);
router.get("/get-all", [auth, admin], shopController.getAll);
router.put("/block-user/:id", [auth, admin], shopController.blockUser);
router.put("/unblock-user/:id", [auth, admin], shopController.unBlockUser);
router.put("/update/profile", [auth, seller], shopController.updateProfile);
router.put("/update/profile-avatar", [auth, seller], shopController.updateProfileAvatar);
router.put("/update/password", [auth, seller], shopController.changePassword);
router.put("/change-password", shopController.resetPassword);
router.post("/post-email/to-reset-password", shopController.postEmail);
router.post("/verify-otp/to-reset-password", shopController.verify);
router.put("/update-payment-methods", [auth, seller], shopController.updatePayment);
router.delete("/delete-withdraw-method", [auth, seller], shopController.deletePaymentMethod);

module.exports = router;