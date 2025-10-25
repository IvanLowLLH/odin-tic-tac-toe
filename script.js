function Cell() {
    let value = "";
    let winStatus = false;
    const addToken = (player) => {
        value = player;
    };
    const getValue = () => value;
    const getWin = () => winStatus;
    const setWin = () => {
        winStatus = true;
    }

    return { addToken, getValue, getWin, setWin }
}

const gameBoard = (function () {
    const rows = 3;
    const cols = 3;
    const board = [];
    let totalEmptyCells = rows * cols;
    let gameWin = false;

    // Create 2D board
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;
    const getWin = () => gameWin;

    const addToken = (row, col, playerToken) => {
        board[row][col].addToken(playerToken);
        totalEmptyCells--;
    };

    const checkTokenExist = (row, col) => {
        const cell = board[row][col];
        if (cell.getValue() !== "") {
            return true;
        }
    }

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(boardWithCellValues);
    };

    const checkWinCondition = (rowIndex, colIndex) => {
        // Check match in clicked row
        if (checkMatch(board[rowIndex])){
            gameWin = true;
            return;
        }
        
        // Check match in clicked column
        const col_tokens = [];
        for (let i = 0; i < rows; i ++) {
            col_tokens.push(board[i][colIndex]);
        }
        if (checkMatch(col_tokens)) {
            gameWin = true;
            return;
        }

        // Check diagonals
        const firstDiagonal = [board[0][0], board[1][1], board[2][2]];
        if (checkMatch(firstDiagonal)) {
            gameWin = true;
            return;
        }
        const secondDiagonal = [board[2][0], board[1][1], board[0][2]];
        if (checkMatch(secondDiagonal)) {
            gameWin = true;
            return;
        }
    }

    const checkMatch = (tokenList) => {
        const [firstCell, secondCell, thirdCell] = tokenList;
        let firstToken = firstCell.getValue();
        let secondToken = secondCell.getValue();
        let thirdToken = thirdCell.getValue();
        // Check if all tokens are not empty strings and they match
        if (
            firstToken !== '' &&
            secondToken !== '' &&
            thirdToken !== '' &&
            firstToken === secondToken &&
            secondToken === thirdToken
        ) {
            firstCell.setWin();
            secondCell.setWin();
            thirdCell.setWin();
            return true;
        }
        return false;
    }

    function checkBoardFilled () {
        if (totalEmptyCells === 0) {
            return true;
        }
        else {
            return false;
        }
    }

    function restartBoard () {

        board.forEach(row => {
            row.forEach(cell => {
                cell.addToken("");
            })
        })
        totalEmptyCells = rows * cols;
        gameWin = false;
    }

    return { getBoard, getWin, addToken, printBoard, 
        checkWinCondition, checkTokenExist, checkBoardFilled, restartBoard}

})();

const GameController = (function () {
    let players = [
        {
            name: "Player One",
            token: "X"
        },
        {
            name: "Player Two",
            token: "O"
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const restartActivePlayer = () => {
        activePlayer = players[0];
    }

    const setPlayerName = (playerIndex, playerName) => {
        players[playerIndex].name = playerName;
    }

    const printNewRound = () => {
        gameBoard.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    const playRound = (row, col) => {
        gameBoard.addToken(row, col, getActivePlayer().token);
        console.log(`${getActivePlayer().name} has added ${getActivePlayer().token} onto row ${row} and col ${col}`);
        gameBoard.checkWinCondition(row, col)

        if (gameBoard.getWin()) {
            return { gameOver: true, winner: `${getActivePlayer().name}` }
        }
        else {
            switchPlayerTurn();
            printNewRound();
            return { gameOver: false, winner: `` }
        }
    };

    // Init game
    printNewRound();

    return {playRound, getActivePlayer, restartActivePlayer, setPlayerName}
})();


function ScreenController() {
    const playerTurnDisplay = document.querySelector(".turn-display");
    const boardDiv = document.querySelector(".board-container");

    const generateBoard = () => {
        // Clear board
        boardDiv.textContent = ""
        const board = gameBoard.getBoard();

        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                cellButton.dataset.rowIndex = rowIndex;
                cellButton.dataset.colIndex = colIndex;
                cellButton.dataset.win = "false"
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            })
        })
        // Initial player display
        updatePlayerStatusDisplay();
    }

    function updatePlayerStatusDisplay() {
        const activePlayer = GameController.getActivePlayer();
        playerTurnDisplay.textContent = `${activePlayer.name}'s turn`;
    }

    function updateStatusDisplay (gameStatus) {
        if (gameStatus.gameOver) {
            playerTurnDisplay.textContent = `${gameStatus.winner} has won!`;
        }
        else if (gameBoard.checkBoardFilled()) {
            playerTurnDisplay.textContent = `Draw! Restart game.`;
        }
        else {
            updatePlayerStatusDisplay();
        }
    }

    const updateBoardDisplay = (gameStatus, rowIndex, colIndex) => {
        // Update rendered board
        const board = gameBoard.getBoard();
        const selectedButton = document.querySelector(`[data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`);
        selectedButton.textContent = board[rowIndex][colIndex].getValue();
        if (gameStatus.gameOver) {
            updateWinCells();
        }
    }

    function updateWinCells() {
        // Find cells with winStatus = true
        const board = gameBoard.getBoard();
        const winIndices = [];
        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell.getWin()) {
                    winIndices.push([rowIndex, colIndex])
                }
            })
        })
        // Update buttons win attribute
        winIndices.forEach((indices) => {
            const winButton = document.querySelector(`[data-row-index="${indices[0]}"][data-col-index="${indices[1]}"]`);
            winButton.dataset.win = "true";
        })
    }

    function clickGridBoard(event) {
        const selectedRow = event.target.dataset.rowIndex;
        const selectedCol = event.target.dataset.colIndex;

        if (!selectedRow || !selectedCol) {
            return
        }
        // Stop game if someone won or token already filled
        if (gameBoard.getWin() || gameBoard.checkTokenExist(selectedRow, selectedCol)) {
            return
        }
        const gameStatus = GameController.playRound(selectedRow, selectedCol);
        updateStatusDisplay(gameStatus);
        updateBoardDisplay(gameStatus, selectedRow, selectedCol);
    }

    function restartGame() {
        gameBoard.restartBoard();
        GameController.restartActivePlayer();
        generateBoard();
    }

    boardDiv.addEventListener("click", clickGridBoard);
    const restartButton = document.querySelector("#restart-btn");
    restartButton.addEventListener("click", restartGame)

    generateBoard();
}

ScreenController();