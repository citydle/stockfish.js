let board, game, timerInterval, playerTime = 300, botTime = 300; // 5 minutes in seconds
const increment = 5; // 5-second increment

$(document).ready(function () {
  board = Chessboard('board', 'start');
  game = new Chess();

  $('#startBtn').on('click', startGame);
  $('#resetBtn').on('click', resetGame);
});

function startGame() {
  resetGame();
  timerInterval = setInterval(updateTimer, 1000);
  makeBotMove();
}

function resetGame() {
  clearInterval(timerInterval);
  game.reset();
  board.start();
  playerTime = 300;
  botTime = 300;
  $('#timer').text('Time: 5:00');
  $('#status').text('Game in progress');
}

function updateTimer() {
  if (game.turn() === 'w') {
    playerTime--;
  } else {
    botTime--;
  }

  if (playerTime <= 0 || botTime <= 0) {
    clearInterval(timerInterval);
    $('#status').text(game.turn() === 'w' ? 'You lost on time!' : 'Bot lost on time!');
    return;
  }

  $('#timer').text(Time: ${formatTime(playerTime)} | ${formatTime(botTime)});
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return ${mins}:${secs < 10 ? '0' : ''}${secs};
}

function makeBotMove() {
  if (game.game_over()) {
    $('#status').text('Game over! ' + (game.in_checkmate() ? 'Checkmate!' : 'Draw!'));
    return;
  }

  if (game.turn() === 'b') {
    const difficulty = parseInt($('#difficulty').val());
    const stockfish = new Worker('stockfish.js');
    stockfish.postMessage('uci');
    stockfish.postMessage(setoption name Skill Level value ${difficulty});
    stockfish.postMessage('position fen ' + game.fen());
    stockfish.postMessage('go depth 10');

    stockfish.onmessage = function (event) {
      if (event.data.startsWith('bestmove')) {
        const move = event.data.split(' ')[1];
        game.move(move);
        board.position(game.fen());
        stockfish.terminate();
        if (game.in_check()) $('#status').text('Check!');
        if (game.in_checkmate()) $('#status').text('Checkmate! You lost.');
      }
    };
  }
}

$('#board').on('dragStart', function (source, piece) {
  if (game.game_over() || game.turn() !== 'w' || piece.search(/^b/) !== -1) return false;
});

$('#board').on('drop', function (source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';
  board.position(game.fen());
  if (game.in_check()) $('#status').text('Check!');
  if (game.in_checkmate()) $('#status').text('Checkmate! You won.');
  setTimeout(makeBotMove, 500);
});
