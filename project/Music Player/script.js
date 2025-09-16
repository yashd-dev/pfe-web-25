function formatTime(seconds) {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return (
    minutes +
    ":" +
    (remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds)
  );
}
function escapeHtml(text) {
  const replacements = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  };
  return String(text).replace(/[&<>"]/g, (char) => replacements[char]);
}
const elements = {
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  results: document.getElementById("results"),
  audio: document.getElementById("audioEl"),
  btnPlay: document.getElementById("btnPlay"),
  seek: document.getElementById("seek"),
  curTime: document.getElementById("curTime"),
  durTime: document.getElementById("durTime"),
  volume: document.getElementById("volume"),
  vinyl: document.getElementById("vinyl"),
  coverImg: document.getElementById("coverImg"),
  playerArt: document.getElementById("playerArt"),
  playerTitle: document.getElementById("playerTitle"),
  playerArtist: document.getElementById("playerArtist"),
  caseTitle1: document.getElementById("caseTitle1"),
  caseTitle2: document.getElementById("caseTitle2"),
  caseYear: document.getElementById("caseYear"),
  metaGenre: document.getElementById("metaGenre"),
  metaLabel: document.getElementById("metaLabel"),
  metaFormat: document.getElementById("metaFormat"),
};
let currentTrack = null;
let isPlaying = false;
let seekUpdateAnimation = null;
async function searchSongs() {
  const query = elements.searchInput.value.trim();
  if (!query) return;
  elements.searchBtn.disabled = true;
  elements.searchBtn.textContent = "Searching...";
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=song&limit=5`;
    const response = await fetch(url);
    const data = await response.json();
    displaySearchResults(data.results || []);
  } catch (error) {
    console.error("Search failed:", error);
    elements.results.innerHTML =
      '<div style="color:#b00">Search failed. Check network connection.</div>';
  } finally {
    elements.searchBtn.disabled = false;
    elements.searchBtn.textContent = "Search";
  }
}
function displaySearchResults(tracks) {
  elements.results.innerHTML = "";
  if (!tracks.length) {
    elements.results.innerHTML =
      '<div style="color:#666">No results found</div>';
    return;
  }
  tracks.forEach((track) => {
    const resultElement = document.createElement("div");
    resultElement.className = "result";
    resultElement.innerHTML = `
          <img src="${track.artworkUrl100}" alt="Album art">
          <div class="meta">
            <div class="track">${escapeHtml(track.trackName)}</div>
            <div class="artist">${escapeHtml(track.artistName)}</div>
            <div class="album">${escapeHtml(track.collectionName)}</div>
          </div>
        `;
    resultElement.addEventListener("click", () => selectTrack(track));
    elements.results.appendChild(resultElement);
  });
}
function selectTrack(track) {
  currentTrack = track;
  updateVisuals(track);
  updateCaseInfo(track);
  loadAndPlayTrack(track);
}
function updateVisuals(track) {
  const highResArtwork = (track.artworkUrl100 || "").replace(
    "100x100",
    "600x600"
  );
  elements.coverImg.src = highResArtwork;
  elements.playerArt.src = highResArtwork;
  elements.playerTitle.textContent = track.trackName;
  elements.playerArtist.textContent = track.artistName;
}
function updateCaseInfo(track) {
  elements.caseTitle1.textContent =
    track.trackName.length > 24
      ? track.trackName.slice(0, 24)
      : track.trackName;
  elements.caseTitle2.textContent = track.collectionName || "";
  elements.caseYear.textContent = track.releaseDate
    ? "©" + new Date(track.releaseDate).getFullYear()
    : "";
  elements.metaGenre.textContent = "GENRE: " + (track.primaryGenreName || "—");
  elements.metaLabel.textContent = "LABEL: " + (track.collectionName || "—");
  if (track.trackTimeMillis) {
    const duration = track.trackTimeMillis / 1000;
    elements.metaFormat.textContent = "DURATION: " + formatTime(duration);
    elements.durTime.textContent = formatTime(duration);
  } else {
    elements.metaFormat.textContent = "FORMAT: STUDIO ALBUM (LP)";
  }
}
function loadAndPlayTrack(track) {
  if (track.previewUrl) {
    elements.audio.src = track.previewUrl;
    elements.audio.play().catch(() => {});
  }
  elements.vinyl.style.animationPlayState = "running";
  isPlaying = true;
  elements.btnPlay.textContent = "⏸";
}
elements.btnPlay.addEventListener("click", () => {
  if (!elements.audio.src) return;
  if (elements.audio.paused) {
    elements.audio.play();
  } else {
    elements.audio.pause();
  }
});
elements.audio.addEventListener("play", () => {
  isPlaying = true;
  elements.btnPlay.textContent = "⏸";
  elements.vinyl.style.animationPlayState = "running";
  startSeekUpdates();
});
elements.audio.addEventListener("pause", () => {
  isPlaying = false;
  elements.btnPlay.textContent = "▶";
  elements.vinyl.style.animationPlayState = "paused";
  stopSeekUpdates();
});
elements.audio.addEventListener("ended", () => {
  isPlaying = false;
  elements.btnPlay.textContent = "▶";
  elements.vinyl.style.animationPlayState = "paused";
  stopSeekUpdates();
});
elements.audio.addEventListener("loadedmetadata", () => {
  elements.durTime.textContent = formatTime(elements.audio.duration);
});
function startSeekUpdates() {
  stopSeekUpdates();
  function updateSeekBar() {
    if (!isNaN(elements.audio.duration) && elements.audio.duration > 0) {
      const percentage =
        (elements.audio.currentTime / elements.audio.duration) * 100;
      elements.seek.value = percentage;
      elements.curTime.textContent = formatTime(elements.audio.currentTime);
    }
    seekUpdateAnimation = requestAnimationFrame(updateSeekBar);
  }
  updateSeekBar();
}
function stopSeekUpdates() {
  if (seekUpdateAnimation) {
    cancelAnimationFrame(seekUpdateAnimation);
    seekUpdateAnimation = null;
  }
}
elements.seek.addEventListener("input", () => {
  if (isNaN(elements.audio.duration) || elements.audio.duration === 0) return;
  const percentage = Number(elements.seek.value) / 100;
  elements.audio.currentTime = percentage * elements.audio.duration;
});
elements.volume.addEventListener("input", () => {
  elements.audio.volume = Number(elements.volume.value);
});
elements.searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchSongs();
});
elements.searchBtn.addEventListener("click", searchSongs);
elements.coverImg.addEventListener("click", () => {
  if (!elements.audio.src) return;
  if (elements.audio.paused) {
    elements.audio.play();
  } else {
    elements.audio.pause();
  }
});
elements.vinyl.style.animationPlayState = "paused";