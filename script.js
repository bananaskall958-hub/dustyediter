let video = document.getElementById('mainVideo');
let timelineCanvas = document.getElementById('timelineCanvas');
let ctx = timelineCanvas.getContext('2d');
let overlayContainer = document.getElementById('overlayContainer');

let duration = 0;
let trimStart = 0;
let trimEnd = 0;
let isDraggingTrim = null;
let overlays = []; // Store text overlays

// Upload Video
document.getElementById('videoUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    video.src = URL.createObjectURL(file);
  }
});

video.addEventListener('loadedmetadata', () => {
  duration = video.duration;
  trimEnd = duration;
  document.getElementById('durationDisplay').textContent = `Duration: ${formatTime(duration)}`;
  resizeCanvas();
  updateTimeline();
});

// ====================== VIDEO CONTROLS ======================
const playPauseBtn = document.getElementById('playPauseBtn');
playPauseBtn.addEventListener('click', () => {
  video.paused ? video.play() : video.pause();
  playPauseBtn.textContent = video.paused ? '▶' : '⏸';
});

document.getElementById('seekBar').addEventListener('input', (e) => {
  if (duration) video.currentTime = (e.target.value / 100) * duration;
});

video.addEventListener('timeupdate', () => {
  const percent = duration ? (video.currentTime / duration) * 100 : 0;
  document.getElementById('playhead').style.left = `${percent}%`;
  document.getElementById('timeDisplay').textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
  document.getElementById('seekBar').value = percent;
});

// ====================== TIMELINE ======================
document.getElementById('timeline').addEventListener('click', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  video.currentTime = percent * duration;
});

function resizeCanvas() {
  timelineCanvas.width = document.getElementById('timeline').clientWidth;
  timelineCanvas.height = 160;
}

function updateTimeline() {
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(0, 0, timelineCanvas.width, timelineCanvas.height);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 50, timelineCanvas.width, 60);

  const startX = (trimStart / duration) * timelineCanvas.width;
  const endX = (trimEnd / duration) * timelineCanvas.width;
  ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
  ctx.fillRect(startX, 40, endX - startX, 80);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ====================== TEXT OVERLAYS ======================
document.getElementById('addTextBtn').addEventListener('click', () => {
  addTextOverlay("Your Text Here");
});

function addTextOverlay(text) {
  const overlay = document.createElement('div');
  overlay.className = `absolute text-white text-4xl font-bold cursor-move select-none pointer-events-auto
                       px-4 py-2 rounded-lg border border-white/30 bg-black/30`;
  overlay.contentEditable = true;
  overlay.textContent = text;
  overlay.style.left = '40%';
  overlay.style.top = '40%';
  overlay.style.transform = 'translate(-50%, -50%)';

  overlayContainer.appendChild(overlay);

  makeDraggable(overlay);

  overlays.push({
    element: overlay,
    text: text,
    x: 0.4,
    y: 0.4
  });
}

function makeDraggable(el) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  el.addEventListener('mousedown', dragMouseDown);

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.addEventListener('mouseup', closeDragElement);
    document.addEventListener('mousemove', elementDrag);
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.removeEventListener('mouseup', closeDragElement);
    document.removeEventListener('mousemove', elementDrag);
  }
}

// ====================== SMART AI ======================
const aiChat = document.getElementById('aiChat');
const aiInput = document.getElementById('aiInput');
const aiSendBtn = document.getElementById('aiSendBtn');

function addMessage(text, isUser = false) {
  const div = document.createElement('div');
  div.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  div.innerHTML = `<div class="${isUser ? 'bg-red-600' : 'bg-gray-700'} px-4 py-3 rounded-2xl max-w-[85%]">${text}</div>`;
  aiChat.appendChild(div);
  aiChat.scrollTop = aiChat.scrollHeight;
}

aiSendBtn.addEventListener('click', processAICommand);
aiInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') processAICommand();
});

function processAICommand() {
  let cmd = aiInput.value.trim();
  if (!cmd) return;

  addMessage(cmd, true);
  aiInput.value = "";

  cmd = cmd.toLowerCase();

  if (cmd.includes("add text") || cmd.includes("text ")) {
    const text = cmd.replace(/add text|text /i, "").trim() || "New Text";
    addTextOverlay(text);
    addMessage(`✅ Added text: "${text}"`);
  }
  else if (cmd.includes("speed") || cmd.includes("x")) {
    const speed = parseFloat(cmd.match(/\d+\.?\d*/)?.[0]) || 1;
    video.playbackRate = Math.max(0.25, Math.min(4, speed));
    addMessage(`✅ Speed set to ${video.playbackRate}x`);
  }
  else if (cmd.includes("trim")) {
    addMessage("✅ Use blue handles on timeline to trim");
  }
  else {
    addMessage("🤖 Try these commands:<br>• add text Hello Bro<br>• speed 1.5x<br>• trim");
  }
}

// Export
document.getElementById('exportBtn').addEventListener('click', () => {
  alert("Exporting...\n\nText overlays + trim will be included in final export (FFmpeg coming soon)");
});

// Resize handler
window.addEventListener('resize', () => {
  resizeCanvas();
  updateTimeline();
});
