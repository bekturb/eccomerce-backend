const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const auth = require("../middlewares/auth");

router.post("/", [auth], ProductController.create);
router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getOne);
router.put("/:id", [auth], ProductController.update);
router.delete("/:id", [auth], ProductController.delete);

module.exports = router;