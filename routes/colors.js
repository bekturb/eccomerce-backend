const express = require('express');
const router = express.Router();
const ColorController = require('../controllers/colorController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/", [auth, admin], ColorController.create);
router.get("/all", ColorController.getColors);
router.get("/:slug", ColorController.getColor);
router.put("/:id", [auth, admin], ColorController.updateColor);

module.exports = router;