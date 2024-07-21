const categoryModel = require('../models/categoryModel');

const displayCategoriesPage = async (req, res) => {
    try {
        const categories = await categoryModel.getAllCategories();
        res.render('index', {
            content: 'category_page', // Assuming you have logic in index.ejs to handle this
            categories: categories,
            user: req.session.user,
        });
    } catch (error) {
        console.error("Error adding category: ", error);
        res.status(500).send('Error adding category');
    }
};

const addNewCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        const categoryImageFile = req.file;
        const result = await categoryModel.addCategory(categoryName, categoryImageFile);
        // After adding, redirect to the categories page to display all, including the newly added category
        // This will trigger `displayCategoriesPage` again
        res.redirect('/category');
    } catch (error) {
        console.error("Failed to add category: ", error);
        res.status(500).json({ success: false, message: 'Failed to add category' });
    }
};

const updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { categoryName } = req.body;
    const categoryImageFile = req.file; // This could be undefined if no file is uploaded

    try {
        if (categoryImageFile) {
            // If a new image file is uploaded, process the update with the new image
            const updatedCategory = await categoryModel.updateCategory(categoryId, categoryName, categoryImageFile);
        } else {
            // If no new image file is uploaded, update only the category name
            const updatedCategory = await categoryModel.updateCategory(categoryId, categoryName);
        }
        res.redirect('/category'); // Redirect back to the category list page
    } catch (error) {
        console.error("Error updating category: ", error);
        res.status(500).send('Failed to update category');
    }
};

const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const result = await categoryModel.deleteCategory(categoryId);
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
};

module.exports = { addNewCategory, displayCategoriesPage, updateCategory, deleteCategory };