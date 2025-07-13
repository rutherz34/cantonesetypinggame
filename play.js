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
// STATISTICS TRACKING
// ========================================

// Game session statistics
let gameStats = {
    // Basic game info
    startTime: null,
    endTime: null,
    username: '',
    
    // Score and lives
    finalScore: 0,
    maxLives: CONFIG.INITIAL_LIVES,
    maxMultiplier: 1,
    
    // Power-up collection
    redBallsCollected: 0,
    blueBallsCollected: 0,
    yellowBallsCollected: 0,
    greenBallsCollected: 0,
    
    // Game mechanics
    ballsBurst: 0,
    ballsClicked: 0,
    
    // Jyutping tone statistics
    tone1Correct: 0,
    tone2Correct: 0,
    tone3Correct: 0,
    tone4Correct: 0,
    tone5Correct: 0,
    tone6Correct: 0,
    
    // Repeated correct inputs
    repeatedCorrect: 0,
    
    // Track for repeated inputs
    lastCorrectJyutping: null,
    correctJyutpingCount: 0
};

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
// STATISTICS FUNCTIONS
// ========================================

/**
 * Initialize game statistics
 */
function initializeGameStats() {
    gameStats = {
        startTime: new Date().toISOString(),
        endTime: null,
        username: document.getElementById('playerName')?.value || '匿名玩家',
        
        finalScore: 0,
        maxLives: CONFIG.INITIAL_LIVES,
        maxMultiplier: 1,
        
        redBallsCollected: 0,
        blueBallsCollected: 0,
        yellowBallsCollected: 0,
        greenBallsCollected: 0,
        
        ballsBurst: 0,
        ballsClicked: 0,
        
        tone1Correct: 0,
        tone2Correct: 0,
        tone3Correct: 0,
        tone4Correct: 0,
        tone5Correct: 0,
        tone6Correct: 0,
        
        repeatedCorrect: 0,
        
        lastCorrectJyutping: null,
        correctJyutpingCount: 0
    };
}

/**
 * Track jyutping tone statistics
 * @param {string} jyutping - The correct jyutping input
 */
function trackJyutpingTone(jyutping) {
    // Extract tone number from jyutping (last character)
    const tone = jyutping.slice(-1);
    
    console.log('🎵 Tracking jyutping tone:', jyutping, 'tone:', tone);
    
    switch(tone) {
        case '1':
            gameStats.tone1Correct++;
            break;
        case '2':
            gameStats.tone2Correct++;
            break;
        case '3':
            gameStats.tone3Correct++;
            break;
        case '4':
            gameStats.tone4Correct++;
            break;
        case '5':
            gameStats.tone5Correct++;
            break;
        case '6':
            gameStats.tone6Correct++;
            break;
    }
    
    // Track repeated correct inputs
    if (jyutping === gameStats.lastCorrectJyutping) {
        gameStats.repeatedCorrect++;
        console.log('🔄 Repeated correct input:', jyutping);
    }
    gameStats.lastCorrectJyutping = jyutping;
}

/**
 * Track power-up collection
 * @param {string} powerupType - Type of power-up collected
 */
function trackPowerupCollection(powerupType) {
    console.log('⚡ Tracking power-up collection:', powerupType);
    
    switch(powerupType) {
        case 'red':
            gameStats.redBallsCollected++;
            break;
        case 'blue':
            gameStats.blueBallsCollected++;
            break;
        case 'yellow':
            gameStats.yellowBallsCollected++;
            break;
        case 'green':
            gameStats.greenBallsCollected++;
            break;
    }
}

/**
 * Update maximum statistics
 */
function updateMaxStats() {
    if (lives > gameStats.maxLives) {
        gameStats.maxLives = lives;
    }
    if (scoreMultiplier > gameStats.maxMultiplier) {
        gameStats.maxMultiplier = scoreMultiplier;
    }
}

/**
 * Save detailed game statistics to scores table
 */
async function saveDetailedStats() {
    gameStats.endTime = new Date().toISOString();
    gameStats.finalScore = score;
    
    // Debug logging
    console.log('=== SAVING DETAILED STATISTICS ===');
    console.log('Game Stats:', gameStats);
    console.log('Final Score:', score);
    console.log('Balls Burst:', gameStats.ballsBurst);
    console.log('Power-ups Collected:', {
        red: gameStats.redBallsCollected,
        blue: gameStats.blueBallsCollected,
        yellow: gameStats.yellowBallsCollected,
        green: gameStats.greenBallsCollected
    });
    console.log('=====================================');
    
    try {
        // Send detailed stats to Supabase API
        const scoreData = {
            name: gameStats.username || '匿名玩家',
            score: gameStats.finalScore,
            startTime: gameStats.startTime,
            endTime: gameStats.endTime,
            maxLives: gameStats.maxLives,
            maxMultiplier: gameStats.maxMultiplier,
            redBallsCollected: gameStats.redBallsCollected,
            blueBallsCollected: gameStats.blueBallsCollected,
            yellowBallsCollected: gameStats.yellowBallsCollected,
            greenBallsCollected: gameStats.greenBallsCollected,
            ballsBurst: gameStats.ballsBurst,
            ballsClicked: gameStats.ballsClicked,
            tone1Correct: gameStats.tone1Correct,
            tone2Correct: gameStats.tone2Correct,
            tone3Correct: gameStats.tone3Correct,
            tone4Correct: gameStats.tone4Correct,
            tone5Correct: gameStats.tone5Correct,
            tone6Correct: gameStats.tone6Correct,
            repeatedCorrect: gameStats.repeatedCorrect
        };
        
        // Try to save to Supabase directly first
        if (typeof saveScoreToSupabase === 'function') {
            const result = await saveScoreToSupabase(scoreData);
            if (result.success) {
                console.log('✅ Game statistics saved to Supabase successfully:', result);
            } else {
                throw new Error('Failed to save score to Supabase');
            }
        } else {
            // Fallback to server API
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Game statistics saved to server successfully:', result);
            } else {
                throw new Error('Failed to save score to server');
            }
        }
        
        // Also save to localStorage as backup
        const storedScores = localStorage.getItem('jyutpingScores');
        const scores = storedScores ? JSON.parse(storedScores) : [];
        
        const newScore = {
            name: gameStats.username || '匿名玩家',
            score: gameStats.finalScore,
            date: new Date().toLocaleDateString('zh-Hant'),
            time: new Date().toLocaleTimeString('zh-Hant'),
            startTime: gameStats.startTime,
            endTime: gameStats.endTime,
            maxLives: gameStats.maxLives,
            maxMultiplier: gameStats.maxMultiplier,
            redBallsCollected: gameStats.redBallsCollected,
            blueBallsCollected: gameStats.blueBallsCollected,
            yellowBallsCollected: gameStats.yellowBallsCollected,
            greenBallsCollected: gameStats.greenBallsCollected,
            ballsBurst: gameStats.ballsBurst,
            ballsClicked: gameStats.ballsClicked,
            tone1Correct: gameStats.tone1Correct,
            tone2Correct: gameStats.tone2Correct,
            tone3Correct: gameStats.tone3Correct,
            tone4Correct: gameStats.tone4Correct,
            tone5Correct: gameStats.tone5Correct,
            tone6Correct: gameStats.tone6Correct,
            repeatedCorrect: gameStats.repeatedCorrect
        };
        
        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 100 scores
        if (scores.length > 100) {
            scores.splice(100);
        }
        
        localStorage.setItem('jyutpingScores', JSON.stringify(scores));
        console.log('✅ Game statistics also saved to localStorage as backup');
        
        // Refresh scoreboard if it's currently displayed
        if (typeof displayScoreboard === 'function') {
            setTimeout(() => {
                displayScoreboard();
            }, 500); // Small delay to ensure the score is saved
        }
    } catch (error) {
        console.warn('❌ Error saving game statistics to server, falling back to localStorage:', error);
        
        // Fallback to localStorage only
        try {
            const storedScores = localStorage.getItem('jyutpingScores');
            const scores = storedScores ? JSON.parse(storedScores) : [];
            
            const newScore = {
                name: gameStats.username || '匿名玩家',
                score: gameStats.finalScore,
                date: new Date().toLocaleDateString('zh-Hant'),
                time: new Date().toLocaleTimeString('zh-Hant'),
                startTime: gameStats.startTime,
                endTime: gameStats.endTime,
                maxLives: gameStats.maxLives,
                maxMultiplier: gameStats.maxMultiplier,
                redBallsCollected: gameStats.redBallsCollected,
                blueBallsCollected: gameStats.blueBallsCollected,
                yellowBallsCollected: gameStats.yellowBallsCollected,
                greenBallsCollected: gameStats.greenBallsCollected,
                ballsBurst: gameStats.ballsBurst,
                ballsClicked: gameStats.ballsClicked,
                tone1Correct: gameStats.tone1Correct,
                tone2Correct: gameStats.tone2Correct,
                tone3Correct: gameStats.tone3Correct,
                tone4Correct: gameStats.tone4Correct,
                tone5Correct: gameStats.tone5Correct,
                tone6Correct: gameStats.tone6Correct,
                repeatedCorrect: gameStats.repeatedCorrect
            };
            
            scores.push(newScore);
            scores.sort((a, b) => b.score - a.score);
            
            // Keep only top 100 scores
            if (scores.length > 100) {
                scores.splice(100);
            }
            
            localStorage.setItem('jyutpingScores', JSON.stringify(scores));
            console.log('✅ Game statistics saved to localStorage as fallback');
        } catch (localError) {
            console.error('❌ Error saving to localStorage:', localError);
        }
    }
}

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
    
    // Initialize statistics tracking
    initializeGameStats();
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
    
    // Update maximum statistics
    updateMaxStats();
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
            // Track power-up collection
            if (balls[i].powerup) {
                trackPowerupCollection(balls[i].powerup);
            }
            
            // Track jyutping tone statistics
            trackJyutpingTone(input);
            
            // Activate power-up if one exists
            if (balls[i].powerup) {
                activatePowerup(balls[i].powerup);
            }
            
            balls[i].burst();
            gameStats.ballsBurst++;
            console.log('💥 Ball burst! Total burst:', gameStats.ballsBurst);
            
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
    
    // Save detailed statistics
    saveDetailedStats();
    
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
            gameStats.ballsClicked++;
            // Track power-up collection
            if (ball.powerup) {
                trackPowerupCollection(ball.powerup);
            }
            
            // If the ball has a powerup, activate it first
            if (ball.powerup) {
                activatePowerup(ball.powerup);
            }
            
            // Then burst the ball
            ball.burst();
            gameStats.ballsBurst++;
            
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

// Comment System Functions
function toggleComments() {
    const commentSection = document.getElementById('commentSection');
    if (commentSection.classList.contains('show')) {
        hideComments();
    } else {
        showComments();
    }
}

function showComments() {
    const commentSection = document.getElementById('commentSection');
    commentSection.classList.add('show');
    loadComments(); // Load comments when showing
    // Focus on input for better UX
    setTimeout(() => {
        const commentInput = document.getElementById('commentInput');
        if (commentInput) {
            commentInput.focus();
        }
    }, 100);
}

function hideComments() {
    const commentSection = document.getElementById('commentSection');
    commentSection.classList.remove('show');
}

async function loadComments() {
    console.log('Loading comments...');
    try {
        // Try to load from Supabase first
        if (typeof loadCommentsFromSupabase === 'function') {
            const comments = await loadCommentsFromSupabase();
            console.log('Comments loaded from Supabase:', comments);
            displayComments(comments);
        } else {
            // Fallback to localStorage
            const storedComments = localStorage.getItem('gameComments');
            const comments = storedComments ? JSON.parse(storedComments) : [];
            console.log('Comments loaded from localStorage:', comments);
            displayComments(comments);
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            commentsList.innerHTML = '<p style="text-align: center; color: #ff0000;">載入留言失敗</p>';
        }
    }
}

function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">暫時冇留言</p>';
        return;
    }
    
    comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        const commentText = document.createElement('p');
        commentText.className = 'comment-text';
        commentText.textContent = comment.text;
        
        const commentTime = document.createElement('p');
        commentTime.className = 'comment-time';
        commentTime.textContent = new Date(comment.timestamp).toLocaleString('zh-Hant');
        
        commentDiv.appendChild(commentText);
        commentDiv.appendChild(commentTime);
        commentsList.appendChild(commentDiv);
    });
    
    // Scroll to bottom to show latest comments
    commentsList.scrollTop = commentsList.scrollHeight;
}

async function submitComment() {
    const commentInput = document.getElementById('commentInput');
    const submitButton = document.getElementById('submitComment');
    const comment = commentInput.value.trim();
    
    console.log('Submitting comment:', comment);
    
    if (!comment) {
        alert('請輸入留言內容');
        return;
    }
    
    // Disable button and input during submission
    submitButton.disabled = true;
    commentInput.disabled = true;
    
    try {
        // Try to save to Supabase first
        if (typeof saveCommentToSupabase === 'function') {
            const commentData = {
                text: comment,
                timestamp: new Date().toISOString()
            };
            
            const result = await saveCommentToSupabase(commentData);
            if (result.success) {
                console.log('Comment saved to Supabase successfully');
                commentInput.value = '';
                // Reload comments to show the new one
                await loadComments();
            } else {
                throw new Error('Failed to save comment to Supabase');
            }
        } else {
            // Fallback to localStorage
            const storedComments = localStorage.getItem('gameComments');
            const comments = storedComments ? JSON.parse(storedComments) : [];
            
            // Add new comment
            const newComment = {
                id: Date.now(), // Simple ID generation
                text: comment,
                timestamp: new Date().toISOString()
            };
            
            comments.unshift(newComment); // Add to beginning
            
            // Keep only the latest 50 comments to prevent localStorage from getting too large
            const limitedComments = comments.slice(0, 50);
            
            // Save back to localStorage
            localStorage.setItem('gameComments', JSON.stringify(limitedComments));
            
            console.log('Comment saved to localStorage successfully');
            
            // Clear input and reload comments
            commentInput.value = '';
            displayComments(limitedComments);
        }
        
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('留言發送失敗，請再試一次');
    } finally {
        // Re-enable button and input
        submitButton.disabled = false;
        commentInput.disabled = false;
        commentInput.focus();
    }
}

// Allow Enter key to submit comment
document.addEventListener('DOMContentLoaded', function() {
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitComment();
            }
        });
    }
    
    // Comments are now loaded when the window is shown via toggleComments()
});