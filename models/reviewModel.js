const { db } = require('../config/firebase');
const getReviewsByProductId = async (productId) => {
    const reviewsSnapshot = await db.ref('reviews').orderByChild('productId').equalTo(productId).once('value');
    const reviewsData = reviewsSnapshot.val() || {};
    return Object.keys(reviewsData).map(key => ({
        id: key,
        ...reviewsData[key]
    }));
}
module.exports = { getReviewsByProductId };