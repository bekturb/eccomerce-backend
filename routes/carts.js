const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const auth = require("../middlewares/auth");

router.post("/", [auth], CartController.create);
router.get("/", [auth], CartController.getAll);
router.get("/:id", [auth], CartController.getOne);
router.delete("/:id", [auth], CartController.delete);

module.exports = router;