const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}[a-zA-Z0-9]*$/;
const genBtn = document.getElementById("genBtn");
const clearBtn = document.getElementById("clearBtn");
const upiEl = document.getElementById("upi");
const amtEl = document.getElementById("amount");
const payeeEl = document.getElementById("payeeName");
const errEl = document.getElementById("err");
const resultArea = document.getElementById("resultArea");
const deepLinkEl = document.getElementById("deepLink");
const qrImg = document.getElementById("qrImg");
const dlBtn = document.getElementById("dlBtn");
const copyBtn = document.getElementById("copyBtn");
const openBtn = document.getElementById("openBtn");

function showError(msg) {
  errEl.style.display = "block";
  errEl.textContent = msg;
}

function clearError() {
  errEl.style.display = "none";
  errEl.textContent = "";
}

function buildUpiLink(payee, amount, name) {
  const params = new URLSearchParams();
  params.set("pa", payee);
  if (name && name.trim()) params.set("pn", name.trim());
  params.set("am", parseFloat(amount).toFixed(2));
  params.set("cu", "INR");
  return "upi://pay?" + params.toString();
}

function generateQRDataURI(data, size = 300) {
  const base = "https://api.qrserver.com/v1/create-qr-code/";
  const q = new URLSearchParams({
    size: size + "x" + size,
    data: data,
    qzone: 1,
  });
  return base + "?" + q.toString();
}

genBtn.addEventListener("click", () => {
  clearError();
  const upi = upiEl.value.trim();
  const amt = amtEl.value.trim();
  const name = payeeEl.value.trim();
  if (!upi) return showError("Please enter a UPI ID.");
  if (!upiRegex.test(upi))
    return showError("Invalid UPI ID format. Example: merchant@bank");
  if (!amt) return showError("Please enter an amount.");
  const amtNum = Number(amt);
  if (isNaN(amtNum) || amtNum <= 0)
    return showError("Amount must be a positive number.");
  const link = buildUpiLink(upi, amtNum, name);
  deepLinkEl.textContent = link;
  const src = generateQRDataURI(link, 400);
  qrImg.src = src;
  qrImg.alt = "QR for " + link;
  resultArea.style.display = "flex";
});

clearBtn.addEventListener("click", () => {
  upiEl.value = "";
  amtEl.value = "";
  payeeEl.value = "";
  resultArea.style.display = "none";
  clearError();
});

copyBtn.addEventListener("click", async () => {
  const txt = deepLinkEl.textContent;
  if (!txt) return;
  try {
    await navigator.clipboard.writeText(txt);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy Deep-link"), 1200);
  } catch (e) {
    copyBtn.textContent = "Copy (fallback)";
    setTimeout(() => (copyBtn.textContent = "Copy Deep-link"), 1200);
  }
});

dlBtn.addEventListener("click", () => {
  const src = qrImg.src;
  if (!src) return;
  const a = document.createElement("a");
  a.href = src;
  a.download = "upi-qr.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
});

openBtn.addEventListener("click", () => {
  const link = deepLinkEl.textContent;
  if (!link) return;
  window.location.href = link;
});

amtEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") genBtn.click();
});

upiEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") genBtn.click();
});
