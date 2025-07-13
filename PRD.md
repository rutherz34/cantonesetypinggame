---
output:
  html_document: default
  pdf_document: default
---

# Product Requirements Document (PRD)

## Jyutping Typing Game

### Executive Summary

**Product Name:** Jyutping Typing Game\
**Version:** 1.0\
**Target Platform:** Web (Desktop/Mobile)\
**Primary Language:** Cantonese (Jyutping romanization)\
**Target Audience:** Cantonese learners, language enthusiasts

### Product Overview

The Jyutping Typing Game is an educational web-based game that helps players learn Cantonese Jyutping romanization through interactive gameplay. Players type falling characters to score points while avoiding game-over conditions.

### Core Features

#### 1. Gameplay Mechanics

-   **Falling Characters:** Cantonese characters fall from the top of the screen
-   **Typing Input:** Players type the corresponding Jyutping romanization
-   **Scoring System:** Points awarded for correct answers, deducted for incorrect
-   **Lives System:** Players start with 3 lives, lose life when character reaches bottom
-   **Difficulty Progression:** Speed increases over time

#### 2. Power-up System

-   **Red Power-up:** Double points for a limited time
-   **Blue Power-up:** Freezes all falling characters temporarily
-   **Green Power-up:** Slows down falling speed
-   **Yellow Power-up:** Provides hints for current character

#### 3. User Interface

-   **Main Menu:** Start game, view scores, contact info
-   **Game Screen:** Canvas-based gameplay with UI overlays
-   **Score Display:** Current score, lives, level
-   **Game Over Screen:** Final score, restart option, return to menu
-   **Scoreboard:** Top scores with player names
-   **Contact Modal:** Email contact for feedback

#### 4. Audio System

-   **Sound Effects:** Character typing, power-up collection, game over
-   **Audio Controls:** Mute/unmute functionality

### Technical Requirements

#### Frontend Technologies

-   **HTML5:** Semantic structure, canvas element
-   **CSS3:** Responsive design, animations, styling
-   **JavaScript (ES6+):** Game logic, DOM manipulation, event handling
-   **Canvas API:** Game rendering and animation
-   **Web Audio API:** Sound effects and audio management

#### Backend Technologies

-   **Node.js:** Server runtime
-   **Express.js:** Web server framework
-   **SQLite:** Local database for score storage
-   **RESTful API:** Score submission and retrieval

#### File Structure

```         
web/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── play.js            # Main game logic
├── ball.js            # Character/ball class
├── characters.js      # Character data and utilities
├── navigation.js      # UI navigation and modals
├── server.js          # Express server
├── package.json       # Dependencies
├── scores.db          # SQLite database
├── fonts/             # Custom fonts
├── sounds/            # Audio files
└── app/               # Cordova mobile app
```

### Game Mechanics Specification

#### Character System

``` javascript
// Character data structure
{
  character: "我",
  jyutping: "ngo5",
  tone: 5,
  difficulty: 1
}
```

#### Scoring Algorithm

-   **Correct Answer:** +10 points base
-   **Red Power-up:** +20 points (doubled)
-   **Incorrect Answer:** -5 points
-   **Character Missed:** -10 points
-   **Level Bonus:** +5 points per level

#### Power-up Mechanics

``` javascript
// Power-up types and effects
const POWERUPS = {
  red: { duration: 10000, effect: 'doublePoints' },
  blue: { duration: 5000, effect: 'freeze' },
  green: { duration: 8000, effect: 'slowDown' },
  yellow: { duration: 3000, effect: 'hint' }
};
```

### API Specification

#### Score Endpoints

``` javascript
// GET /api/scores
// Returns top 10 scores
Response: {
  scores: [
    { name: "Player", score: 1500, date: "2024-01-01" }
  ]
}

// POST /api/scores
// Submit new score
Request: {
  name: "Player",
  score: 1500
}
Response: { success: true }

// DELETE /api/scores
// Clear all scores
Response: { success: true }
```

#### Server Configuration

``` javascript
// Express server setup
const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
```

### UI/UX Requirements

#### Responsive Design

-   **Desktop:** 800x600 minimum canvas size
-   **Mobile:** Responsive scaling with touch input
-   **Tablet:** Optimized layout for medium screens

#### Color Scheme

-   **Primary:** #4CAF50 (Green)
-   **Secondary:** #2196F3 (Blue)
-   **Accent:** #FF9800 (Orange)
-   **Background:** #1a1a1a (Dark)
-   **Text:** #ffffff (White)

#### Typography

-   **Font Family:** GenSenRounded (Custom Cantonese font)
-   **Fallback:** Arial, sans-serif
-   **Sizes:** 16px base, 24px headings, 14px UI elements

### Game States

#### 1. Menu State

-   Start button
-   Scoreboard button
-   Contact button
-   Audio controls

#### 2. Game State

-   Canvas rendering
-   Input handling
-   Score tracking
-   Power-up management

#### 3. Pause State

-   Game pause overlay
-   Resume/quit options

#### 4. Game Over State

-   Final score display
-   Restart option
-   Return to menu

### Mobile App Requirements (Cordova)

#### Project Structure

```         
app/
├── www/               # Web assets
│   ├── index.html    # Mobile-optimized HTML
│   ├── css/          # Mobile styles
│   ├── js/           # Game scripts
│   └── assets/       # Images, sounds, fonts
├── config.xml        # Cordova configuration
├── package.json      # Dependencies
└── platforms/        # Platform-specific code
```

#### Mobile Optimizations

-   Touch input handling
-   Responsive canvas scaling
-   Mobile-friendly UI elements
-   Performance optimizations
-   Offline capability

### Testing Requirements

#### Unit Testing

-   Game logic functions
-   Scoring algorithms
-   Power-up mechanics
-   Character validation

#### Integration Testing

-   API endpoints
-   Database operations
-   Audio system
-   UI interactions

#### User Testing

-   Gameplay flow
-   Mobile responsiveness
-   Audio quality
-   Performance metrics

### Performance Requirements

#### Loading Times

-   **Initial Load:** \< 3 seconds
-   **Game Start:** \< 1 second
-   **Audio Loading:** \< 2 seconds

#### Frame Rate

-   **Target:** 60 FPS
-   **Minimum:** 30 FPS
-   **Smooth Animation:** 50+ FPS

#### Memory Usage

-   **Desktop:** \< 100MB
-   **Mobile:** \< 50MB
-   **Audio Cache:** \< 10MB

### Security Considerations

#### Input Validation

-   Sanitize player names
-   Validate score submissions
-   Prevent XSS attacks

#### Data Protection

-   Local score storage
-   No sensitive data collection
-   Secure API endpoints

### Deployment Requirements

#### Web Deployment

-   **Hosting:** Static file hosting (Netlify, Vercel, GitHub Pages)
-   **Backend:** Node.js hosting (Heroku, Railway, DigitalOcean)
-   **Database:** SQLite or PostgreSQL
-   **CDN:** Asset delivery optimization

#### Mobile Deployment

-   **Android:** Google Play Store
-   **iOS:** Apple App Store (if applicable)
-   **Build Process:** Cordova CLI
-   **Signing:** Digital certificates

### Development Checklist

#### Core Features

-   [ ] Character falling animation
-   [ ] Typing input system
-   [ ] Scoring algorithm
-   [ ] Lives system
-   [ ] Game over detection
-   [ ] Power-up system
-   [ ] Audio integration
-   [ ] Score persistence

#### UI Components

-   [ ] Main menu
-   [ ] Game canvas
-   [ ] Score display
-   [ ] Lives indicator
-   [ ] Power-up indicators
-   [ ] Game over screen
-   [ ] Scoreboard
-   [ ] Contact modal

#### Backend Services

-   [ ] Express server setup
-   [ ] Database initialization
-   [ ] Score API endpoints
-   [ ] Error handling
-   [ ] CORS configuration

#### Mobile Features

-   [ ] Cordova project setup
-   [ ] Mobile-optimized UI
-   [ ] Touch input handling
-   [ ] Responsive design
-   [ ] Performance optimization

#### Testing & Quality

-   [ ] Unit tests
-   [ ] Integration tests
-   [ ] User acceptance testing
-   [ ] Performance testing
-   [ ] Cross-browser testing
-   [ ] Mobile device testing

### Code Examples

#### Game Initialization

``` javascript
class JyutpingGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.powerups = [];
    this.balls = [];
    this.gameState = 'menu';
  }

  start() {
    this.gameState = 'playing';
    this.gameLoop();
  }
}
```

#### Character Generation

``` javascript
function generateCharacter() {
  const randomIndex = Math.floor(Math.random() * characters.length);
  const char = characters[randomIndex];
  return new Ball(char.character, char.jyutping, char.tone);
}
```

#### Power-up System

``` javascript
function activatePowerup(type) {
  const powerup = POWERUPS[type];
  if (powerup) {
    gameState.powerups.push({
      type: type,
      startTime: Date.now(),
      duration: powerup.duration
    });
  }
}
```

### Conclusion

This PRD provides comprehensive specifications for developing the Jyutping Typing Game. The document covers all technical requirements, gameplay mechanics, UI/UX specifications, and deployment considerations needed to recreate the application from scratch.

**Contact:** [rutherz34\@gmail.com](mailto:rutherz34@gmail.com){.email}\
**Repository:** [Project URL]\
**Version:** 1.0\
**Last Updated:** [Current Date]
