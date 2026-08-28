// Game State
const targetWord = ['T', 'I', 'P'];
let wordProgress = ['_', '_', '_'];
let wrongLetters = [];
let guessedLetters = [];
let rewardPoints = 0;
let isGameOver = false;
let isMuted = false;

// DOM Elements
const wordDisplayEl = document.getElementById('word-display');
const inputEl = document.getElementById('letter-input');
const guessBtn = document.getElementById('guess-btn');
const messageEl = document.getElementById('message');
const pointsEl = document.getElementById('points');
const mistakesEl = document.getElementById('mistakes');
const wrongLettersEl = document.getElementById('wrong-letters');
const restartBtn = document.getElementById('restart-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');

// -------------------------------------------------------------
// AUDIO SYSTEM (Web Audio API)
// -------------------------------------------------------------
let audioCtx = null;
let bgmInterval = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    startBgMusic();
  }
}

// 1. Correct Guess Sound (Upward Chime)
function playCorrectSound() {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

// 2. Wrong Guess Sound (Low Buzz)
function playWrongSound() {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

// 3. Victory Sound Fanfare
function playWinSound() {
  if (isMuted || !audioCtx) return;
  stopBgMusic();
  const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const startTime = audioCtx.currentTime + idx * 0.12;

    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
}

// 4. Game Over / Lose Sound
function playLoseSound() {
  if (isMuted || !audioCtx) return;
  stopBgMusic();
  const notes = [200, 170, 140, 110];
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const startTime = audioCtx.currentTime + idx * 0.15;

    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.25);
  });
}

// 5. Background Music Loop (Soft ambient melody)
function startBgMusic() {
  if (bgmInterval || isMuted) return;
  
  const notes = [261.63, 293.66, 329.63, 349.23];
  let noteIdx = 0;

  bgmInterval = setInterval(() => {
    if (isMuted || !audioCtx || isGameOver) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = notes[noteIdx % notes.length];
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime); // Soft volume
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);

    noteIdx++;
  }, 800);
}

function stopBgMusic() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}

// -------------------------------------------------------------
// GAME LOGIC
// -------------------------------------------------------------
function updateUI() {
  wordDisplayEl.textContent = wordProgress.join(' ');
  pointsEl.textContent = `$${rewardPoints}`;
  mistakesEl.textContent = `${wrongLetters.length} / 3`;
  wrongLettersEl.textContent = wrongLetters.length > 0 ? wrongLetters.join(', ') : 'None';
}

function guessMe(letter) {
  if (isGameOver || !letter) return;

  initAudio(); // Initialize audio context on first interaction

  const inputLetter = letter.toUpperCase();

  // Rule: Duplicate guess -> Do nothing
  if (guessedLetters.includes(inputLetter)) {
    inputEl.value = '';
    return;
  }

  guessedLetters.push(inputLetter);

  let letterFound = false;
  let matchesCount = 0;

  for (let i = 0; i < targetWord.length; i++) {
    if (targetWord[i] === inputLetter) {
      wordProgress[i] = inputLetter;
      letterFound = true;
      matchesCount++;
    }
  }

  const randomReward = Math.floor(Math.random() * 41) + 10;

  if (letterFound) {
    const totalEarned = randomReward * matchesCount;
    rewardPoints += totalEarned;
    messageEl.textContent = `Yes!!! You found a letter! (+${totalEarned} pts)`;
    messageEl.style.color = '#27ae60';
    playCorrectSound();
  } else {
    rewardPoints = Math.max(0, rewardPoints - randomReward);
    wrongLetters.push(inputLetter);
    messageEl.textContent = `Ohhhhhh nooooo! That's not the right letter! (-${randomReward} pts)`;
    messageEl.style.color = '#c0392b';
    playWrongSound();
  }

  updateUI();

  // Win Condition
  if (!wordProgress.includes('_')) {
    isGameOver = true;
    messageEl.textContent = `You won! Good Job! Final Reward: $${rewardPoints}`;
    playWinSound();
    endGame();
    return;
  }

  // Lose Condition (3 Mistakes)
  if (wrongLetters.length >= 3) {
    isGameOver = true;
    messageEl.textContent = `Game Over! You reached 3 mistakes. Goodbye!`;
    playLoseSound();
    endGame();
  }
}

function endGame() {
  inputEl.disabled = true;
  guessBtn.disabled = true;
  restartBtn.classList.remove('hidden');
}

// -------------------------------------------------------------
// EVENT LISTENERS
// -------------------------------------------------------------
guessBtn.addEventListener('click', () => {
  guessMe(inputEl.value.trim());
  inputEl.value = '';
  inputEl.focus();
});

inputEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    guessBtn.click();
  }
});

restartBtn.addEventListener('click', () => {
  location.reload();
});

soundToggleBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  soundToggleBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound On';
  if (!isMuted && audioCtx) {
    startBgMusic();
  }
});

updateUI();