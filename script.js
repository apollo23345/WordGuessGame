// State Variables
const targetWord = ['T', 'I', 'P'];
let wordProgress = ['_', '_', '_'];
let wrongLetters = [];
let guessedLetters = [];
let rewardPoints = 0;
let isGameOver = false;

// DOM Elements
const wordDisplayEl = document.getElementById('word-display');
const inputEl = document.getElementById('letter-input');
const guessBtn = document.getElementById('guess-btn');
const messageEl = document.getElementById('message');
const pointsEl = document.getElementById('points');
const mistakesEl = document.getElementById('mistakes');
const wrongLettersEl = document.getElementById('wrong-letters');
const restartBtn = document.getElementById('restart-btn');

// Initial Setup
function updateUI() {
  wordDisplayEl.textContent = wordProgress.join(' ');
  pointsEl.textContent = `$${rewardPoints}`;
  mistakesEl.textContent = `${wrongLetters.length} / 3`;
  wrongLettersEl.textContent = wrongLetters.length > 0 ? wrongLetters.join(', ') : 'None';
}

function guessMe(letter) {
  if (isGameOver || !letter) return;

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
  } else {
    rewardPoints = Math.max(0, rewardPoints - randomReward);
    wrongLetters.push(inputLetter);
    messageEl.textContent = `Ohhhhhh nooooo! That's not the right letter! (-${randomReward} pts)`;
    messageEl.style.color = '#c0392b';
  }

  updateUI();

  // Win Condition
  if (!wordProgress.includes('_')) {
    isGameOver = true;
    messageEl.textContent = `You won! Good Job! Final Reward: $${rewardPoints}`;
    endGame();
    return;
  }

  // Lose Condition (3 Mistakes)
  if (wrongLetters.length >= 3) {
    isGameOver = true;
    messageEl.textContent = `Game Over! You reached 3 mistakes. Goodbye!`;
    endGame();
  }
}

function endGame() {
  inputEl.disabled = true;
  guessBtn.disabled = true;
  restartBtn.classList.remove('hidden');
}

// Event Listeners
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

updateUI();