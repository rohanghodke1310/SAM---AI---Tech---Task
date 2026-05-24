// ── SONG DATA ──────────────────────────────────────────────
const songs = [
  { title: "Blinding Lights", artist: "The Weeknd",    emoji: "🎸", duration: 200 },
  { title: "Shape of You",    artist: "Ed Sheeran",    emoji: "🎹", duration: 233 },
  { title: "Levitating",      artist: "Dua Lipa",      emoji: "🎺", duration: 203 },
  { title: "Stay",            artist: "The Kid LAROI", emoji: "🥁", duration: 141 },
  { title: "Peaches",         artist: "Justin Bieber", emoji: "🎷", duration: 198 },
];

// ── STATE ──────────────────────────────────────────────────
let currentIndex = 0;
let isPlaying    = false;
let isShuffle    = false;
let isRepeat     = false;
let volume       = 70;
let currentTime  = 0;
let timer        = null;

// ── ELEMENTS ───────────────────────────────────────────────
const playBtn       = document.getElementById('playBtn');
const playIcon      = document.getElementById('playIcon');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const shuffleBtn    = document.getElementById('shuffleBtn');
const repeatBtn     = document.getElementById('repeatBtn');
const songTitle     = document.getElementById('songTitle');
const songArtist    = document.getElementById('songArtist');
const albumEmoji    = document.getElementById('albumEmoji');
const albumInner    = document.querySelector('.album-inner');
const equalizer     = document.getElementById('equalizer');
const progressFill  = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const progressWrap  = document.getElementById('progressWrap');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl   = document.getElementById('totalTime');
const volumeSlider  = document.getElementById('volumeSlider');
const volLabel      = document.getElementById('volLabel');
const playlistItems = document.querySelectorAll('.playlist-item');

// ── FORMAT TIME ────────────────────────────────────────────
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── LOAD SONG ──────────────────────────────────────────────
function loadSong(index) {
  const song = songs[index];
  songTitle.textContent   = song.title;
  songArtist.textContent  = song.artist;
  albumEmoji.textContent  = song.emoji;
  totalTimeEl.textContent = formatTime(song.duration);
  currentTime = 0;
  currentTimeEl.textContent = '0:00';
  progressFill.style.width  = '0%';
  progressThumb.style.left  = '0%';

  // Update playlist highlight
  playlistItems.forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
}

// ── PLAY / PAUSE ───────────────────────────────────────────
function togglePlay() {
  isPlaying = !isPlaying;

  if (isPlaying) {
    playIcon.className = 'fas fa-pause';
    albumInner.classList.add('spinning');
    equalizer.classList.add('playing');
    startTimer();
  } else {
    playIcon.className = 'fas fa-play';
    albumInner.classList.remove('spinning');
    equalizer.classList.remove('playing');
    stopTimer();
  }
}

// ── TIMER ─────────────────────────────────────────────────
function startTimer() {
  stopTimer();
  timer = setInterval(() => {
    const song = songs[currentIndex];
    currentTime++;

    if (currentTime >= song.duration) {
      if (isRepeat) {
        currentTime = 0;
      } else {
        nextSong();
        return;
      }
    }

    const pct = (currentTime / song.duration) * 100;
    progressFill.style.width  = pct + '%';
    progressThumb.style.left  = pct + '%';
    currentTimeEl.textContent = formatTime(currentTime);
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

// ── PREV / NEXT ────────────────────────────────────────────
function prevSong() {
  if (currentTime > 3) {
    currentTime = 0;
    loadSong(currentIndex);
    if (isPlaying) startTimer();
    return;
  }
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  if (isPlaying) startTimer();
}

function nextSong() {
  if (isShuffle) {
    let rand;
    do { rand = Math.floor(Math.random() * songs.length); } while (rand === currentIndex);
    currentIndex = rand;
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  loadSong(currentIndex);
  if (isPlaying) startTimer();
}

// ── PROGRESS CLICK ─────────────────────────────────────────
progressWrap.addEventListener('click', (e) => {
  const rect = progressWrap.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  currentTime = Math.floor(pct * songs[currentIndex].duration);
  progressFill.style.width  = (pct * 100) + '%';
  progressThumb.style.left  = (pct * 100) + '%';
  currentTimeEl.textContent = formatTime(currentTime);
});

// ── VOLUME ─────────────────────────────────────────────────
volumeSlider.addEventListener('input', () => {
  volume = volumeSlider.value;
  volLabel.textContent = volume + '%';
});

// ── SHUFFLE ────────────────────────────────────────────────
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
});

// ── REPEAT ─────────────────────────────────────────────────
repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active', isRepeat);
});

// ── PLAYLIST CLICK ─────────────────────────────────────────
playlistItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    currentIndex = index;
    loadSong(currentIndex);
    if (!isPlaying) togglePlay();
    else startTimer();
  });
});

// ── CONTROLS ───────────────────────────────────────────────
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// ── KEYBOARD SHORTCUTS ─────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space')      { e.preventDefault(); togglePlay(); }
  if (e.code === 'ArrowRight') nextSong();
  if (e.code === 'ArrowLeft')  prevSong();
});

// ── INIT ───────────────────────────────────────────────────
loadSong(currentIndex);