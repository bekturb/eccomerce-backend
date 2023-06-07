const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/register", userController.register);
router.get("/me", [auth], userController.getMe);
router.post("/verify", userController.verify);
router.get("/:id", userController.getSingle);
router.get("/", [auth, admin], userController.getAll);
router.put("/update/profile", [auth], userController.updateProfile);
router.put("/update/password", [auth], userController.changePassword);
router.put("/:id/update/role", [auth, admin], userController.updateRole);
router.put("/change-password", userController.resetPassword);

module.exports = router;