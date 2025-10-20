const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
}

// This function updates the game state (physics, positions)
function update() {
    // Apply gravity to the bird's vertical velocity
    bird.velocityY += bird.gravity;
    // Update the bird's vertical position
    bird.y += bird.velocityY;
}

// This function makes the bird "flap"
function flap(){
    bird.velocityY = bird.flapStrength;
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
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();