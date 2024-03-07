// gameboard factory
const gameBoard = (function () {    
    let rows = [];
    function set() {        
        rows = [];        
        for (i = 0; i < 3; i++) {
            rows.push(Array(3).fill('-'));
        }               
    }    
    const getState = () => rows;    
    const setMark = (row, column, mark) => rows[row][column] = mark;
    // for displaying in IDE console
    function displayConsole() {
        let str = '';
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                str += rows[i][j] + '  ';
            }
        console.log(str);
        str = '';
        }         
    }    
    return { set, getState, setMark, displayConsole };
})();
// player factory
function createPlayer(name, mark) {
    const pName = name;
    const pMark = mark;
    let score = 0;      
    const getScore = () => score;   
    const giveScore = () => score++;    
    return { pName, pMark, getScore, giveScore };
}
// random number generator
function rng() {
    const min = Math.ceil(1);
    const max = Math.floor(10);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
// game factory
const game = (function () {
    let turn = 'p0';
    // draw starting player
    function draw() {        
        let random = rng();
        if (random < 6) {
            turn = 'p1';
        } else {
            turn = 'p2';
        }
    }
    function changeTurn() {
        if (turn === 'p1') {
            turn = 'p2';
        } else if ( turn === 'p2') {
            turn = 'p1';
        }
    }
    const getTurn = () => turn;    
    function winCheck(boardState) {
        // create array for multiple return values
        // arrays first value: 0 = no winning lines, 1 = winning line found, 2 = draw
        // arrays other values: coordinates for the winning line
        let arr = [0];      
        // check horizontal tracks               
        for (i = 0; i < boardState.length; i++) {          
            if (boardState[i][0] === boardState[i][1] && boardState[i][1] === boardState[i][2] && boardState[i][0] != '-') {
                arr[0] = 1;
                arr.push([[i], [0]], [[i], [1]], [[i], [2]]);                                                              
            }            
        }        
        // check vertical tracks
        for (i = 0; i < boardState.length; i++) {          
            if (boardState[0][i] === boardState[1][i] && boardState[1][i] === boardState[2][i] && boardState[0][i] != '-') {
                arr[0] = 1;
                arr.push([[0], [i]], [[1], [i]], [[2], [i]]);                 
            }
        }
        // check diagonal tracks
        if (boardState[0][0] === boardState[1][1] && boardState[1][1] === boardState[2][2] && boardState[1][1] != '-') {
            arr[0] = 1;
            arr.push([[0], [0]], [[1], [1]], [[2], [2]]);
        } else if (boardState[0][2] === boardState[1][1] && boardState[1][1] === boardState[2][0] && boardState[1][1] != '-' ) {
            arr[0] = 1;
            arr.push([[0], [2]], [[1], [1]], [[2], [0]]);
        }        
        // check draw
        let draw = false;
        if (!arr[0]) {
            draw = true;
            for (i = 0; i < boardState.length; i++) {                
                for (let j = 0; j < boardState[i].length; j++) {                    
                    if (boardState[i][j] === '-') {                    
                        draw = false;                        
                    }                    
                }
            }
        }
        if (draw) {
            arr[0] = 2;
        }               

        return arr;      
    }
    return { draw, changeTurn, getTurn, winCheck }
})();
// starting the game
let p1 = {};
let p2 = {};
function startGame(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    name1 = formData.get("player1-name"); 
    name2 = formData.get("player2-name");    
    p1 = createPlayer(name1, 'x');
    p2 = createPlayer(name2, 'o');    
    gameBoard.set();    
    game.draw();
    displayBoard();
    toggleFormVisibility();
    updateScores();
    showEndGameBtn();
}
// ending turn, if winCheckArr[0] = 1, start new round
function endTurn(turn) {
    const winCheckArr = game.winCheck(gameBoard.getState());
    if (winCheckArr[0] === 1) {
        switch (turn) {
            case 'p1':
                p1.giveScore();                
                break;
            case 'p2':
                p2.giveScore();                
        }
        const cell = gameGrid.querySelectorAll('.cell-empty');
        cell.forEach((listener) => {
            listener.removeEventListener('click', cellClick);
            listener.classList = 'left-empty';
        });
        updateScores();        
        ShowWinTrack(winCheckArr);
        endRound();        
    } else if (winCheckArr[0] === 2) {
        let delay = 500;
        setTimeout(function() {
            alert('Draw!');
            endRound()
        }, delay);
    } else {
        game.changeTurn();
    }
}
// start a new round
// or end game if score = 3 
function endRound() { 
    const delay = 500;   
    if (p1.getScore() >= 3) {        
        setTimeout(function() {
            alert(p1.pName + ' wins!');
            endGame()
        }, delay);
    } else if (p2.getScore() >= 3) {
        setTimeout(function() {
            alert(p2.pName + ' wins!');
            endGame()
        }, delay);
    } else {
        showNewRoundBtn();
    }
}
// end game
function endGame() {
    toRemove = scores.querySelectorAll('.scores-button');
    if (toRemove.lenght != 0) {
        toRemove.forEach((btn) => {
            btn.remove();
        });
    }    
    clearBoard();
    toggleFormVisibility();
    gameGrid.textContent = 'Waiting for players...'    
}
// new round
function newRound() {
    toRemove = document.querySelector('#new-round-button');
    toRemove.remove();
    gameBoard.set();
    displayBoard();
    game.draw()
}
// DOM-manipulation
// clear game-grid
const gameGrid = document.querySelector('#game-grid');
const emptyGrid = 'game-grid-empty'
function clearBoard() {
    let toRemove = gameGrid.querySelectorAll('div');
    if (toRemove.length != 0) {
        toRemove.forEach(element => {
            element.remove();
        });
    }
    gameGrid.classList = emptyGrid;    
}
// create game-grid
const filledGrid = 'game-grid-filled';
let emptyCell = 'cell-empty';
function displayBoard() {
    clearBoard();
    gameGrid.textContent = '';  
    let row = 0;
    let column = 0;
    for (i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList = emptyCell;
        cell.setAttribute('data-row', row);                 
        cell.setAttribute('data-column', column);
        cell.addEventListener('click', cellClick)                 
        gameGrid.appendChild(cell);
        column += 1;
        if (column > 2) {
            row += 1;
            column = 0;
        }
    }
    gameGrid.classList = filledGrid;    
}
// game-grid cell click function
function cellClick(e) {
    let row = e.target.attributes["data-row"].value;
    let col = e.target.attributes["data-column"].value;
    let mark = '';
    let turn = game.getTurn();
    if (turn === 'p1') {
        mark = p1.pMark;
    } else if (turn === 'p2') {
        mark = p2.pMark;
    }
    gameBoard.setMark(row, col, mark);
    addMarkImg(row, col, mark);
    endTurn(turn);
}
// display player mark in game-grid cell
markedCell = 'cell-marked';
function addMarkImg(row, col, mark) {
    let file = '';
    let alt = '';
    const placement = gameGrid.querySelector('[data-row=' + CSS.escape(row) + '][data-column=' + CSS.escape(col) + ']')    
    if (mark === 'x') {
        file = 'letter-x.png';
        alt = 'x';
    } else if (mark === 'o') {
        file = 'letter-o.png';
        alt = 'o';
    }
    const img = document.createElement('img');
    img.src = 'images/' + file;
    img.alt = alt;
    placement.appendChild(img);
    placement.classList = markedCell;
    placement.removeEventListener('click', cellClick);
}
// player name form, start game button and scores
const playersForm = document.querySelector('#players-form');
playersForm.addEventListener('submit', startGame);
const scores = document.querySelector('#scores');
// hide/show form & score
const hidden = 'hide';
function toggleFormVisibility() {    
    if (playersForm.classList != hidden) {
        playersForm.classList = hidden;        
        scores.classList.remove(hidden);              
    } else {
        playersForm.classList.remove(hidden);
        scores.classList = hidden;
    }       
}
// update score text
const p1ScoreText = document.querySelector('#p1-score-text');
const p2ScoreText = document.querySelector('#p2-score-text');
function updateScores() {
    p1ScoreText.textContent = p1.pName + " has " + p1.getScore() + " points.";
    p2ScoreText.textContent = p2.pName + " has " + p2.getScore() + " points.";
}
// display end game button
scoresBtn = 'scores-button'
function showEndGameBtn() {    
    endGameBtn = document.createElement('button');    
    endGameBtn.classList = scoresBtn;
    endGameBtn.setAttribute('id', 'end-game-button');
    endGameBtn.textContent = 'End game';
    endGameBtn.addEventListener('click', endGame)    
    scores.appendChild(endGameBtn);
}
// display new round button 
function showNewRoundBtn() {    
    newRoundBtn = document.createElement('button');
    newRoundBtn.classList = scoresBtn;
    newRoundBtn.setAttribute('id', 'new-round-button');
    newRoundBtn.textContent = 'Start new round';
    newRoundBtn.addEventListener('click', newRound)    
    scores.appendChild(newRoundBtn);
}
// display winning track
const winningTrack = 'winning-track'
function ShowWinTrack(array) {
    for (i = 1; i < 4; i++) {
        const [row, col] = array[i];        
        const cell = gameGrid.querySelector('[data-row=' + CSS.escape(row) + '][data-column=' + CSS.escape(col) + ']');
        cell.classList = winningTrack;
    }    
}
