const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let isGameOver = false;

// Pipe properties
let pipes = []; // Array to hold all pipes
const pipeWidth = 50;
const pipeGap = 120; // The vertical gap between pipes
const pipeColor = '#008000'; // Green color for pipes
const pipeSpeed = 2;

function generatePipes() {
    // Define a "safe" vertical area to prevent pipes from being too extreme.
    // We'll leave 50px padding at the top and bottom.
    const verticalPadding = 50;
    const safeZone = canvas.height - (verticalPadding * 2) - pipeGap;
    
    // Get a random starting Y-position for the top of the gap within the safe zone.
    const gapTopY = (Math.random() * safeZone) + verticalPadding;
    const topPipeHeight = gapTopY;
    const bottomPipeY = gapTopY + pipeGap;
    
    // Add the top pipe to the array
    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: topPipeHeight
    });

    // Add the bottom pipe to the array
    pipes.push({
        x: canvas.width,
        y: bottomPipeY,
        width: pipeWidth,
        height: canvas.height - bottomPipeY
    });
}

// Bird properties
const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    color: '#FFBF00', 
    velocityY: 0,
    gravity: 0.2,
    flapStrength: -5
};

// This function draws everything on the canvas
function draw() {
    // Clear the entire canvas for the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the bird
    ctx.fillStyle = bird.color;
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Draw the pipes
    ctx.fillStyle = pipeColor;
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
    });
}

function checkCollisions() {
    // 1. Ground and ceiling collision
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        isGameOver = true;
    }

    // 2. Pipe collision
    for (let pipe of pipes) {
        // Check if bird is within the horizontal and vertical bounds of the pipe
        if (bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height &&
            bird.y + bird.height > pipe.y) {
            isGameOver = true;
        }
    }
}

// This function updates the game state (physics, positions)
function update() {
    // Apply gravity to the bird's vertical velocity
    bird.velocityY += bird.gravity;
    // Update the bird's vertical position
    bird.y += bird.velocityY;

    // Update pipe positions
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    // Remove pipes that are off-screen to the left
    // This is important for performance!
    if (pipes.length > 0 && pipes[0].x < -pipeWidth) {
        pipes.splice(0, 2); // Remove the pair of pipes
    }

    checkCollisions();
}

// This function makes the bird "flap"
function flap(){
    if(!isGameOver){
        bird.velocityY = bird.flapStrength;
    }
}

// Event Listeners for player input
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        flap();
    }
});
document.addEventListener('mousedown', flap);
document.addEventListener('touchstart', flap);

// The main game loop
function gameLoop() {
    update(); // Update game state
    draw();   // Draw the new state
    // Request the browser to call gameLoop again for the next frame

    if(!isGameOver){
        requestAnimationFrame(gameLoop);
    }else {
        console.log("Game Over");
    }
}

setInterval(generatePipes, 1500); // Generate pipes every 1.5 seconds

// Start the game loop
gameLoop();