// DOM Elements
const container = document.querySelector(".canvas");
const sizeInput = document.querySelector(".pixelNumbers");
const colorPicker = document.querySelector(".colourPicker");
const resetBtn = document.querySelector(".resetBtn");
const eraseBtn = document.querySelector(".eraseBtn");
const randomColorBtn = document.querySelector(".randomColorBtn"); // Random color button
const generateSchemeBtn = document.querySelector(".generateSchemeBtn"); // Scheme generator button
const paletteContainer = document.querySelector(".palette-container");

// State variables
let size = sizeInput.value;
let draw = false;
let erase = false;

// Initialize the pixel grid
function createPixel(size) {
  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  container.innerHTML = "";

  for (let i = 0; i < size * size; i++) {
    const div = document.createElement("div");
    div.classList.add("pixel");

    div.addEventListener("mousedown", function() {
      if (erase) {
        div.style.backgroundColor = "";
      } else {
        draw = true;
        div.style.backgroundColor = colorPicker.value;
      }
    });

    div.addEventListener("mouseenter", function() {
      if (draw && !erase) {
        div.style.backgroundColor = colorPicker.value;
      } else if (draw && erase) {
        div.style.backgroundColor = "";
      }
    });

    container.appendChild(div);
  }
}

// Fetch a single random color
async function fetchRandomColor() {
  try {
    const response = await fetch("https://www.thecolorapi.com/random");
    const data = await response.json();
    colorPicker.value = data.hex.value;
  } catch (error) {
    console.error("Error fetching random color:", error);
    alert("Couldn't fetch a random color. Try again!");
  }
}

// Fetch a color scheme
async function fetchColorScheme() {
  const seedColor = colorPicker.value.replace("#", "");
  const mode = "monochrome"; // Default mode
  const count = 5;

  try {
    const response = await fetch(
      `https://www.thecolorapi.com/scheme?hex=${seedColor}&mode=${mode}&count=${count}`
    );
    const data = await response.json();
    displayColorScheme(data.colors);
  } catch (error) {
    console.error("Error fetching scheme:", error);
    alert("Couldn't fetch color scheme. Try again!");
  }
}

// Display color scheme swatches
function displayColorScheme(colors) {
  paletteContainer.innerHTML = "";
  colors.forEach(color => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color.hex.value;
    swatch.addEventListener("click", () => {
      colorPicker.value = color.hex.value;
    });
    paletteContainer.appendChild(swatch);
  });
}

// Reset canvas
function resetCanvas() {
  createPixel(size);
}

// Event Listeners
window.addEventListener("mousedown", () => (draw = true));
window.addEventListener("mouseup", () => (draw = false));

sizeInput.addEventListener("change", function() {
  size = Math.min(50, Math.max(5, parseInt(this.value) || 30));
  this.value = size;
  resetCanvas();
});

eraseBtn.addEventListener("click", function() {
  erase = !erase;
  eraseBtn.textContent = erase ? "Draw" : "Erase";
});

resetBtn.addEventListener("click", resetCanvas);
randomColorBtn.addEventListener("click", fetchRandomColor); // Random color button
generateSchemeBtn.addEventListener("click", fetchColorScheme); // Scheme generator button

// Initialize
createPixel(size);