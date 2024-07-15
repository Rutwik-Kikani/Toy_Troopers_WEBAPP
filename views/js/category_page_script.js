
function previewImage() {
    const file = document.getElementById("categoryImage").files[0];
    const preview = document.getElementById("imagePreview");
    const reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
    };

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }
}
function loadCategory(id, name, imageUrl) {
    document.getElementById("categoryName").value = name;
    document.getElementById("imagePreview").src = imageUrl;
    document.getElementById("categoryImage").removeAttribute("required"); // Remove 'required' attribute for image when updating
    document.getElementById("categoryForm").action = "/update-category/" + id; // Set form action to update route
    document.getElementById("categoryForm").querySelector('button[type="submit"]').textContent = "Update Category"; // Change button text to "Update"
    document.querySelector(".category-form h2").innerHTML = "Update the Category";
}

function deleteCategory(categoryId) {
    if (confirm("Are you sure you want to delete this category?")) {
        fetch("/delete-category/" + categoryId, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    document.getElementById("category-" + categoryId).remove();
                    alert("Category deleted successfully");
                } else {
                    alert("Failed to delete category");
                }
            })
            .catch((error) => alert("Error deleting category: " + error));
    }
}