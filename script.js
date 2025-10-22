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

    const checkWinCondition = () => {
        // Check match in rows
        for (let i = 0; i < rows; i++) {
            if (checkMatch(board[i])){
                gameWin = true;
            }
        }
        
        // Check match in columns
        for (let j = 0; j < cols; j++) {
            const col_tokens = [];
            for (let i = 0; i < rows; i ++) {
                col_tokens.push(board[i][j]);
            }
            if (checkMatch(col_tokens)) {
                gameWin = true;
            }
        }

        // Check diagonals
        const firstDiagonal = [board[0][0], board[1][1], board[2][2]];
        if (checkMatch(firstDiagonal)) {
            gameWin = true;
        }
        const secondDiagonal = [board[2][0], board[1][1], board[0][2]];
        if (checkMatch(secondDiagonal)) {
            gameWin = true;
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

    return { getBoard, getWin, addToken, printBoard, checkWinCondition, checkTokenExist}

})();

const GameController = (function () {
    const players = [
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

    const printNewRound = () => {
        gameBoard.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    const playRound = (row, col) => {
        gameBoard.addToken(row, col, getActivePlayer().token);
        console.log(`${getActivePlayer().name} has added ${getActivePlayer().token} onto row ${row} and col ${col}`);
        gameBoard.checkWinCondition()

        if (gameBoard.getWin()) {
            console.log(`${getActivePlayer().name} has won!`);
            displayController.playerTurnDisplay.textContent = `${getActivePlayer().name} has won!`
        }

        switchPlayerTurn();
        printNewRound();
    };

    // Init game
    printNewRound();

    return {playRound, getActivePlayer}
})();

const displayController = (function () {
    const playerTurnDisplay = document.querySelector(".turn-display");
    const boardDiv = document.querySelector(".board-container");
    return {playerTurnDisplay, boardDiv}
})();

function ScreenController() {
    const updateScreen = () => {
        // Clear board
        displayController.boardDiv.textContent = ""

        const board = gameBoard.getBoard();
        const activePlayer = GameController.getActivePlayer();

        if (!gameBoard.getWin()){
            displayController.playerTurnDisplay.textContent = `${activePlayer.name}'s turn`;
        }

        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                cellButton.dataset.rowIndex = rowIndex;
                cellButton.dataset.colIndex = colIndex;
                cellButton.textContent = cell.getValue();
                displayController.boardDiv.appendChild(cellButton);
            })
        })
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
        GameController.playRound(selectedRow, selectedCol);
        updateScreen();
    }

    displayController.boardDiv.addEventListener("click", clickGridBoard);

    updateScreen();
}

ScreenController();