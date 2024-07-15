const { db, storage } = require("../config/firebase");

// Helper function to upload an image and return its signed URL
const uploadImage = async (imageFile, name, index) => {
    const fileName = `product_${name}_${index}`;
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

const addProduct = async (productData, imageFiles) => {
    const { name, description, price, categoryId, stockQuantity } = productData;
    let imageUrls = [];

    // Upload images and get URLs
    for (let i = 0; i < imageFiles.length; i++) {
        const imageUrl = await uploadImage(imageFiles[i], name, i + 1);
        imageUrls.push(imageUrl);
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
        imageUrl: imageUrls[0],  // First image URL
        images: imageUrls,  // All image URLs
        reviews: { _init: true }  // Initially empty
    };

    // Save new product under the calculated product ID
    await db.ref(`products/${newProductId}`).set(newProductData);
    return { id: newProductId, ...newProductData };
};

module.exports = { getAllProducts, addProduct };