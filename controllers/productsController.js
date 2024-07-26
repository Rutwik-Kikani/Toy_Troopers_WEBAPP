const productModel = require('../models/productsModel');
const categoryModel = require('../models/categoryModel');

const displayProductsPage = async (req, res, contentType) => {

    try {
        const products = await productModel.getAllProducts();
        const categories = await categoryModel.getAllCategories();
        res.render('index', {
            content: contentType,
            products: products,
            categories: categories,
            user: req.session.user,
            filter: {},
        });
    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).send('Error fetching data');
    }
};
const displayAdminProductsPage = (req, res) => displayProductsPage(req, res, 'products_page');
const displayCustomerProductsPage = (req, res) => displayProductsPage(req, res, 'customer_products_page');

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
                const imageUrl = await productModel.uploadImage(req.files[i], productData.name);
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

const filterProducts = async (req, res) => {
    try {
        const { categoryId, priceRange, rating } = req.body;
        const [minPrice, maxPrice] = priceRange ? priceRange.split('-').map(Number) : [0, Infinity];
        const minRating = rating ? Number(rating) : 0;

        const filteredProducts = await productModel.filterProducts(categoryId, minPrice, maxPrice, minRating);

        res.render('index', {
            content: 'customer_products_page',
            products: filteredProducts,
            categories: await categoryModel.getAllCategories(),
            user: req.session.user,
            filter: { categoryId, priceRange, rating },
        });
    } catch (error) {
        console.error("Error filtering products: ", error);
        res.status(500).send('Error filtering products');
    }
};


module.exports = { filterProducts, displayAdminProductsPage, displayCustomerProductsPage, addNewProduct, updateProduct, getProductById, deleteImage, deleteProduct };