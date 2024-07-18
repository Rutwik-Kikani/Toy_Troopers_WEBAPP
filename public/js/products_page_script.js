let timeout = null; // Holds the timeout ID for debouncing
let uploadedImages = []; // Array to keep track of uploaded images.
let currentProductImages = {}; // Object to keep track of existing images.
let currentReviews = {}; // Object to keep track of current reviews.

document.getElementById('productForm').onsubmit = function () {
    const totalImages = uploadedImages.length + Object.keys(currentProductImages).length;
    if (totalImages > 5 || totalImages === 0) {
        alert('You can upload a maximum of 5 or minimum 1 image.');
        return false; // Prevent the form from being submitted
    }
    // Set the files to the file input right before submitting
    var dataTransfer = new DataTransfer();
    uploadedImages.forEach(file => dataTransfer.items.add(file));
    document.getElementById('productImages').files = dataTransfer.files;

    const imagesInput = document.createElement('input');
    imagesInput.type = 'hidden';
    imagesInput.name = 'currentProductImages';
    imagesInput.value = JSON.stringify(currentProductImages);
    document.getElementById('productForm').appendChild(imagesInput);

    const reviewsInput = document.createElement('input');
    reviewsInput.type = 'hidden';
    reviewsInput.name = 'currentReviews';
    reviewsInput.value = JSON.stringify(currentReviews);
    document.getElementById('productForm').appendChild(reviewsInput);

    return true;
};

function previewImages() {
    const input = document.getElementById('productImages');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('img-container');

            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('pre-img');

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'x';
            removeBtn.id = 'remove-btn';
            removeBtn.onclick = function () {
                const index = uploadedImages.indexOf(file);
                if (index > -1) {
                    uploadedImages.splice(index, 1);
                }
                imagePreviewContainer.removeChild(imgContainer);
            };

            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            imagePreviewContainer.appendChild(imgContainer);
        }
        reader.readAsDataURL(file);

        uploadedImages.push(file); // Add file to the list
        input.value = ''; // Clear the input so the same file can be re-uploaded
    }
}

function updateImagePreview(images, productId) {
    const previewContainer = document.getElementById("imagePreviewContainer");
    previewContainer.innerHTML = "";

    Object.keys(images).forEach(key => {
        const imagePreviewContainer = previewContainer;
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');

        const img = document.createElement('img');
        img.src = images[key];
        img.classList.add('pre-img');
        img.dataset.key = key;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'x';
        removeBtn.id = 'remove-btn';
        removeBtn.onclick = function (event) {
            event.preventDefault();
            if (confirm("Deleting this image will remove it from the database. Are you sure?")) {
                fetch('/delete-image', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageUrl: images[key],
                        productId: productId
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message === 'Image deleted successfully') {
                            delete currentProductImages[key];
                            imagePreviewContainer.removeChild(imgContainer);
                        } else {
                            console.log('Error deleting image:', data.error);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            }
        };
        imgContainer.appendChild(img);
        imgContainer.appendChild(removeBtn);
        imagePreviewContainer.appendChild(imgContainer);
    });
}

function loadProduct(id) {
    fetch(`/products/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("productName").value = data.name;
            document.getElementById("productCategory").value = data.categoryId;
            document.getElementById("productDescription").value = data.description;
            document.getElementById("productPrice").value = data.price;
            document.getElementById("productStockQuantity").value = data.stockQuantity;
            document.getElementById("formTitle").textContent = "Update Product";
            document.getElementById("productForm").querySelector('button[type="submit"]').textContent = "Update Product";
            document.getElementById("productForm").action = `/products/update-product/${id}`;
            currentProductImages = data.images || {};
            currentReviews = data.reviews || {};
            updateImagePreview(currentProductImages, id);
        })
        .catch(err => alert("Error loading product data"));
}

function deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product?")) {
        fetch(`/delete-product/${productId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Product deleted successfully') {
                    alert(data.message);
                    location.reload(); // Reload the page to reflect changes
                } else {
                    alert('Error deleting product');
                }
            })
            .catch(err => alert("Error deleting product"));
    }
}

function filterProducts() {
    clearTimeout(timeout); // Clear the previous timeout

    // Set a new timeout
    timeout = setTimeout(() => {
        var input = document.getElementById("searchInput");
        var filter = input.value.toLowerCase();
        var nodes = document.getElementById("productList").getElementsByTagName("li");
        let visibleCount = 0; // Counter for visible products

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].dataset.name.includes(filter)) {
                nodes[i].style.display = "block";
                visibleCount++; // Increment count if product is visible
            } else {
                nodes[i].style.display = "none";
            }
        }

        // Display or hide the 'No products found' message based on visibleCount
        const noProductsMessage = document.getElementById("noProductsMessage");
        if (visibleCount === 0) {
            if (!noProductsMessage) {
                // Create and append the message if it doesn't exist
                const message = document.createElement("li");
                message.id = "noProductsMessage";
                message.textContent = "No products found.";
                document.getElementById("productList").appendChild(message);
            } else {
                noProductsMessage.style.display = "flex"; // Just show the existing message
            }
        } else {
            noProductsMessage.style.display = "none";
        }
    }, 1000); // Delay of 1 second
}
