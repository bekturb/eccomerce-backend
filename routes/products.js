const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const auth = require("../middlewares/auth");
const seller = require("../middlewares/seller");

router.post("/",  [auth, seller],  ProductController.create);
router.put("/add-sale/:id",  [auth, seller], ProductController.addDiscountPrice);
router.get("/", ProductController.getAll);
router.get("/get-shop-products/:shopId", [auth, seller], ProductController.getShopProducts);
router.get("/get-product/:id", ProductController.getOne);
router.get("/get-product-to-update/:productId", ProductController.getOneForUpdate);
router.put("/update/:id",  [auth, seller], ProductController.update);
router.delete("/delete/:id",  [auth, seller],  ProductController.delete);
router.delete("/delete/multiple-products", [auth, seller], ProductController.deleteMultipleProducts)
router.put("/add-review", [auth], ProductController.createProductReview);
router.get("/:productId/all-reviews", ProductController.getAllReviews);
router.get("/get-personal/wishlist", [auth], ProductController.getPersonalWishList);
router.delete("/:productId/reviews/:reviewId", [auth], ProductController.deleteReview);
router.get("/search/searchData/:key", ProductController.searchProducts);
router.post("/search/search-by-image", ProductController.upload.single('image'), ProductController.searchProductByImage);
router.post("/wishlist", [auth], ProductController.addToWishlist);

module.exports = router;