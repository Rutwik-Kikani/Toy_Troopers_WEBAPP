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

const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productModel.getProductById(productId);
        res.json(product);
    } catch (error) {
        console.error("Error loading product: ", error);
        res.status(500).send('Error loading product');
    }
};

const addNewProduct = async (req, res) => {
    console.log(req)
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
    try {
        const productId = req.params.productId;
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            categoryId: req.body.categoryId,
            stockQuantity: parseInt(req.body.stockQuantity),
        };

        // Parse the current images and reviews from the request body
        const currentProductImages = JSON.parse(req.body.currentProductImages || '{}');
        const currentReviews = JSON.parse(req.body.currentReviews || '{}');

        // Combine new uploaded images with existing ones
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const imageUrl = await uploadImage(req.files[i], productData.name);
                currentProductImages[`imageUrl${Object.keys(currentProductImages).length + 1}`] = imageUrl;
            }
        }

        productData.images = currentProductImages;
        productData.reviews = currentReviews;

        await productModel.updateProduct(productId, productData);
        res.redirect('/products');
    } catch (error) {
        console.error("Error updating product: ", error);
        res.status(500).send('Error updating product');
    }
};

const deleteImage = async (req, res) => {

    try {
        const { imageUrl, productId } = req.body;

        console.log(`Deleting image for productId: ${productId}, imageUrl: ${imageUrl}`);

        await productModel.deleteImage(productId, imageUrl);
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error("Error deleting image: ", error);
        res.status(500).send('Error deleting image');
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        await productModel.deleteProduct(productId);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Error deleting product: ", error);
        res.status(500).send('Error deleting product');
    }
}

module.exports = { displayProductsPage, addNewProduct, updateProduct, getProductById, deleteImage, deleteProduct };