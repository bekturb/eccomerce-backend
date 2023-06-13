const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/register", shopController.register);
// router.get("/me", [auth], shopController.getMe);
router.post("/verify", shopController.verify);
// router.get("/get-user/:id", shopController.getSingle);
// router.get("/", [auth, admin], shopController.getAll);
// router.put("/block-user/:id", [auth, admin], shopController.blockUser);
// router.put("/unblock-user/:id", [auth, admin], shopController.unBlockUser);
// router.put("/update/profile", [auth], shopController.updateProfile);
// router.put("/update/password", [auth], shopController.changePassword);
// router.put("/:id/update/role", [auth, admin], shopController.updateRole);
// router.put("/change-password", shopController.resetPassword);
// router.put("/update-user-addresses", [auth], shopController.updateAddresses);
// router.put("/delete-user-address/:id", [auth], shopController.deleteUserAddress);

module.exports = router;