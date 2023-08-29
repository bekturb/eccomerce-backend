const express = require('express');
const router = express.Router();
const PageController = require('../controllers/pageController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/create", [auth, admin], PageController.create);
// router.get("/", PageController.getAll);
// router.get("/get-product/:id", PageController.getOne);
// router.put("/update/:id", [auth], PageController.update);
// router.delete("/delete/:id", [auth], PageController.delete);

module.exports = router;