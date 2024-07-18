const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const categoryController = require('../controllers/categoryController');
const productsController = require('../controllers/productsController');
const productDetailController = require('../controllers/productDetailController');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index.ejs', { content: "Welcome!!" });

});

router.get('/category', categoryController.displayCategoriesPage);
router.post('/category', upload.single('categoryImage'), categoryController.addNewCategory);
router.post('/update-category/:id', upload.single('categoryImage'), categoryController.updateCategory);
router.delete('/delete-category/:id', categoryController.deleteCategory);

router.get('/products', productsController.displayProductsPage);
router.post('/products', upload.array('productImages', 5), productsController.addNewProduct);
router.get('/products/:productId', productsController.getProductById);
router.post('/products/update-product/:productId', upload.array('productImages', 5), productsController.updateProduct);
router.delete('/delete-image', productsController.deleteImage);
router.delete('/delete-product/:productId', productsController.deleteProduct);

router.get('/product-details/:productId', productDetailController.displayProductDetails);
module.exports = router;