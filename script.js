const upload = document.getElementById("img-upload");
const uploadedImg = document.getElementById("uploaded-img");
const scaleSlider = document.getElementById("scale");
const rotateSlider = document.getElementById("rotate");
const downloadBtn = document.getElementById("download-btn");

let scale = 1;
let rotation = 0;
let pos = { x: 0, y: 0 };
let dragging = false;
let offset = { x: 0, y: 0 };

// Upload image
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
  scaleSlider.value = 1;
  rotateSlider.value = 0;
  updateTransform();
}

function updateTransform() {
  uploadedImg.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rotation}deg)`;
}

// Mouse drag
uploadedImg.addEventListener("mousedown", (e) => {
  dragging = true;
  offset = {
    x: e.clientX - pos.x,
    y: e.clientY - pos.y,
  };
});

window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  pos.x = e.clientX - offset.x;
  pos.y = e.clientY - offset.y;
  updateTransform();
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

// Touch - drag + pinch zoom + pinch rotate
let lastTouch = [];
let initialDistance = null;
let initialAngle = null;
let initialScale = 1;
let initialRotation = 0;

uploadedImg.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    lastTouch = [e.touches[0]];
    dragging = true;
    offset = {
      x: e.touches[0].clientX - pos.x,
      y: e.touches[0].clientY - pos.y,
    };
  } else if (e.touches.length === 2) {
    dragging = false;
    initialDistance = getDistance(e.touches);
    initialAngle = getAngle(e.touches);
    initialScale = scale;
    initialRotation = rotation;
  }
});

uploadedImg.addEventListener("touchmove", (e) => {
  e.preventDefault();

  if (e.touches.length === 1 && dragging) {
    pos.x = e.touches[0].clientX - offset.x;
    pos.y = e.touches[0].clientY - offset.y;
    updateTransform();
  } else if (e.touches.length === 2) {
    const newDistance = getDistance(e.touches);
    const newAngle = getAngle(e.touches);

    if (initialDistance && newDistance) {
      scale = initialScale * (newDistance / initialDistance);
      scale = Math.max(0.5, Math.min(3, scale));
      scaleSlider.value = scale;
    }

    if (initialAngle !== null) {
      rotation = initialRotation + (newAngle - initialAngle);
      rotateSlider.value = rotation;
    }

    updateTransform();
  }
}, { passive: false });

window.addEventListener("touchend", () => {
  dragging = false;
});

// Helpers for pinch zoom + rotate
function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function getAngle(touches) {
  const dx = touches[1].clientX - touches[0].clientX;
  const dy = touches[1].clientY - touches[0].clientY;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

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
