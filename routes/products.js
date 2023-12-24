const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const auth = require("../middlewares/auth");

router.post("/", [auth], ProductController.create);
router.put("/add-sale/:id", [auth], ProductController.addDiscountPrice);
router.get("/", ProductController.getAll);
router.get("/get-product/:id", ProductController.getOne);
router.put("/update/:id", [auth], ProductController.update);
router.delete("/delete/:id", [auth], ProductController.delete);
router.put("/add-review", [auth], ProductController.createProductReview);
router.get("/:productId/all-reviews", ProductController.getAllReviews);
router.get("/get-personal/wishlist", [auth], ProductController.getPersonalWishList);
router.delete("/:productId/reviews/:reviewId", [auth], ProductController.deleteReview);
router.delete("/search/:searchQuery", [auth], ProductController.searchProducts);
router.post("/wishlist", [auth], ProductController.addToWishlist);

module.exports = router;