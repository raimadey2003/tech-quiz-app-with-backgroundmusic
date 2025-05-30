// script.js
let currentQuestion = 0;
let score = 0;
let questions = [];
let currentUser = '';
let timer;
let timeLeft = 10;

const bgMusic = document.getElementById('bgMusic');
const correctSound = document.getElementById('correctSound');
const incorrectSound = document.getElementById('incorrectSound');
const toggleSoundBtn = document.getElementById('toggleSoundBtn');

let isMuted = false;

toggleSoundBtn.onclick = () => {
  isMuted = !isMuted;
  bgMusic.muted = correctSound.muted = incorrectSound.muted = isMuted;
  toggleSoundBtn.textContent = isMuted ? '🔇' : '🔊';
};

function startQuiz() {
  currentUser = document.getElementById('username').value.trim();
  if (!currentUser) return alert("Please enter your name!");

  document.getElementById('nameBox').style.display = 'none';
  document.getElementById('quizBox').style.display = 'block';
  document.getElementById('userNameDisplay').textContent = `Hello, ${currentUser}!`;

  bgMusic.volume = 0.3;
  bgMusic.play();

  fetch('/api/questions')
    .then(res => res.json())
    .then(data => {
      questions = data;
      loadQuestion();
    });
}

function loadQuestion() {
  clearInterval(timer);
  timeLeft = 10;
  updateTimerBar();
  startTimer();

  const q = questions[currentQuestion];
  document.getElementById('questionNumber').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  document.getElementById('question').textContent = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  q.options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.classList.add('option');
    btn.onclick = () => {
      checkAnswer(option, btn);
      clearInterval(timer);
    };
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(selected, btn) {
  const correct = questions[currentQuestion].answer;
  const allOptions = document.querySelectorAll('#options button');
  allOptions.forEach(button => button.disabled = true);

  if (selected === correct) {
    btn.classList.add('correct');
    score++;
    correctSound.play();
  } else {
    btn.classList.add('incorrect');
    incorrectSound.play();
    allOptions.forEach(button => {
      if (button.textContent === correct) {
        button.classList.add('correct');
      }
    });
  }

  document.getElementById('score').textContent = `Score: ${score}/${questions.length}`;
}

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    endQuiz();
  }
});

function endQuiz() {
  document.getElementById('quizBox').style.display = 'none';
  const scoreBox = document.getElementById('finalScoreBox');
  scoreBox.style.display = 'block';
  scoreBox.innerHTML = `
    <p>${currentUser}</p>
    <p>Score: ${score}/${questions.length}</p>
    <button id="playAgainBtn">▶️ Play Again</button>
  `;

  document.getElementById('playAgainBtn').addEventListener('click', resetQuiz);

  fetch('/api/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser, score })
  });
}

function resetQuiz() {
  currentQuestion = 0;
  score = 0;
  document.getElementById('score').textContent = `Score: 0/${questions.length}`;
  document.getElementById('finalScoreBox').style.display = 'none';
  document.getElementById('quizBox').style.display = 'block';
  loadQuestion();
}

function startTimer() {
  document.getElementById('timer').textContent = `Time left: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    updateTimerBar();
    document.getElementById('timer').textContent = `Time left: ${timeLeft}s`;
    if (timeLeft === 0) {
      clearInterval(timer);
      document.getElementById('nextBtn').click();
    }
  }, 1000);
}

function updateTimerBar() {
  const fill = document.getElementById('timer-fill');
  fill.style.width = `${(timeLeft / 10) * 100}%`;
}
