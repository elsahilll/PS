// --- CONFIGURATION ---
// Paste just your File ID here (the characters between /file/ or /embed/ and #)
const FILE_ID = "6af5e887ac425715720bb771154";
// In-memory key storage (cleared automatically when the page is refreshed)
let currentDecryptionKey = "";
let fadeTimeout = null;

// ========================================================
// 2. DOM ELEMENTS
// ========================================================
const lockScreen = document.getElementById("lock-screen");
const keyInput = document.getElementById("key-input");
const unlockBtn = document.getElementById("unlock-btn");
const errorText = document.getElementById("error-text");

const playerFrame = document.getElementById("active-player");
const playerContainer = document.getElementById("player-container");
const fsBtn = document.getElementById("fs-btn");
const exitFsBtn = document.getElementById("exit-fs-btn");

// ========================================================
// 3. UNLOCK & STREAM INITIALIZATION
// ========================================================
function handleUnlock() {
  const enteredKey = keyInput.value.trim();

  // Basic validation check
  if (!enteredKey || enteredKey.length < 5) {
    if (errorText) errorText.style.display = "block";
    return;
  }

  currentDecryptionKey = enteredKey;

  // Clear inputs and hide the unlock overlay
  keyInput.value = "";
  if (errorText) errorText.style.display = "none";
  if (lockScreen) lockScreen.style.display = "none";

  // Construct the embed URL and load into the iframe
  playerFrame.src = `https://avcaption.com/watch/${FILE_ID}${currentDecryptionKey}`;
}

// Unlock event listeners
if (unlockBtn) unlockBtn.addEventListener("click", handleUnlock);
if (keyInput) {
  keyInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUnlock();
  });
}

// ========================================================
// 4. FULLSCREEN TOGGLE LOGIC
// ========================================================
function enterFullscreen() {
  if (playerContainer.requestFullscreen) {
    playerContainer.requestFullscreen();
  } else if (playerContainer.webkitRequestFullscreen) {
    playerContainer.webkitRequestFullscreen(); // Safari / iOS
  } else if (playerContainer.msRequestFullscreen) {
    playerContainer.msRequestFullscreen(); // IE/Edge
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen(); // Safari / iOS
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen(); // IE/Edge
  }
}

function toggleFullscreen() {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (!isFs) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
}

if (fsBtn) fsBtn.addEventListener("click", toggleFullscreen);

if (exitFsBtn) {
  exitFsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    exitFullscreen();
  });
}

// ========================================================
// 5. AUTO-FADING EXIT BUTTON (TOUCH & MOUSE ACTIVITY)
// ========================================================
function showExitButton() {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (!isFs || !exitFsBtn) return;

  // Reveal the button
  exitFsBtn.classList.add("visible");

  // Reset any running hide countdown
  if (fadeTimeout) clearTimeout(fadeTimeout);

  // Fade out after 3 seconds of no interaction
  fadeTimeout = setTimeout(() => {
    exitFsBtn.classList.remove("visible");
  }, 3000);
}

// Listen for interactions on the container while in fullscreen
if (playerContainer) {
  playerContainer.addEventListener("mousemove", showExitButton);
  playerContainer.addEventListener("touchstart", showExitButton, { passive: true });
  playerContainer.addEventListener("click", showExitButton);
}

// Sync UI changes when fullscreen state toggles
function updateFsUI() {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);

  if (isFs) {
    if (fsBtn) fsBtn.innerText = "Exit Fullscreen";
    // Briefly display the exit button so the user knows where it is
    showExitButton();
  } else {
    if (fsBtn) fsBtn.innerText = "⛶ Fullscreen";
    if (exitFsBtn) exitFsBtn.classList.remove("visible");
    if (fadeTimeout) clearTimeout(fadeTimeout);
  }
}

document.addEventListener("fullscreenchange", updateFsUI);
document.addEventListener("webkitfullscreenchange", updateFsUI);