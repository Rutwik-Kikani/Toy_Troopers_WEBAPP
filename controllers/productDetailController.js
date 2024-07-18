const productModel = require('../models/productsModel');
const categoryModel = require('../models/categoryModel');
const userModel = require('../models/userModel');
const reviewModel = require("../models/reviewModel");

const displayProductDetails = async (req, res) => {
    try {
        const productId = req.params.productId;

        const productData = await productModel.getProductById(productId);
        const categoryName = await categoryModel.getCategoryNameById(productData.categoryId);
        productData.categoryName = categoryName;

        // will be an array of the reviews where productId = is given productId
        const reviews = await reviewModel.getReviewsByProductId(productId);
        // array of the useIds associated with the reviews 
        const userIds = reviews.map(review => review.userId);
        //object with the key as userId and value as username for example {'userId1': 'user1', 'userId2': 'rutwik'}
        const userNames = await userModel.getUserNamesByIds(userIds);

        reviews.forEach(review => {
            review.userName = userNames[review.userId];
        });



        res.render('index.ejs', {
            content: 'product_details_page',
            product: productData,
            reviews: reviews
        });
    } catch (error) {
        console.error("Error fetching product details: ", error);
        res.status(500).send('Error fetching product details');
    }
};

module.exports = { displayProductDetails };