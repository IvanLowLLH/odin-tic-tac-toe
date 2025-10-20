function Cell() {
    let value = 0;
    const addToken = (player) => {
        value = player;
    };
    const getValue = () => value;

    return {addToken, getValue}
}

const gameBoard = (function () {
    const rows = 3;
    const cols = 3;
    const board = [];

    // Create 2D board
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const addToken = (row, col, playerToken) => {
        board[row][col].addToken(playerToken);
    };

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(boardWithCellValues);
    };

    return {getBoard, addToken, printBoard}

})();

function GameController (playerOneName = "Player One", playerTwoName = "PlayerTwo") {
    const players = [
        {
            name: playerOneName,
            token: "x"
        },
        {
            name: playerTwoName,
            token: "o"
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        gameBoard.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    const playRound = (row, col) => {
        gameBoard.addToken(row, col, getActivePlayer().token);
        console.log(`${getActivePlayer().name} has added ${getActivePlayer().token} onto row ${row} and col ${col}`);

        switchPlayerTurn();
        printNewRound();
    };

    // Init game
    printNewRound();

    return {playRound, getActivePlayer}
}

window.game = GameController();