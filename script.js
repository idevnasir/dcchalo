const upload = document.getElementById("img-upload");
const uploadedImg = document.getElementById("uploaded-img");
const imageWrapper = document.getElementById("image-wrapper");

const scaleSlider = document.getElementById("scale");
const rotateSlider = document.getElementById("rotate");
const downloadBtn = document.getElementById("download-btn");

let scale = 1;
let rotation = 0;
let pos = { x: 0, y: 0 };
let dragging = false;
let start = { x: 0, y: 0 };

let initialDistance = 0;
let initialAngle = 0;
let initialScale = 1;
let initialRotation = 0;

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    uploadedImg.src = ev.target.result;
    resetImage();
  };
  reader.readAsDataURL(file);
});

function resetImage() {
  scale = 1;
  rotation = 0;
  pos = { x: 0, y: 0 };
  scaleSlider.value = scale;
  rotateSlider.value = rotation;
  updateTransform();
}

function updateTransform() {
  imageWrapper.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${Math.max(0, scale)}) rotate(${rotation}deg) translate(-50%, -50%)`;
}

// Drag on desktop
imageWrapper.addEventListener("mousedown", (e) => {
  dragging = true;
  start.x = e.clientX - pos.x;
  start.y = e.clientY - pos.y;
});

window.addEventListener("mousemove", (e) => {
  if (dragging) {
    pos.x = e.clientX - start.x;
    pos.y = e.clientY - start.y;
    updateTransform();
  }
});

window.addEventListener("mouseup", () => {
  dragging = false;
});

// Sliders
scaleSlider.addEventListener("input", () => {
  scale = parseFloat(scaleSlider.value);
  updateTransform();
});

rotateSlider.addEventListener("input", () => {
  rotation = parseFloat(rotateSlider.value);
  updateTransform();
});

// Pinch and rotate on mobile
imageWrapper.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    initialDistance = Math.sqrt(dx * dx + dy * dy);
    initialAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    initialScale = scale;
    initialRotation = rotation;
  } else if (e.touches.length === 1) {
    dragging = true;
    start.x = e.touches[0].clientX - pos.x;
    start.y = e.touches[0].clientY - pos.y;
  }
});

imageWrapper.addEventListener("touchmove", (e) => {
  e.preventDefault();

  if (e.touches.length === 2) {
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    const newDistance = Math.sqrt(dx * dx + dy * dy);
    const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    scale = initialScale * (newDistance / initialDistance);
    rotation = initialRotation + (newAngle - initialAngle);

    scaleSlider.value = scale;
    rotateSlider.value = rotation;

    updateTransform();
  } else if (e.touches.length === 1 && dragging) {
    pos.x = e.touches[0].clientX - start.x;
    pos.y = e.touches[0].clientY - start.y;
    updateTransform();
  }
}, { passive: false });

imageWrapper.addEventListener("touchend", () => {
  dragging = false;
});

// Download
downloadBtn.addEventListener("click", () => {
  const editor = document.getElementById("editor");
  html2canvas(editor).then((canvas) => {
    const link = document.createElement("a");
    link.download = "framed-image.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});
