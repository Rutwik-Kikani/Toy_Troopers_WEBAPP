const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const categoryController = require('../controllers/categoryController');
const productsController = require('../controllers/productsController');

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
//working on it
router.post('/products/update-product/:productId', upload.array('productImages', 5), productsController.updateProduct);


module.exports = router;