/**
 * 粵拼打字遊戲 (Cantonese Jyutping Typing Game)
 * A game where players type Jyutping (Cantonese romanization) for falling characters
 */

// ========================================
// GAME CONFIGURATION
// ========================================

const CONFIG = {
    // Canvas dimensions
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Ball properties
    BALL_RADIUS: 30,        // Size of the falling character balls
    BALL_SPEED: 1.5,        // How fast the balls fall (pixels per frame)
    BALL_SPAWN_INTERVAL: 2000, // Time between new balls (milliseconds)
    
    // Game layout
    RED_LINE_OFFSET: 80,    // Distance from bottom to the red line (pixels)
    INPUT_MARGIN: 10,       // Margin between red line and input field
    UI_MARGIN: 20,          // Margin for UI elements
    
    // Game settings
    INITIAL_LIVES: 3,       // Starting number of lives
    SCORE_INCREMENT: 1,      // Points earned for each correct answer

    // Power-up settings
    POWERUP_CHANCE: 0.15, // Chance of a ball having a power-up (15%)
    POWERUP_TYPES: ['red', 'yellow', 'blue', 'green'],
    
    // Sound settings
    SOUND_VOLUMES: {
        gameOver: 0.7,
        pop: 0.5,
        powerup: 0.6,
        dead: 0.5
    }
};

// ========================================
// GAME STATE
// ========================================

const GameState = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// Core game state
let gameState = GameState.START;
let score = 0;
let lives = CONFIG.INITIAL_LIVES;
let balls = [];
let lastBallSpawn = 0;
let redLineY;
let inputField;

// Power-up state
let isClickToBurstActive = false;
let isFrozen = false;
let scoreMultiplier = 1;
let yellowPowerupEndTime = 0;
let bluePowerupEndTime = 0;

// Hint system state
let isHintActive = false;
let hintStartTime = 0;

// Character selection
let lastSelectedCharacter = null;

// ========================================
// SOUND SYSTEM
// ========================================

let gameOverSound, popSound, powerupSound, deadSound;
let isSoundMuted = false;

/**
 * Generic sound player function
 * @param {HTMLAudioElement} sound - Audio element to play
 * @param {string} soundType - Type of sound for volume control
 */
function playSound(sound, soundType) {
    if (isSoundMuted || !sound || sound.readyState < 2) return;
    
    sound.currentTime = 0;
    sound.volume = CONFIG.SOUND_VOLUMES[soundType] || 0.5;
    sound.play().catch(e => console.log(`Could not play ${soundType} sound:`, e));
}

/**
 * Toggles sound on/off
 */
function toggleSound() {
    isSoundMuted = !isSoundMuted;
}

// Sound wrapper functions for backward compatibility
function playGameOverSound() { playSound(gameOverSound, 'gameOver'); }
function playPopSound() { playSound(popSound, 'pop'); }
function playPowerupSound() { playSound(powerupSound, 'powerup'); }
function playDeadSound() { playSound(deadSound, 'dead'); }

// ========================================
// P5.JS SETUP AND DRAW
// ========================================

/**
 * p5.js setup function - called once when the game starts
 * Initializes the canvas and game elements
 */
function setup() {
    let canvas = createCanvas(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    canvas.parent('canvasContainer');
    redLineY = height - CONFIG.RED_LINE_OFFSET;
    
    initializeAudio();
    initializeInputField();
    
    lastBallSpawn = millis();
    draw();
}

/**
 * p5.js draw function - called every frame
 * Updates and draws the game state
 */
function draw() {
    drawGame();
    
    if (gameState === GameState.PLAYING) {
        updateGame();
    }
}

// ========================================
// INITIALIZATION FUNCTIONS
// ========================================

/**
 * Initialize audio elements
 */
function initializeAudio() {
    gameOverSound = document.getElementById('gameOverSound');
    popSound = document.getElementById('popSound');
    powerupSound = document.getElementById('powerupSound');
    deadSound = document.getElementById('deadSound');
    
    // Unmute and prepare all audio elements
    [gameOverSound, popSound, powerupSound, deadSound].forEach(sound => {
        if (sound) {
            sound.muted = false;
            sound.load();
        }
    });
}

/**
 * Initialize input field
 */
function initializeInputField() {
    inputField = createInput('', 'text');
    inputField.parent('canvasContainer');
    inputField.attribute('placeholder', '輸入粵拼');
    inputField.attribute('autocomplete', 'off');
    inputField.id('jyutpingInput');
    
    inputField.input(handleInput);
    inputField.elt.addEventListener('keydown', handleKeyDown);
    inputField.elt.style.display = 'none';
}

// ========================================
// GAME CONTROL FUNCTIONS
// ========================================

/**
 * Starts the game when the start button is clicked
 */
function startGame() {
    gameState = GameState.PLAYING;
    document.getElementById('startScreen').style.display = 'none';
    inputField.elt.style.display = 'block';
    inputField.elt.focus();
}

/**
 * Updates game state each frame
 * Handles ball spawning and movement
 */
function updateGame() {
    // Spawn new balls at regular intervals (only if not frozen)
    if (!isFrozen && millis() - lastBallSpawn > CONFIG.BALL_SPAWN_INTERVAL) {
        spawnBall();
        lastBallSpawn = millis();
    }
    
    // Update all balls
    for (let i = balls.length - 1; i >= 0; i--) {
        const shouldRemove = balls[i].update();
        
        if (shouldRemove) {
            balls.splice(i, 1);
        } else if (!isFrozen && balls[i].isAtRedLine()) {
            loseLife();
            balls.splice(i, 1);
        }
    }
    
    // Handle power-up timers
    handlePowerupTimers();
}

/**
 * Draws all game elements
 * Includes background, red line, balls, and UI
 */
function drawGame() {
    // Draw light blue background
    background(173, 216, 230);
    
    // Draw red line (solid)
    stroke(255, 0, 0);
    strokeWeight(3);
    line(0, redLineY, CONFIG.CANVAS_WIDTH, redLineY);
    
    // Draw all active balls
    for (let ball of balls) {
        ball.draw();
    }
    
    // Draw UI elements
    drawUI();
}

/**
 * Draws the game UI elements (lives and score)
 */
function drawUI() {
    push(); // Save current drawing state
    
    // Remove any stroke/border for UI elements
    noStroke();
    
    // Set font for UI elements to match the game
    textFont('GenSenRounded');
    
    // Draw lives (one heart with number)
    textAlign(LEFT, TOP);
    textSize(24);
    fill(255, 0, 0);
    let heartX = CONFIG.UI_MARGIN;
    let heartY = CONFIG.UI_MARGIN;
    text('♥', heartX, heartY);
    
    // Draw lives number next to heart
    fill(0); // Black text for the number
    textSize(20);
    textAlign(LEFT, TOP);
    text(lives, heartX + 30, heartY);
    
    // Draw score in center of canvas
    textAlign(CENTER, TOP);
    fill(0); // Black text
    textSize(36); // Increased font size
    text(score, CONFIG.CANVAS_WIDTH / 2, CONFIG.UI_MARGIN);
    
    // Draw score multiplier if it's > 1
    if (scoreMultiplier > 1) {
        textAlign(CENTER, TOP);
        fill(50, 205, 50); // Lime green for multiplier
        textSize(24);
        text(`x${scoreMultiplier}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.UI_MARGIN + 40);
    }
    
    // Draw lightbulb hint icon in top-right corner
    drawLightbulbIcon();
    
    // Draw power-up timers
    if (isFrozen) {
        let timeLeft = ceil((bluePowerupEndTime - millis()) / 1000);
        textAlign(CENTER, TOP);
        fill(77, 77, 255);
        textSize(20);
        text(`凍結: ${timeLeft}s`, CONFIG.CANVAS_WIDTH / 2, CONFIG.UI_MARGIN + 70);
    } else if (isClickToBurstActive) {
        let timeLeft = ceil((yellowPowerupEndTime - millis()) / 1000);
        textAlign(CENTER, TOP);
        fill(255, 204, 0);
        textSize(20);
        text(`點擊爆破: ${timeLeft}s`, CONFIG.CANVAS_WIDTH / 2, CONFIG.UI_MARGIN + 70);
    }

    pop(); // Restore drawing state
}

/**
 * Draws the lightbulb hint icon and mute button
 */
function drawLightbulbIcon() {
    let iconX = CONFIG.CANVAS_WIDTH - CONFIG.UI_MARGIN - 20;
    let iconY = CONFIG.UI_MARGIN + 15;
    let iconSize = 30;
    
    // Set font for consistency
    textFont('GenSenRounded');
    
    // Draw lightbulb background circle
    fill(isHintActive ? color(255, 255, 0, 150) : color(200, 200, 200, 150));
    ellipse(iconX, iconY, iconSize);
    
    // Draw lightbulb icon (simplified)
    fill(isHintActive ? color(255, 255, 0) : color(100, 100, 100));
    textAlign(CENTER, CENTER);
    textSize(20);
    text('💡', iconX, iconY);
    
    // Draw hint text
    if (isHintActive) {
        textAlign(CENTER, TOP);
        fill(100, 100, 100);
        textSize(12);
        text('按住顯示提示', iconX, iconY + 20);
    }
    
    // Draw mute button below hint button
    let muteIconY = iconY + 50; // Position below hint button
    
    // Draw mute button background circle
    fill(isSoundMuted ? color(255, 100, 100, 150) : color(200, 200, 200, 150));
    ellipse(iconX, muteIconY, iconSize);
    
    // Draw mute icon
    fill(isSoundMuted ? color(255, 100, 100) : color(100, 100, 100));
    textAlign(CENTER, CENTER);
    textSize(20);
    text(isSoundMuted ? '🔇' : '🔊', iconX, muteIconY);
}

/**
 * Selects a character based on frequency weights, avoiding consecutive repeats
 */
function selectCharacterByFrequency() {
    // Single formula: weight = frequency * (1 if not last character, 0 if last character)
    let totalWeight = characters.reduce((sum, char) => 
        sum + (char === lastSelectedCharacter ? 0 : char.frequency), 0);
    
    let randomValue = random(totalWeight);
    let cumulativeWeight = 0;
    
    for (let char of characters) {
        if (char !== lastSelectedCharacter) {
            cumulativeWeight += char.frequency;
            if (randomValue <= cumulativeWeight) {
                lastSelectedCharacter = char;
                return char;
            }
        }
    }
    
    // Fallback
    return characters[0];
}

/**
 * Creates a new ball with a random character
 * Positioned at the top of the screen
 */
function spawnBall() {
    let x = random(60, CONFIG.CANVAS_WIDTH - 60);
    let y = -30;
    let character = selectCharacterByFrequency();

    // Determine if the ball should have a power-up
    let powerup = null;
    if (random() < CONFIG.POWERUP_CHANCE) {
        powerup = random(CONFIG.POWERUP_TYPES);
        console.log('Spawned ball with powerup:', powerup, 'character:', character.char);
    }
    
    balls.push(new Ball(x, y, character, powerup));
}

/**
 * Handles keyboard input for Jyutping typing
 */
function handleInput() {
    // This function is kept for any real-time input handling if needed
}

/**
 * Handles keydown events for the input field
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyDown(event) {
    if (gameState !== GameState.PLAYING) return;
    
    if (event.key === 'Enter') {
        let input = inputField.value().toLowerCase().trim();
        if (input) {
            checkMatch(input);
            inputField.value('');
        }
    }
}

/**
 * Checks if the typed Jyutping matches any falling character
 * @param {string} input - The typed Jyutping
 */
function checkMatch(input) {
    let found = false;
    for (let i = 0; i < balls.length; i++) {
        // Check if input matches any of the character's jyutping pronunciations
        let character = balls[i].character;
        let isMatch = false;
        
        // Handle both array and string formats for backward compatibility
        if (Array.isArray(character.jyutping)) {
            isMatch = character.jyutping.includes(input);
        } else {
            isMatch = character.jyutping === input;
        }
        
        if (isMatch && !balls[i].burstAnimation) {
            // Activate power-up if one exists
            if (balls[i].powerup) {
                activatePowerup(balls[i].powerup);
            }
            
            balls[i].burst();
            // Play appropriate sound based on whether ball has powerup
            if (balls[i].powerup) {
                playPowerupSound(); // Play powerup sound for colored balls
            } else {
                playPopSound(); // Play pop sound for regular balls
            }
            score += CONFIG.SCORE_INCREMENT * scoreMultiplier;
            found = true;
            break;
        }
    }
    
    if (!found) {
        // Visual feedback for incorrect input
        let inputElement = document.getElementById('jyutpingInput');
        inputElement.style.backgroundColor = '#ffcccc';
        setTimeout(() => inputElement.style.backgroundColor = '', 300);
    }
}

/**
 * Activates the corresponding power-up effect
 * @param {string} powerup - The type of power-up to activate
 */
function activatePowerup(powerup) {
    console.log('Powerup activated:', powerup); // Debug log
    switch (powerup) {
        case 'red':
            // Red: Give one life.
            lives++;
            console.log('Red powerup: Lives increased to', lives);
            break;
        case 'yellow':
            // Yellow: Make any balls disappear by clicking on them for 5 seconds.
            isClickToBurstActive = true;
            yellowPowerupEndTime = millis() + 5000;
            cursor(HAND);
            console.log('Yellow powerup: Click to burst activated');
            break;
        case 'blue':
            // Blue: Freeze all the balls for 5 seconds.
            isFrozen = true;
            bluePowerupEndTime = millis() + 5000;
            console.log('Blue powerup: Freeze activated, end time:', bluePowerupEndTime);
            break;
        case 'green':
            // Green: Score multiplier for each ball shot down by +1.
            scoreMultiplier++;
            console.log('Green powerup: Score multiplier increased to', scoreMultiplier);
            break;
    }
}

/**
 * Handles losing a life
 * Triggers game over if no lives remain
 */
function loseLife() {
    lives--;
    scoreMultiplier = 1;
    if (lives <= 0) {
        lives = 0;
        gameOver();
    }
}

/**
 * Handles game over state
 * Shows game over screen with final score
 */
function gameOver() {
    gameState = GameState.GAME_OVER;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'block';
    
    // Play game over sound
    playGameOverSound();
}

/**
 * Resets the game to initial state
 * Called when restarting after game over
 */
function restartGame() {
    // Reset game state
    gameState = GameState.START;
    score = 0;
    lives = CONFIG.INITIAL_LIVES;
    balls = [];
    lastBallSpawn = millis();
    
    // Reset power-ups
    scoreMultiplier = 1;
    isFrozen = false;
    isClickToBurstActive = false;
    cursor(ARROW);

    // Reset hint system
    isHintActive = false;

    // Hide game over screen and show start screen
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    
    // Clear input field
    inputField.value('');
}

/**
 * Handles mouse press events for the yellow power-up
 */
function mousePressed() {
    if (gameState !== GameState.PLAYING) return;

    // Check if lightbulb hint icon was clicked
    let iconX = CONFIG.CANVAS_WIDTH - CONFIG.UI_MARGIN - 20;
    let iconY = CONFIG.UI_MARGIN + 15;
    let iconSize = 30;
    
    if (dist(mouseX, mouseY, iconX, iconY) < iconSize/2) {
        // Lightbulb clicked - activate hint system
        isHintActive = true;
        hintStartTime = millis();
        return;
    }
    
    // Check if mute button was clicked
    let muteIconY = iconY + 50; // Same position as drawn in drawLightbulbIcon
    if (dist(mouseX, mouseY, iconX, muteIconY) < iconSize/2) {
        // Mute button clicked - toggle sound
        toggleSound();
        return;
    }

    // Check for yellow power-up clicking mode
    if (!isClickToBurstActive) return;

    // Check if a ball was clicked
    for (let i = balls.length - 1; i >= 0; i--) {
        let ball = balls[i];
        if (!ball.burstAnimation && dist(mouseX, mouseY, ball.x, ball.y) < ball.size / 2) {
            // If the ball has a powerup, activate it first
            if (ball.powerup) {
                activatePowerup(ball.powerup);
            }
            
            // Then burst the ball
            ball.burst();
            // Play appropriate sound based on whether ball has powerup
            if (ball.powerup) {
                playPowerupSound(); // Play powerup sound for colored balls
            } else {
                playPopSound(); // Play pop sound for regular balls
            }
            score += CONFIG.SCORE_INCREMENT * scoreMultiplier; // Also give points for clicked balls
        }
    }
}

/**
 * Handles mouse release events
 */
function mouseReleased() {
    if (gameState !== GameState.PLAYING) return;
    
    // Deactivate hint system when mouse is released
    if (isHintActive) {
        isHintActive = false;
    }
}

/**
 * Manages the timers for active power-ups
 */
function handlePowerupTimers() {
    if (isClickToBurstActive && millis() > yellowPowerupEndTime) {
        isClickToBurstActive = false;
        cursor(ARROW);
        console.log('Yellow powerup: Click to burst deactivated');
    }
    if (isFrozen && millis() > bluePowerupEndTime) {
        isFrozen = false;
        console.log('Blue powerup: Freeze deactivated');
    }
    
    // Debug: Log current freeze status
    if (isFrozen) {
        let timeLeft = ceil((bluePowerupEndTime - millis()) / 1000);
        console.log('Freeze active, time left:', timeLeft, 'seconds');
    }
}