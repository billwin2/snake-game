// Game Constants
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boardWidth = canvas.width;
const boardHeight = canvas.height;
const tileSize = 25;

// Snake and Food
let snake = [{ x: 5, y: 5 }];
let food = { x: 10, y: 10 };

// Game Logic
let velocityX = 0;
let velocityY = 0;
let gameOver = false;
let gameLoop;

// High Scores
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
const maxHighScores = 10;

// Start Game
function startGame() {
    snake = [{ x: 5, y: 5 }];
    velocityX = 1;
    velocityY = 0;
    placeFood();
    gameOver = false;
    clearInterval(gameLoop);
    gameLoop = setInterval(update, 100);
}

// Place Food
function placeFood() {
    food.x = Math.floor(Math.random() * (boardWidth / tileSize));
    food.y = Math.floor(Math.random() * (boardHeight / tileSize));
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
    } else {
        snake.pop(); // Remove tail
        snake.unshift(head); // Add new head
    }

    draw();
}


// Draw Game
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, boardWidth, boardHeight);

    // Draw Food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);

    // Draw Snake
    ctx.fillStyle = "lime";
    for (let part of snake) {
        ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize, tileSize);
    }

    // Draw Score
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Your Score: " + (snake.length - 1), 10, 20);
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



// Handle Game Over and High Scores
function handleGameOver() {
    drawGameOver();  // Display the Game Over message
    const score = snake.length - 1;  // Calculate the score

    // Check if score qualifies for top 10
    const lowestHighScore = highScores[highScores.length - 1]?.score || 0;
    if (highScores.length < maxHighScores || score > lowestHighScore) {
        const playerName = prompt("New High Score! Enter your name:", "Player");
    
        // Only submit if player entered a name
        if (playerName !== null && playerName.trim() !== "") {
            const newScore = { name: playerName, score: score };
    
            // Add and sort high scores
            highScores.push(newScore);
            highScores.sort((a, b) => b.score - a.score);
            highScores = highScores.slice(0, maxHighScores);
    
            // Save to localStorage
            localStorage.setItem("highScores", JSON.stringify(highScores));
            submitScore(playerName, score);
            displayHighScores();
        }
    }
    
    
}

// Draw Game Over Message
function drawGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", boardWidth / 2 - 80, boardHeight / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press Space to Restart", boardWidth / 2 - 110, boardHeight / 2 + 30);
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
    } else if (e.code === "Space" || e.key === " ")  {
        startGame();
    }
});

async function submitScore(playerName, score) {
    const apiUrl = 'https://ls4eez6wgb.execute-api.us-east-2.amazonaws.com/prod/score';

    const payload = {
        playerName,
        score
    };

    // Log payload before sending
    console.log("Submitting Score Payload:", payload); 

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Log full response object for debugging
        console.log('Raw Response:', response);

        // Check if response is JSON before parsing
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            console.error("Error parsing JSON from response:", jsonError);
            result = { message: "Invalid JSON response" };
        }

        console.log('Score submission result:', result);

        if (response.ok) {
            console.log(`Score submitted successfully! Status: ${response.status}`);
            alert('Score submitted successfully!');
        } else {
            console.error(`Error submitting score (Status ${response.status}): ${result.message}`);
            alert(`Error submitting score: ${result.message}`);
        }
    } catch (error) {
        console.error('Network error submitting score:', error);
        alert('Failed to submit score due to network error. Please try again.');
    }
}


async function fetchHighScores() {
    const apiUrl = 'https://ls4eez6wgb.execute-api.us-east-2.amazonaws.com/prod/highscores';

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched High Scores:', data.highScores);

        highScores = data.highScores.map(score => ({
            name: score.playerName,
            score: score.score !== undefined ? score.score : score.Score // Fallback
        }));
        displayHighScores();
    } catch (error) {
        console.error('Error fetching high scores:', error);
        alert('Failed to fetch high scores. Check console for details.');
    }
}


  



// Start the Game
fetchHighScores();
startGame();  
displayHighScores();