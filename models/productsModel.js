const { db, storage } = require("../config/firebase");
const { getAbbreviation } = require('../controllers/utils');
// Helper function to upload an image and return its signed URL
const uploadImage = async (imageFile, name) => {
    const abbreviation = getAbbreviation(name);
    const timestamp = Date.now();
    const fileName = `${abbreviation}_${timestamp}`;
    const fileRef = storage.bucket().file(`product_image/${fileName}`);
    await fileRef.save(imageFile.buffer, { contentType: 'image/jpeg' });
    const signedUrls = await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
    return signedUrls[0]; // Return the signed URL
};

const getAllProducts = async () => {
    const snapshot = await db.ref('products').once('value');
    const products = snapshot.val();
    return products ? Object.keys(products).map(key => ({
        id: key,
        ...products[key]
    })) : [];
};
const getProductById = async (productId) => {
    const snapshot = await db.ref(`products/${productId}`).once('value');
    const product = snapshot.val();
    return product ? { id: productId, ...product } : null;
};
const addProduct = async (productData, imageFiles) => {
    const { name, description, price, categoryId, stockQuantity } = productData;
    let imageUrls = {};

    // Upload images and get URLs
    for (let i = 0; i < imageFiles.length; i++) {
        const imageUrl = await uploadImage(imageFiles[i], name);
        imageUrls[`imageUrl${i + 1}`] = imageUrl;
    }

    // Determine the next product ID
    const productsSnapshot = await db.ref('products').once('value');
    const products = productsSnapshot.val() || {};
    const productNumbers = Object.keys(products).map(key =>
        parseInt(key.replace('productId', ''), 10) // Extract number from IDs like "productId1"
    );
    const maxNumber = productNumbers.length > 0 ? Math.max(...productNumbers) : 0;
    const newProductId = `productId${maxNumber + 1}`;

    // Set the new product data
    const newProductData = {
        name,
        description,
        price,
        categoryId,
        stockQuantity,
        imageUrl: imageUrls["imageUrl1"],  // First image URL
        images: imageUrls,  // All image URLs
        reviews: { _init: true }  // Initially empty
    };

    // Save new product under the calculated product ID
    await db.ref(`products/${newProductId}`).set(newProductData);
    return { id: newProductId, ...newProductData };
};

const updateProduct = async (productId, productData) => {
    const { name, description, price, categoryId, stockQuantity, images, reviews } = productData;

    // Re-initialize image indexes
    const reIndexedImages = {};
    let index = 1;
    for (const key in images) {
        reIndexedImages[`imageUrl${index}`] = images[key];
        index++;
    }

    // Set the updated product data
    const updatedProductData = {
        name,
        description,
        price,
        categoryId,
        stockQuantity,
        imageUrl: reIndexedImages["imageUrl1"],  // First image URL
        images: reIndexedImages,  // All image URLs
        reviews: reviews || {}  // Reviews
    };

    // Update the product data in the database
    await db.ref(`products/${productId}`).update(updatedProductData);
    return { id: productId, ...updatedProductData };
};

const deleteImage = async (productId, imageUrl) => {

    // Extract the file name from the URL
    const fileName = imageUrl.split('/').pop().split('?')[0];
    await storage.bucket().file(`product_image/${fileName}`).delete();

    // Get the product data
    const productSnapshot = await db.ref(`products/${productId}`).once('value');
    const productData = productSnapshot.val();

    if (!productData) {
        throw new Error('Product not found');
    }

    // Remove the image URL from the product data
    const updatedImages = {};
    Object.keys(productData.images).forEach((key) => {
        if (productData.images[key] !== imageUrl) {
            updatedImages[key] = productData.images[key];
        }
    });

    // Re-initialize image indexes
    const reIndexedImages = {};
    let index = 1;
    for (const key in updatedImages) {
        reIndexedImages[`imageUrl${index}`] = updatedImages[key];
        index++;
    }

    // Update the product data in the database
    await db.ref(`products/${productId}`).update({ images: reIndexedImages });

    return { id: productId, ...productData, images: reIndexedImages };
};

const deleteProduct = async (productId) => {
    const productRef = db.ref(`products/${productId}`);
    const productSnapshot = await productRef.once('value');
    const productData = productSnapshot.val();

    if (!productData) {
        throw new Error('Product not found');
    }

    // Delete images from Firebase Storage
    const imageDeletionPromises = Object.values(productData.images).map(imageUrl => {
        const fileName = imageUrl.split('/').pop().split('?')[0];
        return storage.bucket().file(`product_image/${fileName}`).delete();
    });

    await Promise.all(imageDeletionPromises);

    // Delete the product from the database
    await productRef.remove();

    // Fetch all products to reindex
    const allProductsSnapshot = await db.ref('products').once('value');
    const allProducts = allProductsSnapshot.val();

    // Reindex the remaining products
    const updatedProducts = {};
    let index = 1;
    for (const key in allProducts) {
        if (key !== productId) {
            const newProductId = `productId${index}`;
            updatedProducts[newProductId] = allProducts[key];
            index++;
        }
    }

    // Update the database with reindexed products
    await db.ref('products').set(updatedProducts);
};


module.exports = { getAllProducts, addProduct, getProductById, updateProduct, deleteImage, deleteProduct };