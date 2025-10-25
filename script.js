function Cell() {
    let value = "";
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
            return true;
        }
        return false;
    }

    function restartBoard () {

        board.forEach(row => {
            row.forEach(cell => {
                cell.addToken("");
            })
        })
        gameWin = false;
    }

    return { getBoard, getWin, addToken, printBoard, checkWinCondition, checkTokenExist, restartBoard}

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
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            })
        })
    }

    const updateScreen = (rowIndex, colIndex) => {
        // Update display
        const activePlayer = GameController.getActivePlayer();
        if (!gameBoard.getWin()){
            playerTurnDisplay.textContent = `${activePlayer.name}'s turn`;
        }
        // Update rendered board
        const board = gameBoard.getBoard();
        const selectedButton = document.querySelector(`[data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`);
        selectedButton.textContent = board[rowIndex][colIndex].getValue();
    }

    function clickGridBoard(event) {
        const selectedRow = event.target.dataset.rowIndex;
        const selectedCol = event.target.dataset.colIndex;

        if (!selectedRow || !selectedCol) {
            return
        }
        // Stop game if someone won
        if (gameBoard.getWin() || gameBoard.checkTokenExist(selectedRow, selectedCol)) {
            return
        }
        // TODO: Add check if cell is already filled
        const gameStatus = GameController.playRound(selectedRow, selectedCol);
        if (gameStatus.gameOver) {
            playerTurnDisplay.textContent = `${gameStatus.winner} has won!`
        }
        updateScreen(selectedRow, selectedCol);
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