const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/", [auth, admin], CategoryController.create);
router.get("/", CategoryController.getCategories);
router.get("/:slug", CategoryController.getCategory);
router.put("/:id", CategoryController.update);

module.exports = router;