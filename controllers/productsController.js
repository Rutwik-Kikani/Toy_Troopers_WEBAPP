const productModel = require('../models/productsModel');
const categoryModel = require('../models/categoryModel');

const displayProductsPage = async (req, res) => {

    try {
        const products = await productModel.getAllProducts();
        const categories = await categoryModel.getAllCategories();
        res.render('index', {
            content: 'products_page',
            products: products,
            categories: categories,
        });
    } catch (error) {
        console.error("Error adding category: ", error);
        res.status(500).send('Error adding category');
    }
};

const addNewProduct = async (req, res) => {
    try {
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            categoryId: req.body.categoryId,
            stockQuantity: parseInt(req.body.stockQuantity),
        };
        await productModel.addProduct(productData, req.files);
        res.redirect('/products'); // Redirect to the products listing page
    } catch (error) {
        console.error("Error adding product: ", error);
        res.status(500).send('Error adding product');
    }
};

const updateProduct = async (req, res) => {
    //implement this
};

module.exports = { displayProductsPage, addNewProduct, updateProduct };