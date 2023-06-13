const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/register", userController.register);
router.get("/me", [auth], userController.getMe);
router.post("/verify", userController.verify);
router.get("/get-user/:id", [auth, admin], userController.getSingle);
router.get("/", [auth, admin], userController.getAll);
router.put("/block-user/:id", [auth, admin], userController.blockUser);
router.put("/unblock-user/:id", [auth, admin], userController.unBlockUser);
router.put("/update/profile", [auth], userController.updateProfile);
router.put("/update/password", [auth], userController.changePassword);
router.put("/:id/update/role", [auth, admin], userController.updateRole);
router.put("/change-password", userController.resetPassword);
router.put("/update-user-addresses", [auth], userController.updateAddresses);
router.delete("/delete-user-address/:id", [auth], userController.deleteUserAddress);

module.exports = router;