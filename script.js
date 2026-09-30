// ========================================================
// 1. HARDCODED VIDEO REPOSITORY
// ========================================================
const FILE_ID_1 = "6af5e887ac425715720bb771154";        // Your first MEGA File ID
const FILE_ID_2 = "d925669e054c6a55ccbb6d3dc63"; // Paste your second MEGA File ID here

const VIDEOS = {
  "card-1": {
    fileId: FILE_ID_1,
    title: "Barbarian"
  },
  "card-2": {
    fileId: FILE_ID_2,
    title: "Presence"
  }
};

// In-memory key caching per session (wiped automatically on page refresh)
const cachedKeys = {
  "card-1": "",
  "card-2": ""
};

let currentCardId = null;
let fadeTimeout = null;

// ========================================================
// 2. DOM ELEMENTS
// ========================================================
const lockModal = document.getElementById("lock-modal");
const keyInput = document.getElementById("key-input");
const unlockBtn = document.getElementById("unlock-btn");
const cancelBtn = document.getElementById("cancel-btn");
const errorText = document.getElementById("error-text");
const modalTitle = document.getElementById("modal-video-title");

const playerModal = document.getElementById("player-modal");
const playerContainer = document.getElementById("player-container");
const playerFrame = document.getElementById("active-player");
const currentPlayerTitle = document.getElementById("current-player-title");
const fsBtn = document.getElementById("fs-btn");
const exitFsBtn = document.getElementById("exit-fs-btn");
const closePlayerBtn = document.getElementById("close-player-btn");
const videoCards = document.querySelectorAll(".video-card");

// ========================================================
// 3. CARD CLICKS -> PROMPT OR PLAY
// ========================================================
videoCards.forEach((card) => {
  card.addEventListener("click", () => {
    currentCardId = card.id;
    const video = VIDEOS[currentCardId];

    // If key was already supplied earlier in this browser session, open directly
    if (cachedKeys[currentCardId]) {
      startPlayback(video.fileId, cachedKeys[currentCardId], video.title);
      return;
    }

    // Otherwise, show Netflix-style unlock modal
    modalTitle.innerText = `Unlock ${video.title}`;
    keyInput.value = "";
    errorText.style.display = "none";
    lockModal.style.display = "flex";
    keyInput.focus();
  });
});

// ========================================================
// 4. UNLOCK SUBMISSION
// ========================================================
function handleUnlock() {
  const enteredKey = keyInput.value.trim();

  if (!enteredKey || enteredKey.length < 5) {
    errorText.style.display = "block";
    return;
  }

  // Save to memory
  cachedKeys[currentCardId] = enteredKey;
  errorText.style.display = "none";
  lockModal.style.display = "none";

  const video = VIDEOS[currentCardId];
  startPlayback(video.fileId, enteredKey, video.title);
}

unlockBtn.addEventListener("click", handleUnlock);
keyInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleUnlock();
});

cancelBtn.addEventListener("click", () => {
  lockModal.style.display = "none";
});

// ========================================================
// 5. PLAYER LAUNCH & SHUTDOWN
// ========================================================
function startPlayback(fileId, key, title) {
  currentPlayerTitle.innerText = title;
  playerFrame.src = `https://avcaption.com/watch/${fileId}${key}`;
  playerModal.style.display = "flex";
}

function stopPlayback() {
  playerFrame.src = ""; // Stops playback and network traffic immediately
  playerModal.style.display = "none";

  // Exit fullscreen if active
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
}

closePlayerBtn.addEventListener("click", stopPlayback);

// ========================================================
// 6. CUSTOM FULLSCREEN & AUTO-HIDE BUTTON
// ========================================================
function toggleFullscreen() {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (!isFs) {
    if (playerContainer.requestFullscreen) playerContainer.requestFullscreen();
    else if (playerContainer.webkitRequestFullscreen) playerContainer.webkitRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
}

fsBtn.addEventListener("click", toggleFullscreen);
exitFsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleFullscreen();
});

function showExitButton() {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (!isFs) return;

  exitFsBtn.classList.add("visible");
  if (fadeTimeout) clearTimeout(fadeTimeout);

  fadeTimeout = setTimeout(() => {
    exitFsBtn.classList.remove("visible");
  }, 3000);
}

playerContainer.addEventListener("mousemove", showExitButton);
playerContainer.addEventListener("touchstart", showExitButton, { passive: true });
playerContainer.addEventListener("click", showExitButton);

function handleFsChange() {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (isFs) {
    fsBtn.innerText = "Exit Fullscreen";
    showExitButton();
  } else {
    fsBtn.innerText = "⛶ Fullscreen";
    exitFsBtn.classList.remove("visible");
    if (fadeTimeout) clearTimeout(fadeTimeout);
  }
}

document.addEventListener("fullscreenchange", handleFsChange);
document.addEventListener("webkitfullscreenchange", handleFsChange);
