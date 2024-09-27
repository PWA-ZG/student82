const request = indexedDB.open("YourImageDatabase", 1);

request.onsuccess = (event) => {
  const db = event.target.result;

  const transaction = db.transaction(["images"], "readonly");
  const objectStore = transaction.objectStore("images");

  const cursorRequest = objectStore.openCursor();

  cursorRequest.onsuccess = (event) => {
    const cursor = event.target.result;

    if (cursor) {
      createGalleryItem(cursor.value);
      cursor.continue();
    }
  };

  transaction.onerror = (error) => {
    console.error("Error accessing IndexedDB:", error);
  };
};

function createGalleryItem(imageData) {
  const galleryContainer = document.getElementById("galleryContainer");

  if (galleryContainer) {
    const galleryItem = document.createElement("div");
    galleryItem.className = "gallery-item";

    const image = document.createElement("img");
    image.src = imageData.url;
    image.alt = "Saved Image";

    if (imageData.styles) {
      const data = imageData.styles;

      applyStoredStyles(image, imageData.styles);

      if (data.height && data.height > 0) {
        image.height = data.height;
      }
      if (data.width && data.width > 0) {
        image.width = data.width;
      }
    }

    galleryItem.appendChild(image);
    galleryContainer.appendChild(galleryItem);
  }
}

function applyStoredStyles(image, styles) {
  if (image && styles) {
    image.style.borderRadius = styles.border;
    image.style.clipPath = styles.clipPath;
  }
}
