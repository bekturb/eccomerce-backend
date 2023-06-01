const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/imagesController');
const upload = require("../middlewares/multer");

router.post("/images", upload.array("images"), PhotoController.create);
router.post("/single-image", upload.single("image"), PhotoController.uploadSingleImage);
module.exports = router;