const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const categoryController = require('../controllers/categoryController');
const productsController = require('../controllers/productsController');
const productDetailController = require('../controllers/productDetailController');
const cartController = require('../controllers/cartController');
const { checkAuth, checkAdmin, checkCustomer, login, logout } = require('../controllers/authController');


const router = express.Router();


router.get('/', checkAuth, (req, res) => {
    res.render('index', { content: 'Welcome!!', user: req.session.user });
});

router.get('/login', (req, res) => {
    res.render('index', { content: 'login_page', user: null });
});
router.get('/logout', logout);
router.post('/login', login);

router.get('/category', checkAuth, checkAdmin, categoryController.displayCategoriesPage);
router.post('/category', checkAuth, checkAdmin, upload.single('categoryImage'), categoryController.addNewCategory);
router.post('/update-category/:id', checkAuth, checkAdmin, upload.single('categoryImage'), categoryController.updateCategory);
router.delete('/delete-category/:id', checkAuth, checkAdmin, categoryController.deleteCategory);

router.get('/products', checkAuth, productsController.displayAdminProductsPage);
router.post('/products', checkAuth, checkAdmin, upload.array('productImages', 5), productsController.addNewProduct);
router.get('/products/:productId', checkAuth, productsController.getProductById);
router.post('/products/update-product/:productId', checkAuth, checkAdmin, upload.array('productImages', 5), productsController.updateProduct);
router.delete('/delete-image', checkAuth, checkAdmin, productsController.deleteImage);
router.delete('/delete-product/:productId', checkAuth, checkAdmin, productsController.deleteProduct);

router.get('/product-details/:productId', checkAuth, productDetailController.displayProductDetails);

// New route for customer products
router.get('/customer-products', checkAuth, checkCustomer, productsController.displayCustomerProductsPage);
router.post('/customer-products', checkAuth, checkCustomer, productsController.filterProducts);


router.get('/my-cart', checkAuth, cartController.displayCartPage);
router.post('/add-to-cart', checkAuth, cartController.addToCart);
router.post('/update-cart-quantity', checkAuth, cartController.updateCartQuantity);
router.post('/remove-from-cart', checkAuth, cartController.removeFromCart);
module.exports = router;