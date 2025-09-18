// DOM Elements
const container = document.querySelector(".canvas"),
  sizeInput = document.querySelector(".pixelNumbers"),
  colorPicker = document.querySelector(".colourPicker"),
  resetBtn = document.querySelector(".resetBtn"),
  eraseBtn = document.querySelector(".eraseBtn"),
  randomColorBtn = document.querySelector(".randomColorBtn");
  


let size = sizeInput.value,
  draw = false,
  erase = false;

// Create pixel grid
function createPixelGrid(n) {
  container.style.gridTemplate = `repeat(${n},1fr)/repeat(${n},1fr)`;
  container.innerHTML = "";
  for (let i = 0; i < n * n; i++) {
    const pixel = document.createElement("div");
    pixel.className = "pixel";
    pixel.onmousedown = () =>
      (pixel.style.backgroundColor = erase ? "" : colorPicker.value);
    pixel.onmouseenter = () => {
      if (draw) pixel.style.backgroundColor = erase ? "" : colorPicker.value;
    };
    container.appendChild(pixel);
  }
}

// Fetch random color
async function fetchRandomColor() {
  try {
    const res = await fetch("https://www.thecolorapi.com/random");
    colorPicker.value = (await res.json()).hex.value;
  } catch {
    alert("Couldn't fetch a random color. Try again!");
  }
}

// Events
window.onmousedown = () => (draw = true);
window.onmouseup = () => (draw = false);
sizeInput.onchange = () => {
  size = Math.min(50, Math.max(5, +sizeInput.value || 30));
  sizeInput.value = size;
  createPixelGrid(size);
};
eraseBtn.onclick = () => {
  erase = !erase;
  eraseBtn.textContent = erase ? "Draw" : "Erase";
};
resetBtn.onclick = () => createPixelGrid(size);
randomColorBtn.onclick = fetchRandomColor;

// Init
createPixelGrid(size);