window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const state = {
        current: 0,
        getReady: 0,
        playing: 1,
        gameOver: 2
    };

    let score = 0;
    let highScore = parseInt(localStorage.getItem('bouncyBeakHighScore')) || 0;

    // Load Sprites
    const birdSprites = [new Image(), new Image(), new Image()];
    birdSprites[0].src = 'assets/bluebird-upflap.png';
    birdSprites[1].src = 'assets/bluebird-midflap.png';
    birdSprites[2].src = 'assets/bluebird-downflap.png';

    const pipeSprite = new Image();
    pipeSprite.src = 'assets/pipe-green.png';

    const bgSprite = new Image();
    bgSprite.src = 'assets/background-day.png';

    const groundSprite = new Image();
    groundSprite.src = 'assets/base.png';

    const getReadySprite = new Image();
    getReadySprite.src = 'assets/message.png';

    const gameOverSprite = new Image();
    gameOverSprite.src = 'assets/gameover.png';

    const numberSprites = [];
    for (let i = 0; i < 10; i++) {
        numberSprites[i] = new Image();
        numberSprites[i].src = `assets/${i}.png`;
    }

    const scoreAsset = new Image();
    scoreAsset.src = 'assets/score.png';
    const bestAsset = new Image();
    bestAsset.src = 'assets/best.png';

    // Load Sounds
    const sfx = {
        wing: new Audio('assets/wing.wav'),
        point: new Audio('assets/point.wav'),
        hit: new Audio('assets/hit.wav')
    };

    let assetsLoaded = 0;
    const totalAssets = 18; // Total number of images
    const onAssetLoad = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            // All assets are loaded, start the game
            gameLoop();
        }
    };

    birdSprites.forEach((sprite, index) => {
        sprite.onload = () => {
            console.log(`Bird sprite ${index} loaded: ${sprite.width} x ${sprite.height}`);
            onAssetLoad();
        };
    });
    pipeSprite.onload = () => { console.log(`Pipe sprite loaded: ${pipeSprite.width} x ${pipeSprite.height}`); onAssetLoad(); };
    bgSprite.onload = () => { console.log(`Background sprite loaded: ${bgSprite.width} x ${bgSprite.height}`); onAssetLoad(); };
    groundSprite.onload = () => { console.log(`Ground sprite loaded: ${groundSprite.width} x ${groundSprite.height}`); onAssetLoad(); };
    getReadySprite.onload = () => { console.log(`GetReady sprite loaded: ${getReadySprite.width}x${getReadySprite.height}`); onAssetLoad(); };
    gameOverSprite.onload = () => { console.log(`GameOver sprite loaded: ${gameOverSprite.width}x${gameOverSprite.height}`); onAssetLoad(); };
    numberSprites.forEach((sprite, i) => {
        sprite.onload = () => { console.log(`Number sprite ${i} loaded: ${sprite.width}x${sprite.height}`); onAssetLoad(); };
    });

    // Bird properties (Updated for new sprites)
    const bird = {
        x: 50,
        y: 150,
        width: 34,  // Use dimensions from console log
        height: 24, // Use dimensions from console log
        velocityY: 0,
        gravity: 0.30,
        flapStrength: -6,
        frame: 0,
        maxFrame: 2,
        frameRate: 5,
        frameCount: 0
    };

    // Background properties for scrolling
    const background = {
        x1: 0,
        x2: canvas.width,
        y: 0,
        width: canvas.width,
        height: canvas.height
    };

    // Ground properties for scrolling
    const ground = {
        x1: 0,
        x2: canvas.width,
        y: canvas.height - 112, // 112 is the height of the base.png
        width: canvas.width,
        height: 112
    };

    let pipes = [];
    const pipeWidth = 52; // Width of pipe-green.png
    const pipeGap = 120;
    const pipeSpeed = 2;
    let pipeGenerator;

    function generatePipes() {
        const topPipeHeight = Math.random() * (canvas.height / 3) + 50;
        const bottomPipeY = topPipeHeight + pipeGap;

        pipes.push({
            x: canvas.width,
            y: 0,
            width: pipeWidth,
            height: topPipeHeight,
            passed: false
        });
        pipes.push({
            x: canvas.width,
            y: bottomPipeY,
            width: pipeWidth,
            height: canvas.height - bottomPipeY - ground.height,
            passed: false
        });
    }

    function draw() {
        // Draw scrolling background
        ctx.drawImage(bgSprite, background.x1, background.y, background.width, background.height);
        ctx.drawImage(bgSprite, background.x2, background.y, background.width, background.height);

        // Draw pipes
        pipes.forEach(pipe => {
            if (pipe.y === 0) { // Top pipe
                ctx.drawImage(pipeSprite, 0, pipeSprite.height - pipe.height, pipe.width, pipe.height, pipe.x, pipe.y, pipe.width, pipe.height);
            } else { // Bottom pipe
                ctx.drawImage(pipeSprite, 0, 0, pipe.width, pipe.height, pipe.x, pipe.y, pipe.width, pipe.height);
            }
        });

        // Draw scrolling ground
        ctx.drawImage(groundSprite, ground.x1, ground.y, ground.width, ground.height);
        ctx.drawImage(groundSprite, ground.x2, ground.y, ground.width, ground.height);

        // Draw bird
        ctx.drawImage(birdSprites[bird.frame], bird.x, bird.y, bird.width, bird.height);
        
        // Draw UI based on state
        if (state.current === state.getReady) {
            ctx.drawImage(getReadySprite, (canvas.width - getReadySprite.width) / 2, (canvas.height - getReadySprite.height) / 2);
        } else if (state.current === state.gameOver) {
            // Draw the main "Game Over" message first
            ctx.drawImage(gameOverSprite, (canvas.width - gameOverSprite.width) / 2, 150);

            const cardX = canvas.width / 2 - 125; // 250px wide card
            const cardY = 220;
            const cardWidth = 250;
            const cardHeight = 120;

            // Draw card background
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
            ctx.strokeStyle = "#543847";
            ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

            // Draw text labels
            // ctx.fillStyle = '#FF8C00'; // Orange text
            // ctx.font = '20px Arial';
            // ctx.fillText("SCORE", cardX + 30, cardY + 45);
            // ctx.fillText("BEST", cardX + 30, cardY + 85);

            ctx.drawImage(scoreAsset, cardX + 30, cardY + 25); // Adjust position as needed
            ctx.drawImage(bestAsset, cardX + 30, cardY + 65); // Adjust position as needed

            // Draw scores using our sprite function, right-aligned
            drawScore(score, cardX + cardWidth - 30, cardY + 25, 'right');
            drawScore(highScore, cardX + cardWidth - 30, cardY + 65, 'right');

        }
        
        // Draw current score during gameplay
        if (state.current === state.playing) {
            drawScore(score, canvas.width / 2, 50, 'center');
        }
    }

    // New function to draw the score using sprites
    function drawScore(number, x, y, align = 'center') {
        const scoreStr = number.toString();
        const digitWidth = numberSprites[0].width;
        const totalWidth = scoreStr.length * digitWidth;
        let startX;

        if (align === 'right') {
            startX = x - totalWidth;
        } else { // Default to center align
            startX = x - totalWidth / 2;
        }

        for (let i = 0; i < scoreStr.length; i++) {
            const digit = parseInt(scoreStr[i]);
            const currentX = startX + i * digitWidth;
            ctx.drawImage(numberSprites[digit], currentX, y);
        }
    }

    function update() {
        // Bird animation runs in getReady and playing states
        if (state.current !== state.gameOver) {
            bird.frameCount++;
            if (bird.frameCount % bird.frameRate === 0) {
                bird.frame = (bird.frame + 1) % birdSprites.length;
            }
        }

        // Ground scrolling runs in all states except gameOver
        if (state.current !== state.gameOver) {
            ground.x1 -= pipeSpeed;
            ground.x2 -= pipeSpeed;
            if (ground.x1 <= -ground.width) ground.x1 = ground.width;
            if (ground.x2 <= -ground.width) ground.x2 = ground.width;
        }

        // Logic for playing state
        if (state.current === state.playing) {
            bird.velocityY += bird.gravity;
            bird.y += bird.velocityY;

            background.x1 -= pipeSpeed / 2;
            background.x2 -= pipeSpeed / 2;
            if (background.x1 <= -background.width) background.x1 = background.width;
            if (background.x2 <= -background.width) background.x2 = background.width;

            pipes.forEach(pipe => {
                pipe.x -= pipeSpeed;
                if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                if (pipe.y === 0) {
                    score++;
                    sfx.point.play();
                }
                    pipe.passed = true;
                }
            });

            if (pipes.length > 0 && pipes[0].x < -pipeWidth) {
                pipes.splice(0, 2);
            }

            checkCollisions();
        }
    }

    function checkCollisions() {
        // Ground collision
        if (bird.y + bird.height >= ground.y || bird.y <= 0) {
            state.current = state.gameOver;
            sfx.hit.play();
            changeStateToGameOver();
        }

        // Pipe collision
        for (let pipe of pipes) {
            if (bird.x < pipe.x + pipe.width &&
                bird.x + bird.width > pipe.x &&
                bird.y < pipe.y + pipe.height &&
                bird.y + bird.height > pipe.y) {
                state.current = state.gameOver;
                sfx.hit.play();
                changeStateToGameOver();
            }
        }
    }

    function changeStateToGameOver() {
        state.current = state.gameOver;
        clearInterval(pipeGenerator);

        // Check for new high score and save it
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('bouncyBeakHighScore', highScore);
        }
    }

    function restartGame() {
        bird.y = 150;
        bird.velocityY = 0;
        pipes = [];
        score = 0;
        state.current = state.getReady;
        clearInterval(pipeGenerator); // Clear any existing interval
    }

    // Main Click/Tap Handler
    function handleInput() {
        switch (state.current) {
            case state.getReady:
                state.current = state.playing;
                pipeGenerator = setInterval(generatePipes, 1500);
                // Fall-through to flap on the first click
            case state.playing:
                bird.velocityY = bird.flapStrength;
                sfx.wing.play();
                break;
            case state.gameOver:
                restartGame();
                break;
        }
    }

    document.addEventListener('keydown', event => { if (event.code === 'Space') handleInput(); });
    document.addEventListener('mousedown', handleInput);
    document.addEventListener('touchstart', handleInput);

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Initialize game
    restartGame(); // Start in the 'getReady' state
};