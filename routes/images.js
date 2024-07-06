const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/imagesController');
const { uploadPhoto, productImgResize } = require("../middlewares/multer");
const auth = require("../middlewares/auth");

router.post("/images", uploadPhoto.array("images"), productImgResize, PhotoController.create);
router.delete("/delete-images/:id", [auth], PhotoController.deleteImages);
router.post("/single-image", uploadPhoto.single("image"), productImgResize, PhotoController.uploadSingleImage);
router.delete("/single-image/:id", PhotoController.deleteImage);
module.exports = router;