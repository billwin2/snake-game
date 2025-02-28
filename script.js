// Game Constants
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boardWidth = canvas.width;
const boardHeight = canvas.height;
const tileSize = 25;
const highScoresOverlay = document.getElementById('highScoresOverlay');
const highScoresList = document.getElementById('highScoresList');

// Snake and Food
let snake = [{ x: 5, y: 5 }];
let food = { x: 10, y: 10 };

// Food Images
const foodImages = [
    "images/apple.png",
    "images/burger.png",
    "images/pizza.png",
    "images/taco.png",
    "images/chicken.png"
];

// Load all images into an object
const foodImageObjects = foodImages.map(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => console.log(`${src} loaded successfully`);
    img.onerror = () => console.error(`Failed to load ${src}`);
    return img;
});

// Current food image
let currentFoodImage = foodImageObjects[0]; // Default to first image


// Game Logic
let velocityX = 0;
let velocityY = 0;
let gameOver = false;
let baseSpeed = 100; // Initial speed in milliseconds
let speed = baseSpeed;
let gameLoop;

// Initialize as empty array; fetchHighScores will populate from API
let highScores = [];

// Start Game
function startGame() {
    console.log("Stating game");

    // Force hide overlay
    highScoresOverlay.style.display = 'none';
    highScoresOverlay.classList.add('hidden'); // Hide overlay

    snake = [{ x: 5, y: 5 }];
    velocityX = 1;
    velocityY = 0;
    gameOver = false;
    //Resets spped on game start
    speed = baseSpeed;
    placeFood();
    clearInterval(gameLoop);
    gameLoop = setInterval(update, speed);
}

// Place Food
function placeFood() {
    food.x = Math.floor(Math.random() * (boardWidth / tileSize));
    food.y = Math.floor(Math.random() * (boardHeight / tileSize));

    // Randomly select a food image
    currentFoodImage = foodImageObjects[Math.floor(Math.random() * foodImageObjects.length)];
}


// Game Update Logic
function update() {
    if (gameOver) return;

    // Move Snake
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

    // Wall Collision
    if (head.x < 0 || head.x >= boardWidth / tileSize || head.y < 0 || head.y >= boardHeight / tileSize) {
        gameOver = true;
        handleGameOver();
        return;
    }

    // Self Collision (Only if snake has a body)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            handleGameOver();
            return;
        }
    }

    // Eat Food
    if (head.x === food.x && head.y === food.y) {
        snake.unshift(head); // Grow snake
        placeFood();
        updateGameSpeed();
    } else {
        snake.pop(); // Remove tail
        snake.unshift(head); // Add new head
    }

    draw();
}


// Draw Game
// Draw Game
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, boardWidth, boardHeight);

    // Check if the apple image is loaded before drawing
    if (currentFoodImage.complete && currentFoodImage.naturalWidth !== 0) {
        ctx.drawImage(
            currentFoodImage,
            food.x * tileSize,
            food.y * tileSize,
            tileSize,
            tileSize
        );
    } else {
        console.warn("currentFoodImage not yet loaded, using fallback.");
        // Temporary fallback: Draw a red circle if image isn't ready
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(
            food.x * tileSize + tileSize / 2,
            food.y * tileSize + tileSize / 2,
            tileSize / 2,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    // Draw Snake with Gradient Effect
    for (let i = 0; i < snake.length; i++) {
        let part = snake[i];

        // Create a gradient effect
        let gradient = ctx.createLinearGradient(
            part.x * tileSize, part.y * tileSize,
            part.x * tileSize + tileSize, part.y * tileSize + tileSize
        );
        gradient.addColorStop(0, "lime");
        gradient.addColorStop(1, "green");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            part.x * tileSize + tileSize / 2,
            part.y * tileSize + tileSize / 2,
            tileSize / 2,
            0, Math.PI * 2
        );
        ctx.fill();

        // Draw Eyes if it's the Head
        if (i === 0) {
            ctx.fillStyle = "black";
            let eyeSize = tileSize / 6;
            let offset = tileSize / 3;

            ctx.beginPath();
            ctx.arc(
                part.x * tileSize + offset, 
                part.y * tileSize + offset,
                eyeSize, 0, Math.PI * 2
            );
            ctx.fill();

            ctx.beginPath();
            ctx.arc(
                part.x * tileSize + tileSize - offset, 
                part.y * tileSize + offset,
                eyeSize, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    // Draw Score
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Your Score: " + (snake.length - 1), 10, 20);
}

function updateGameSpeed() {
    speed = Math.max(baseSpeed - (snake.length - 1) * 4, 40); // Min speed cap at 50ms

    clearInterval(gameLoop); // Stop the current game loop
    gameLoop = setInterval(update, speed); // Restart with the updated speed

    console.log(`Speed updated: ${speed}ms per tick`);
}

function displayHighScores() {
    const highScoreList = document.getElementById("highScoreList");
    highScoreList.innerHTML = "<h2>High Scores</h2><ul></ul>";  // Clear and reset list

    highScores.forEach((score, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${score.name}: ${score.score}`;
        highScoreList.querySelector("ul").appendChild(li);
    });
}

function updateHighScoreList(highScores) {
    const highScoresList = document.getElementById("highScoresList");

    if (!highScoresList) {
        console.error("High scores list element not found!");
        return;
    }

    highScoresList.innerHTML = ""; // Clear previous scores

    highScores.forEach((score, index) => {
        const p = document.createElement("p");
        p.textContent = `${index + 1}. ${score.name || "Unknown"}: ${score.score}`;
        highScoresList.appendChild(p);
    });

    // Ensure the overlay is visible
    const highScoresOverlay = document.getElementById('highScoresOverlay');
    if (highScoresOverlay) {
        highScoresOverlay.style.display = "block";
        highScoresOverlay.classList.remove("hidden");
    }
}

// Handle Game Over and High Scores
// Handle Game Over and High Scores
async function handleGameOver() {
    clearInterval(gameLoop); // Stop the Game Loop
    drawGameOver();  // Display the Game Over message
    const score = snake.length - 1;  // Calculate the score

    try {
        // Fetch the latest high scores from DynamoDB
        const apiUrl = 'https://ls4eez6wgb.execute-api.us-east-2.amazonaws.com/prod/highscores';
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const currentHighScores = data.highScores || [];

        //display highscores in the overlay
        displayHighScoresOverlay(currentHighScores);
        highScoresOverlay.classList.remove('hidden');

        // Show overlay
        if (highScoresOverlay) {
            highScoresOverlay.style.display = 'block';
            highScoresOverlay.classList.remove('hidden');
        } else {
            console.error("Error: #highScoresOverlay element not found in the DOM.");
        }
        

        // Determine if the score qualifies for the top 10
        const lowestHighScore = currentHighScores.length >= 10
            ? Math.min(...currentHighScores.map(s => Number(s.score)))
            : 0;

        if (currentHighScores.length < 10 || score > lowestHighScore) {
            const playerName = prompt("New High Score! Enter your name:", "Player");

            if (playerName !== null && playerName.trim() !== "") {
                await submitScore(playerName, score);
                fetchHighScores(); // Refresh leaderboard after successful submission
            }
        } else {
            console.log("Displaying Game Over message in overlay");
        
            // Show the overlay before appending the message
            highScoresOverlay.classList.remove('hidden');
        
            // Safely get the message container
            const gameOverMessage = document.getElementById('gameOverMessage');
            if (!gameOverMessage) {
                console.error('Error: #gameOverMessage element not found in the DOM.');
                return;
            }
        
            // Clear previous messages
            gameOverMessage.innerHTML = '';
        
            // Create message div and apply CSS class
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('game-over-message'); // ✅ Apply CSS class
            messageDiv.innerText = "Game Over! Unfortunately, your score didn’t make it to the top 10.";
        
            // Append the message to the dedicated container
            gameOverMessage.appendChild(messageDiv);
        
            // Confirm in console
            console.log("New game over message displayed.");
        }
        
        
    } catch (error) {
        console.error('Error handling game over:', error);
        alert('An error occurred while processing the high scores.');
    }
}

// Draw Game Over Message
function drawGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", boardWidth / 2 - 80, boardHeight / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press Enter to Restart", boardWidth / 2 - 110, boardHeight / 2 + 30);
}

// Handle Keyboard Input
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    } else if ((e.code === "Space" || e.key === " ") && highScoresOverlay.classList.contains('hidden')) {
        //Restart the game with Space if overlay is hidden
        startGame();
    } else if (e.key === "Enter" && !highScoresOverlay.classList.contains("hidden")) {
        // Start the game when Enter is pressed and overlay is hidden
        startGame();
    }
});

function displayHighScoresOverlay(scores) {
    console.log("Displaying High Scores Overlay:", scores); // Debug log

    if (!scores.length) {
        highScoresList.innerHTML = "<p>No high scores yet!</p>";
        return;
    }

    highScoresList.innerHTML = scores.map((score, index) =>
        `<p>${index + 1}. ${score.name || score.playerName || "Unknown"}: ${score.score}</p>`
    ).join('');
}

async function submitScore(playerName, score) {
    const apiUrl = 'https://ls4eez6wgb.execute-api.us-east-2.amazonaws.com/prod/score';

    const payload = {
        playerName: playerName,
        score: Number(score)  // Ensure score is a number
    };

    // Log the payload before sending
    console.log("Submitting Score Payload:", payload);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Score submission result:', result);

        if (response.ok) {
            return;
        } else {
            console.error(`Error submitting score: ${result.message}`);
            alert(`Error submitting score: ${result.message}`);
        }
    } catch (error) {
        console.error('Network error submitting score:', error);
        alert('Failed to submit score. Please try again.');
    }
}
async function fetchHighScores() {
    const apiUrl = 'https://ls4eez6wgb.execute-api.us-east-2.amazonaws.com/prod/highscores';

    try {
        console.log("Fetching high scores from:", apiUrl);

        const response = await fetch(apiUrl);
        const textData = await response.text();
        console.log("Raw API Response:", textData);

        const data = JSON.parse(textData);
        console.log("Parsed API Response:", data);

        if (!Array.isArray(data.highScores)) {
            console.error("Unexpected format:", data);
            return;
        }

        // 🛠️ Fix: Ensure names are correctly mapped
        highScores = data.highScores.map(score => ({
            name: score.name || score.playerName || "Unknown",
            score: Number(score.score) || 0
        }));

        console.log("Processed High Scores:", highScores);

        updateHighScoreList(highScores);
        displayHighScoresOverlay(highScores); // Ensure overlay updates at the right time

    } catch (error) {
        console.error("Error fetching high scores:", error);
    }
}

// Get Highscores and then Start the Game
async function initializeGame() {
    await fetchHighScores();  // Fetch scores first
    displayHighScoresOverlay(highScores);  // Then display them
}

initializeGame();


