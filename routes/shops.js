const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require("../middlewares/auth");
const seller = require("../middlewares/seller");
const admin = require("../middlewares/admin");

router.post("/register", shopController.register);
router.get("/me", [auth], shopController.getMe);
router.post("/verify", shopController.verify);
router.get("/get-user/:id", [auth], shopController.getSingle);
router.get("/get-all", [auth, admin], shopController.getAll);
router.put("/block-user/:id", [auth, admin], shopController.blockUser);
router.put("/unblock-user/:id", [auth, admin], shopController.unBlockUser);
router.put("/update/profile", [auth, seller], shopController.updateProfile);
router.put("/update/password", [auth, seller], shopController.changePassword);
router.put("/change-password", shopController.resetPassword);

module.exports = router;