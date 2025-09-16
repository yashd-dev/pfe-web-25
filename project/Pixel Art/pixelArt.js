const container = document.querySelector(".canvas");
const sizeInput = document.querySelector(".pixelNumbers");
let size = sizeInput.value;
const colorPicker = document.querySelector(".colourPicker");
const resetBtn = document.querySelector(".resetBtn");
const eraseBtn = document.querySelector(".eraseBtn");
let draw = false;
let erase = false;

function createPixel(size) {
  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  container.innerHTML = "";
  for (let i = 0; i < size * size; i++) {
    const div = document.createElement("div");
    div.classList.add("pixel");

    div.addEventListener("mousedown", function () {
      if (erase) {
        div.style.backgroundColor = "";
      } else {
        draw = true;
        div.style.backgroundColor = colorPicker.value;
      }
    });

    div.addEventListener("mouseenter", function () {
      if (draw && !erase) {
        div.style.backgroundColor = colorPicker.value;
      } else if (draw && erase) {
        div.style.backgroundColor = "";
      }
    });

    container.appendChild(div);
  }
}

window.addEventListener("mousedown", () => (draw = true));
window.addEventListener("mouseup", () => (draw = false));

function resetCanvas() {
  createPixel(size);
}

sizeInput.addEventListener("change", function () {
  size = Math.min(50, Math.max(5, parseInt(this.value) || 30));
  this.value = size;
  resetCanvas();
});

eraseBtn.addEventListener("click", function () {
  erase = !erase;
  eraseBtn.textContent = erase ? "Draw" : "Erase";
});

resetBtn.addEventListener("click", resetCanvas);

createPixel(size);
