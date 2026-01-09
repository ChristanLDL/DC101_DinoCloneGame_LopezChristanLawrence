// board
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

// dino
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let dinoImg;
let dinoRun1Img; 
let dinoRun2Img;
let dinoDeadImg; // Declared globally for efficient loading
let currentDinoImg;
const DINO_ANIMATION_SPEED = 100;
let frameTimer = 0;

let dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
}

// cactus
let cactusArray = [];
let cactus1Width = 34;
let cactus2Width = 69;
let cactus3Width = 102;
let cactusHeight = 70;
let cactusX = 700;
let cactusY = boardHeight - cactusHeight;

let cactus1Img;
let cactus2Img;
let cactus3Img;

// movement and game state
let velocityX = -8; 
let velocityY = 0;
let gravity = .4;

let gameStarted = false; // NEW: Flag to track if the game has started
let gameOver = false;
let score = 0;
let scoreCounter = 0; // For consistent scoring speed
const SCORE_UPDATE_INTERVAL = 5; // Score increments every 5 frames

const HIGH_SCORE_KEY = 'dinoCloneHighScore';
let currentHighScore = 0;


/**
 * Retrieves the high score from Local Storage.
 * @returns {number} The current high score, or 0 if none is saved.
 */
function getHighScore() {
    const storedScore = localStorage.getItem(HIGH_SCORE_KEY);
    return storedScore ? parseInt(storedScore, 10) : 0;
}

/**
 * Checks if the new score is greater than the current high score.
 * If it is, updates the high score in Local Storage.
 * @param {number} newScore - The score from the most recently played game.
 */
function updateHighScore(newScore) {
    if (newScore > currentHighScore) {
        localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
        currentHighScore = newScore;
    }
}

/**
 * Handles the running/jumping animation frame based on time.
 */
function handleDinoAnimation() {
    // Check if the dino is on the ground and game is running
    if (dino.y == dinoY && !gameOver && gameStarted) { 
        frameTimer += (1000 / 60); // Time elapsed per frame (approx.)

        if (frameTimer >= DINO_ANIMATION_SPEED) {
            // Toggle between the two running images
            if (currentDinoImg === dinoRun1Img) {
                currentDinoImg = dinoRun2Img;
            } else {
                currentDinoImg = dinoRun1Img;
            }
            frameTimer = 0; 
        }
    } else if (dino.y < dinoY && !gameOver) {
        // If jumping, show the stand-still image (dinoImg)
        currentDinoImg = dinoImg; 
    }
}

/**
 * Resets all game variables and prepares for a new game loop.
 */
function resetGame() {
    gameOver = false;
    score = 0;
    scoreCounter = 0;
    
    // Reset dino position and velocity
    dino.y = dinoY;
    velocityY = 0;
    
    // Clear all cacti
    cactusArray = []; 
    
    // Reset initial game speed (velocityX)
    velocityX = -8;
    
    // Reset dino to running animation (FIXED: capital 'D' in dinoRun1Img)
    currentDinoImg = dinoRun1Img;
    frameTimer = 0;

    // Start placing obstacles again
    // We restart the interval to ensure it's not placing objects during Game Over
    if (window.cactusInterval) {
        clearInterval(window.cactusInterval);
    }
    window.cactusInterval = setInterval(placeCactus, 1000); 
}

/**
 * Main function that runs once the page loads.
 */
window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d");
    currentHighScore = getHighScore();
    
    // Load ALL Images (including dead dino for performance)
    dinoImg = new Image();
    dinoImg.src = "./images/dino.png";
    dinoRun1Img = new Image();
    dinoRun1Img.src = "./images/dinorun1.png"; 
    dinoRun2Img = new Image();
    dinoRun2Img.src = "./images/dinorun2.png";
    dinoDeadImg = new Image(); // LOADED ONCE HERE
    dinoDeadImg.src = "./images/dino-dead.png";
    
    currentDinoImg = dinoImg; // Start with stand-still image on the start screen

    cactus1Img = new Image();
    cactus1Img.src = "./images/cactus1.png";
    cactus2Img = new Image();
    cactus2Img.src = "./images/cactus2.png";
    cactus3Img = new Image();
    cactus3Img.src = "./images/cactus3.png";
    
    // Start drawing the static start screen
    requestAnimationFrame(update); 
    document.addEventListener("keydown", moveDino);
}

/**
 * The main game loop, called 60 times per second.
 */
function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);
    
    // === START SCREEN LOGIC (NEW) ===
    if (!gameStarted) {
        context.fillStyle = "black";
        context.font = "bold 18px courier";
        context.fillText("Press SPACE or UP to Start", boardWidth / 2 - 130, boardHeight / 2);
        
        // Draw the static dino image
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
        
        return; // Stop the loop from running game mechanics
    }
    
    // === GAME OVER LOGIC ===
    if (gameOver) {
        updateHighScore(score); 
        
        // Draw the dead dino image (Optimized: No need to reload)
        context.drawImage(dinoDeadImg, dino.x, dino.y, dino.width, dino.height);

        // Display Game Over Text
        context.fillStyle = "black";
        context.font = "bold 30px courier";
        context.fillText("GAME OVER", boardWidth / 2 - 80, boardHeight / 2);
        context.font = "bold 18px courier";
        context.fillText("Press SPACE or UP to Restart", boardWidth / 2 - 130, boardHeight / 2 + 30);

        // Display final score
        context.font = "20px courier";
        context.fillText("SCORE: " + score, 5, 20); 
        context.fillText("HI: " + currentHighScore, 600, 20); 

        return; // Stop the rest of the game loop
    }

    // === SCORE UPDATE & DIFFICULTY SCALING ===
    scoreCounter++;
    if (scoreCounter >= SCORE_UPDATE_INTERVAL) {
        score++;
        scoreCounter = 0;
    }
    
    if (score >= 1000 && velocityX > -10) { 
        velocityX = -10; 
    } 
    else if (score >= 2000 && velocityX > -12) {
        velocityX = -12;
    }

    
    // === DINO DRAWING & MOVEMENT ===
    handleDinoAnimation();

    // Gravity calculation
    velocityY += gravity;
    // Apply velocity, but cap Y position at the ground
    dino.y = Math.min(dino.y + velocityY, dinoY);

    context.drawImage(currentDinoImg, dino.x, dino.y, dino.width, dino.height);

    
    // === CACTUS DRAWING, MOVEMENT, & COLLISION ===
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            // Stop obstacle spawning immediately on collision
            clearInterval(window.cactusInterval); 
        }
    }

    // === SCORE DISPLAY (In-game) ===
    context.fillStyle="black";
    context.font="20px courier";
    context.fillText("SCORE: " + score, 5, 20);
    context.fillText("HI: " + currentHighScore, 600, 20);
}

/**
 * Handles the jump action and game state transitions (Start/Restart).
 */
function moveDino(e) {
    if (e.code == "Space" || e.code == "ArrowUp") {
        if (!gameStarted) {
            // START GAME
            gameStarted = true;
            resetGame();
            return;
        }

        if (gameOver) {
            // RESTART GAME
            resetGame();
            return;
        }
        
        // JUMP LOGIC: Only allow jump if the dino is on the ground
        if (dino.y == dinoY) {
            velocityY = -10; // Sets a strong upward velocity
        }
    }
}

/**
 * Creates and places a cactus object at random intervals.
 */
function placeCactus() {
    if (gameOver || !gameStarted) { // Prevents spawning if game is over or not started
        return;
    }
    // ... (rest of placeCactus logic remains the same)
    
    // Place cactus object
    let cactus = {
        img : null,
        x : cactusX,
        y : cactusY,
        width : null,
        height: cactusHeight
    }

    let placeCactusChance = Math.random(); 

    // Determine which cactus type to place 
    if (placeCactusChance > .90) { // 10% chance for triple cactus
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .70) { // 20% chance for double cactus
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .50) { // 20% chance for single cactus
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    }

    // Garbage collection: Remove cacti that have moved off the screen
    if (cactusArray.length > 5) { 
        cactusArray.shift(); 
    }
}

/**
 * Detects collision between two rectangular objects (AABB).
 */
function detectCollision(a, b) {
    return a.x < b.x + b.width && 
           a.x + a.width > b.x && 
           a.y < b.y + b.height && 
           a.y + a.height > b.y; 
}