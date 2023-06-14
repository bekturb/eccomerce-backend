const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');
const auth = require("../middlewares/auth");

router.post("/", [auth], colorController.create);
router.get("/", colorController.getAll);
router.get("/get-product/:id", colorController.getOne);
router.put("/update/:id", [auth], colorController.update);
router.delete("/delete/:id", [auth], colorController.delete);

module.exports = router;