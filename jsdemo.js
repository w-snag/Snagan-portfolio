const modeBox = document.querySelector(".mode-box"),
      selectBox = document.querySelector(".select-box"),
      selectBtnX = document.querySelector(".playerX"),
      selectBtnO = document.querySelector(".playerO"),
      playBoard = document.querySelector(".play-board"),
      players = document.querySelector(".players"),
      allBox = document.querySelectorAll(".play-area span"),
      resultBox = document.querySelector(".result-box"),
      wonText = document.querySelector(".won-text"),
      replayBtn = document.querySelector(".btn button");

const xScoreEl = document.getElementById("x-score");
const oScoreEl = document.getElementById("o-score");
const drawScoreEl = document.getElementById("draw-score");
const difficultySelect = document.getElementById("difficulty");
const difficultyBox = document.getElementById("difficulty-box");

let gameMode = "AI";
let userSign = "X", aiSign = "O", currentTurn = "X";
let runGame = true;
let difficulty = "easy";

let xScore = 0, oScore = 0, drawScore = 0;

const iconMap = {
  X: "fas fa-times",
  O: "far fa-circle"
};

document.getElementById("ai-mode").onclick = () => {
  gameMode = "AI";
  difficultyBox.style.display = "block";
  modeBox.style.display = "none";
  selectBox.classList.add("show");
};

document.getElementById("two-player").onclick = () => {
  gameMode = "2P";
  difficultyBox.style.display = "none";
  modeBox.style.display = "none";
  selectBox.classList.add("show");
};

difficultySelect.onchange = () => {
  difficulty = difficultySelect.value;
};

selectBtnX.onclick = () => startGame("X");
selectBtnO.onclick = () => startGame("O");

function startGame(sign) {
  userSign = sign;
  aiSign = sign === "X" ? "O" : "X";
  currentTurn = "X";
  runGame = true;

  allBox.forEach(box => {
    box.innerHTML = "";
    box.id = "";
    box.style.pointerEvents = "auto";
  });

  selectBox.classList.remove("show");
  resultBox.classList.remove("show");
  playBoard.classList.add("show");

  updateTurnIndicator();
}

function updateTurnIndicator() {
  players.classList.toggle("active", currentTurn === "O");
}

window.onload = () => {
  allBox.forEach(box => box.onclick = () => boxClick(box));
};

function boxClick(box) {
  if (!runGame || box.id) return;

  markBox(box, currentTurn);

  if (checkWinner(currentTurn)) return endGame(`${currentTurn} wins!`);
  if (isDraw()) return endGame("Draw!");

  currentTurn = currentTurn === "X" ? "O" : "X";
  updateTurnIndicator();

  if (gameMode === "AI" && currentTurn === aiSign) {
    playBoard.style.pointerEvents = "none";
    setTimeout(() => {
      difficulty === "easy" ? easyBot() : hardBot();
      playBoard.style.pointerEvents = "auto";
    }, Math.random() * 800 + 200);
  }
}

function markBox(box, sign) {
  box.innerHTML = `<i class="${iconMap[sign]}"></i>`;
  box.id = sign;
  box.style.pointerEvents = "none";
}

function easyBot() {
  const available = [...allBox].filter(box => !box.id);
  const randomBox = available[Math.floor(Math.random() * available.length)];
  markBox(randomBox, aiSign);
  if (checkWinner(aiSign)) return endGame(`${aiSign} wins!`);
  if (isDraw()) return endGame("Draw!");
  currentTurn = userSign;
  updateTurnIndicator();
}

function hardBot() {
  const bestMove = minimax([...allBox], aiSign);
  const bestBox = allBox[bestMove.index];
  markBox(bestBox, aiSign);
  if (checkWinner(aiSign)) return endGame(`${aiSign} wins!`);
  if (isDraw()) return endGame("Draw!");
  currentTurn = userSign;
  updateTurnIndicator();
}

function minimax(newBoard, player) {
  const availSpots = newBoard
    .map((b, i) => b.id === "" ? i : null)
    .filter(i => i !== null);

  if (checkStaticWin(newBoard, userSign)) return { score: -10 };
  if (checkStaticWin(newBoard, aiSign)) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  let moves = [];

  for (let i of availSpots) {
    const backup = newBoard[i].id;
    newBoard[i].id = player;

    const result = minimax(newBoard, player === aiSign ? userSign : aiSign);
    newBoard[i].id = backup;

    moves.push({ index: i, score: result.score });
  }

  const bestMove = player === aiSign
    ? moves.reduce((best, move) => move.score > best.score ? move : best)
    : moves.reduce((best, move) => move.score < best.score ? move : best);

  return bestMove;
}

function checkStaticWin(board, sign) {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return winCombos.some(combo =>
    combo.every(i => board[i].id === sign));
}

function checkWinner(sign) {
  const combos = [
    [1,2,3],[4,5,6],[7,8,9],
    [1,4,7],[2,5,8],[3,6,9],
    [1,5,9],[3,5,7]
  ];
  return combos.some(combo =>
    combo.every(n => document.querySelector(`.box${n}`).id === sign));
}

function isDraw() {
  return [...allBox].every(box => box.id);
}

function endGame(message) {
  runGame = false;

  if (message.includes("Draw")) {
    drawScore++;
    drawScoreEl.textContent = drawScore;
  } else if (message.includes("X")) {
    xScore++;
    xScoreEl.textContent = xScore;
  } else {
    oScore++;
    oScoreEl.textContent = oScore;
  }

  setTimeout(() => {
    resultBox.classList.add("show");
    playBoard.classList.remove("show");
    wonText.innerHTML = message;
  }, 500);
}

replayBtn.onclick = () => {
  startGame(userSign); // maintain sign & mode
};
