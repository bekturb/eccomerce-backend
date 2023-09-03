const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/brandController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/", [auth, admin], BrandController.create);
router.get("/", BrandController.getBrands);
router.put("/:id", BrandController.updateBrand);

module.exports = router;