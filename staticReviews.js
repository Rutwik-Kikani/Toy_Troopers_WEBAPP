const { db } = require('./config/firebase');

function generateFirebaseKey() {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

function getRandomRating() {
    return Math.floor(Math.random() * 5) + 1; // Generates a rating between 1 and 5
}

function getRandomComment() {
    const comments = [
        "Excellent product!",
        "Not worth the price.",
        "Highly recommend!",
        "Average quality.",
        "Will buy again.",
        "Superb craftsmanship.",
        "Could be better.",
        "Loved it!",
        "Just okay.",
        "Best purchase ever!"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
}

function getRandomProductId(productIds) {
    return productIds[Math.floor(Math.random() * productIds.length)];
}

function generateReviewData() {
    const reviews = {};
    const productIds = ["productId1", "productId2", "productId3", "productId4"];

    for (let i = 0; i < 20; i++) {
        const reviewId = generateFirebaseKey();
        reviews[reviewId] = {
            comment: getRandomComment(),
            productId: getRandomProductId(productIds), // Randomly pick a product ID from productId1 to productId4
            rating: getRandomRating(),
            userId: generateFirebaseKey()
        };
    }

    return reviews;
}

async function setReviewsInFirebase() {
    const reviews = generateReviewData();
    const reviewsRef = db.ref('reviews');

    // Set reviews in Firebase
    await reviewsRef.set(reviews, (error) => {
        if (error) {
            console.error('Error setting reviews data in Firebase: ', error);
        } else {
            console.log('Reviews data has been set in Firebase');
        }
    });

    // Update products node with review IDs
    const productUpdates = {};
    for (const [reviewId, reviewData] of Object.entries(reviews)) {
        const productId = reviewData.productId;
        if (!productUpdates[productId]) {
            productUpdates[productId] = {};
        }
        productUpdates[productId][reviewId] = true;
    }

    // Retrieve existing products
    const productsRef = db.ref('products');
    const productsSnapshot = await productsRef.once('value');
    const products = productsSnapshot.val() || {};

    // Update products with new reviews
    for (const [productId, reviews] of Object.entries(productUpdates)) {
        const productRef = db.ref(`products/${productId}`);
        await productRef.child('reviews').update(reviews, (error) => {
            if (error) {
                console.error(`Error updating reviews for product ${productId}: `, error);
            } else {
                console.log(`Reviews for product ${productId} have been updated`);
            }
        });
    }
}

setReviewsInFirebase();
