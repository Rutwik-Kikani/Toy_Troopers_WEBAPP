const { db, storage } = require("../config/firebase");

function createImageFilename(categoryName) {
    // Replace spaces with underscores and convert to lowercase
    const safeName = categoryName.replace(/\s+/g, '_').toLowerCase();
    return `${safeName}_toys.jpg`;
}

const updateCategory = async (categoryId, categoryName, categoryImageFile = null) => {
    console.log(categoryId);
    const categoryRef = db.ref(`categories/${categoryId}`);
    const currentData = (await categoryRef.once('value')).val();

    let categoryImageURL = currentData.categoryImageURL; // Existing image URL as fallback

    if (categoryImageFile) {
        // If there's a new image, delete the old image from storage first
        if (currentData.categoryImageURL) {
            const oldFileName = currentData.categoryImageURL.split('/').pop().split('?')[0]; // Extract the file name from URL
            const bucket = storage.bucket();
            const oldFile = bucket.file(`categories_image/${oldFileName}`);
            try {
                await oldFile.delete(); // Attempt to delete the old file
            } catch (error) {
                console.error("Error deleting old image: ", error);
                // Handle the case where the old image might already be deleted or not accessible
            }
        }

        // Upload the new image
        const bucket = storage.bucket();
        const newFilename = createImageFilename(categoryName);
        const newFile = bucket.file(`categories_image/${newFilename}`);
        await newFile.save(categoryImageFile.buffer, { contentType: 'image/jpeg' });
        const signedUrls = await newFile.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
        });
        categoryImageURL = signedUrls[0]; // Update the URL with the new one
    }

    // Update the database with the new name and possibly new image URL
    await categoryRef.set({
        categoryName,
        categoryImageURL
    });

    return { id: categoryId, categoryName, categoryImageURL };
};

const addCategory = async (categoryName, categoryImageFile) => {
    // Save the image to Firebase Storage
    const bucket = storage.bucket();
    const filename = createImageFilename(categoryName);
    const file = bucket.file(`categories_image/${filename}`);
    await file.save(categoryImageFile.buffer, { contentType: 'image/jpeg' });

    // Get the public URL of the file
    const signedUrls = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
    });
    const categoryImageURL = signedUrls[0];

    // Save the category data in Firebase Realtime Database
    const snapshot = await db.ref('categories').once('value');
    const categories = snapshot.val() || {};
    const categoryNumbers = Object.keys(categories)
        .map(key => parseInt(key.replace('categoryId', ''), 10)) // Remove 'category' prefix and parse to int
        .filter(num => !isNaN(num));
    const maxNumber = categoryNumbers.length > 0 ? Math.max(...categoryNumbers) : 0;

    // Create a new category key
    const newCategoryKey = `categoryId${maxNumber + 1}`;

    // Save the category data in Firebase Realtime Database with a custom key
    await db.ref(`categories/${newCategoryKey}`).set({
        categoryName,
        categoryImageURL
    });

    return { id: newCategoryKey, categoryName, categoryImageURL };
};

const getAllCategories = async () => {
    try {
        const snapshot = await db.ref('categories').once('value');
        const categories = snapshot.val();
        return categories ? Object.keys(categories).map(key => ({
            id: key,
            ...categories[key]
        })) : [];
    } catch (error) {
        console.error("Error getting categories: ", error);
        throw error;
    }
};

const rearrangeCategories = async (deletedCategoryId) => {
    const categoriesRef = db.ref('categories');
    const snapshot = await categoriesRef.once('value');
    const categories = snapshot.val();
    let newId = 1;
    let updates = {};

    // Collect updates
    for (let id in categories) {
        if (id !== deletedCategoryId) {
            const newKey = `categoryId${newId++}`;
            updates[newKey] = categories[id];
        }
    }

    // Remove all categories
    await categoriesRef.remove();

    // Write the updates with new keys
    await categoriesRef.update(updates);
};

const deleteCategory = async (categoryId) => {
    try {
        const categoryRef = db.ref('categories/' + categoryId);

        // Optionally, handle the deletion of the associated image from storage
        const categoryData = (await categoryRef.once('value')).val();
        if (categoryData && categoryData.categoryImageURL) {
            const imageName = categoryData.categoryImageURL.split('/').pop().split('?')[0]; // Extract the file name from URL
            const bucket = storage.bucket();
            const file = bucket.file(`categories_image/${imageName}`);
            await file.delete();  // Delete the image from Firebase Storage
        }

        // Delete the category from the database
        await categoryRef.remove();

        // Rearrange the remaining categories
        await rearrangeCategories(categoryId);

        return { success: true, message: 'Category successfully deleted and rearranged' };
    } catch (error) {
        console.error('Failed to delete and rearrange categories:', error);
        throw new Error('Failed to delete and rearrange categories');
    }
};
const getCategoryNameById = async (categoryId) => {
    const categorySnapshot = await db.ref(`categories/${categoryId}`).once('value');
    const categoryData = categorySnapshot.val();
    return categoryData ? categoryData.categoryName : 'Unknown Category';
};
module.exports = { addCategory, getAllCategories, updateCategory, deleteCategory, getCategoryNameById };