let timeout = null; // Holds the timeout ID for debouncing
let uploadedFiles = []; // Array to keep track of files

document.getElementById('productForm').onsubmit = function () {
    if (uploadedFiles.length > 5 || uploadedFiles.length == 0) {
        alert('You can upload a maximum of 5 or minimum 1 image.');
        return false; // Prevent the form from being submitted
    }
    // Set the files to the file input right before submitting
    var dataTransfer = new DataTransfer();
    uploadedFiles.forEach(file => dataTransfer.items.add(file));
    document.getElementById('productImages').files = dataTransfer.files;
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
            imgContainer.style.display = 'inline-block';
            imgContainer.style.position = 'relative';
            imgContainer.style.margin = '5px';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('preview-img');

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'x';
            removeBtn.id = 'remove-btn';
            removeBtn.classList.add('remove-btn');
            removeBtn.onclick = function () {
                const index = uploadedFiles.indexOf(file);
                if (index > -1) {
                    uploadedFiles.splice(index, 1);
                }
                imagePreviewContainer.removeChild(imgContainer);
            };

            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            imagePreviewContainer.appendChild(imgContainer);
        }
        reader.readAsDataURL(file);

        uploadedFiles.push(file); // Add file to the list
        input.value = ''; // Clear the input so the same file can be re-uploaded
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
                noProductsMessage.style.display = "block"; // Just show the existing message
            }
        } else {
            noProductsMessage.style.display = "none"; // Hide the message if products are visible
        }
    }, 1000); // Delay of 1 second
}
