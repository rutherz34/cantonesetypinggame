/**
 * Ball class represents a falling character in the game
 * Each ball contains a Cantonese character and its Jyutping
 */
class Ball {
    /**
     * Creates a new ball
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {Object} character - Character object with 'char' and 'jyutping' properties
     * @param {string|null} powerup - The powerup type (e.g., 'red', 'blue') or null
     */
    constructor(x, y, character, powerup = null) {
        this.x = x;
        this.y = y;
        this.character = character;
        this.powerup = powerup;
        this.speed = CONFIG.BALL_SPEED;
        this.size = CONFIG.BALL_RADIUS * 2; // diameter = 2 * radius
        this.burstAnimation = false;        // Whether the ball is in burst animation
        this.burstTimer = 0;               // Timer for burst animation
    }
    
    /**
     * Updates ball position and animation state
     * @returns {boolean} true if the ball should be removed
     */
    update() {
        if (!this.burstAnimation) {
            // Normal falling movement - only if not frozen
            if (typeof isFrozen === 'undefined' || !isFrozen) {
                this.y += this.speed;
            }
        } else {
            // Update burst animation
            this.burstTimer++;
            if (this.burstTimer > 20) {
                return true; // Remove ball after animation completes
            }
        }
        return false;
    }
    
    /**
     * Draws the ball and its character
     * Handles both normal and burst animation states
     */
    draw() {
        if (this.burstAnimation) {
            // Draw burst animation
            push();
            translate(this.x, this.y);
            let scale = map(this.burstTimer, 0, 20, 1, 2);    // Ball grows during burst
            let alpha = map(this.burstTimer, 0, 20, 255, 0);  // Fades out during burst
            
            // Burst color based on powerup
            let burstColor = this.powerup ? this.getPowerupColor() : color(255, 255, 255);
            burstColor.setAlpha(alpha);
            fill(burstColor);
            noStroke();
            ellipse(0, 0, this.size * scale);
            pop();
        } else {
            // Draw normal ball
            if (this.powerup) {
                fill(this.getPowerupColor());
            } else {
                fill(255); // Default white background
            }
            stroke(0);        // Black border
            strokeWeight(2);
            ellipse(this.x, this.y, this.size);
            
            // Draw character with GenSen font
            fill(0);          // Black text
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(28);
            textFont('GenSenRounded'); // Use GenSen font
            text(this.character.char, this.x, this.y);
            
            // Draw jyutping hint if hint system is active
            if (typeof isHintActive !== 'undefined' && isHintActive) {
                push();
                fill(128, 128, 128, 128); // Grey with 50% transparency
                noStroke();
                textAlign(CENTER, CENTER);
                textSize(16);
                textFont('Arial'); // Use Arial for jyutping (no need for Chinese font)
                
                // Handle multiple jyutping pronunciations
                let jyutpingText = '';
                if (Array.isArray(this.character.jyutping)) {
                    jyutpingText = this.character.jyutping.join(', ');
                } else {
                    jyutpingText = this.character.jyutping;
                }
                
                text(jyutpingText, this.x, this.y - this.size/2 - 15);
                pop();
            }
        }
    }
    
    /**
     * Checks if the ball has reached the red line
     * @returns {boolean} true if the ball has reached the red line
     */
    isAtRedLine() {
        return this.y + this.size/2 >= redLineY;
    }
    
    /**
     * Starts the burst animation when correct Jyutping is typed
     */
    burst() {
        this.burstAnimation = true;
        this.burstTimer = 0;
    }

    /**
     * Gets the color associated with the ball's powerup
     * @returns {p5.Color} The color for the powerup
     */
    getPowerupColor() {
        switch (this.powerup) {
            case 'red':
                return color(255, 77, 77); // A nice red
            case 'yellow':
                return color(255, 255, 102); // A nice yellow
            case 'blue':
                return color(77, 77, 255);  // A nice blue
            case 'green':
                return color(77, 255, 77);  // A nice green
            default:
                return color(255); // Default white
        }
    }
}