const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const grammar =
  "#JSGF V1.0; grammar shapes; public <shape> = circle | square | triangle | star ;";
const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const diagnostic = document.querySelector(".output");
const imageContainer = document.getElementById("imageContainer");
const imageInput = document.getElementById("imageInput");
const recordButton = document.getElementById("record-start");
const saveButton = document.getElementById("saveButton");

recordButton.onclick = () => {
  recordButton.disabled = true;
  recognition.start();
};

imageInput.addEventListener("change", handleImageUpload);

saveButton.addEventListener("click", saveImage);

function handleImageUpload(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target.result;
      const uploadedImage = document.createElement("img");
      uploadedImage.src = imageUrl;
      uploadedImage.alt = "Uploaded Image";
      uploadedImage.id = "uploadedImage";

      uploadedImage.style.maxWidth = "60vh";
      uploadedImage.style.height = "auto";

      imageContainer.innerHTML = "";
      imageContainer.appendChild(uploadedImage);
    };

    reader.readAsDataURL(file);
  }
}

function saveImage() {
  const uploadedImage = document.getElementById("uploadedImage");

  if (uploadedImage) {
    const imageUrl = uploadedImage.src;
    const styles = {
      border: uploadedImage.style.borderRadius,
      clipPath: uploadedImage.style.clipPath,
      objectFit: uploadedImage.style.objectFit,
      height: uploadedImage.height,
      width: uploadedImage.width,
    };

    saveImageToIndexedDB(imageUrl, styles);
  }
}

function saveImageToIndexedDB(imageUrl, styles) {
  const request = indexedDB.open("YourImageDatabase", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const objectStore = db.createObjectStore("images", {
      keyPath: "id",
      autoIncrement: true,
    });
    objectStore.createIndex("url", "url", { unique: false });
    objectStore.createIndex("styles", "styles", { unique: false });
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    const transaction = db.transaction(["images"], "readwrite");
    const objectStore = transaction.objectStore("images");

    const addRequest = objectStore.add({ url: imageUrl, styles: styles });

    addRequest.onsuccess = () => {
      window.location.href = "/gallery";
    };

    addRequest.onerror = (error) => {
      console.error("Error saving image to IndexedDB:", error);
    };
  };

  request.onerror = (event) => {
    console.error("Error opening IndexedDB:", event.target.error);
  };
}

function applyShapeTransformation(shape) {
  const uploadedImage = document.getElementById("uploadedImage");

  if (uploadedImage) {
    switch (shape) {
      case "circle":
        uploadedImage.style.borderRadius = "50%";
        uploadedImage.style.clipPath = "none";
        resizeImage();
        break;
      case "square":
        uploadedImage.style.borderRadius = "0";
        uploadedImage.style.clipPath = "none";
        resizeImage();
        break;
      case "triangle":
        uploadedImage.style.borderRadius = "0";
        uploadedImage.style.clipPath = "polygon(50% 0%, 0% 100%, 100% 100%)";
        break;
      case "star":
        uploadedImage.style.borderRadius = "0";
        uploadedImage.style.clipPath =
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
        break;
      case "reset":
        resetStyles();
        break;
      default:
        break;
    }
  }
}

function resizeImage() {
  const uploadedImage = document.getElementById("uploadedImage");

  if (uploadedImage) {
    const imageSize = Math.min(uploadedImage.height, uploadedImage.width);

    if (imageSize > 0) {
      uploadedImage.style.width = `${imageSize}px`;
      uploadedImage.style.height = `${imageSize}px`;
      uploadedImage.style.objectFit = "cover";
      uploadedImage.style.objectPosition = "50% 50%";
    }
  }
}

function resetStyles() {
  const uploadedImage = document.getElementById("uploadedImage");

  if (uploadedImage) {
    uploadedImage.style.borderRadius = "0";
    uploadedImage.style.width = "auto";
    uploadedImage.style.height = "auto";
  }
}

recognition.onresult = (event) => {
  recordButton.disabled = false;
  const transcript = event.results[0][0].transcript.trim().toLowerCase();

  const allowedShapes = ["circle", "square", "triangle", "star", "reset"];
  const foundShape = allowedShapes.find((shape) => transcript.includes(shape));

  diagnostic.textContent = `Shape: ${foundShape}`;

  if (foundShape) {
    applyShapeTransformation(foundShape);
  } else {
    diagnostic.textContent = "No supported shape detected";
  }
};
