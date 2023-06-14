const express = require('express');
const router = express.Router();
const EventsController = require('../controllers/eventController');
const auth = require("../middlewares/auth");

router.post("/", [auth], EventsController.create);
router.get("/", EventsController.getAll);
router.get("/get-product/:id", EventsController.getOne);
router.put("/update/:id", [auth], EventsController.update);
router.delete("/delete/:id", [auth], EventsController.delete);

module.exports = router;