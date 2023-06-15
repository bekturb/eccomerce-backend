const express = require('express');
const router = express.Router();
const withdrawController = require('../controllers/withdrawController');
const auth = require("../middlewares/auth");
const seller = require("../middlewares/seller");
const admin = require("../middlewares/admin");

router.post("/create", [auth, seller], withdrawController.create);
router.get("/get-all", [auth, admin], withdrawController.getAll);
router.put("/update-withdraw-request/:id", [auth, admin], withdrawController.update);

module.exports = router;