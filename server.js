const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// ========================================
// SERVER CONFIGURATION
// ========================================

const app = express();
const PORT = process.env.PORT || 3001;
const SCORES_FILE = './scores.json';
const COMMENTS_FILE = './comments.json';

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// ========================================
// JSON DATA FUNCTIONS
// ========================================

/**
 * Initialize JSON data file if it doesn't exist
 */
function initJsonData() {
    if (!fs.existsSync(SCORES_FILE)) {
        const initialData = {
            scores: [],
            metadata: {
                created_at: new Date().toISOString(),
                total_scores: 0,
                source: 'JSON storage'
            }
        };
        fs.writeFileSync(SCORES_FILE, JSON.stringify(initialData, null, 2));
        console.log('Created new JSON scores file');
    } else {
        console.log('JSON scores file already exists');
    }
}

/**
 * Initialize comments JSON file if it doesn't exist
 */
function initCommentsData() {
    if (!fs.existsSync(COMMENTS_FILE)) {
        const initialData = {
            comments: [],
            metadata: {
                created_at: new Date().toISOString(),
                total_comments: 0,
                source: 'JSON storage'
            }
        };
        fs.writeFileSync(COMMENTS_FILE, JSON.stringify(initialData, null, 2));
        console.log('Created new JSON comments file');
    } else {
        console.log('JSON comments file already exists');
    }
}

/**
 * Read scores from JSON file
 */
function readScores() {
    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading scores file:', error.message);
        return { scores: [], metadata: { total_scores: 0 } };
    }
}

/**
 * Read comments from JSON file
 */
function readComments() {
    try {
        const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading comments file:', error.message);
        return { comments: [], metadata: { total_comments: 0 } };
    }
}

/**
 * Write scores to JSON file
 */
function writeScores(data) {
    try {
        fs.writeFileSync(SCORES_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing scores file:', error.message);
        return false;
    }
}

/**
 * Write comments to JSON file
 */
function writeComments(data) {
    try {
        fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing comments file:', error.message);
        return false;
    }
}

/**
 * Generate unique ID for new scores
 */
function generateId() {
    const data = readScores();
    const maxId = data.scores.reduce((max, score) => Math.max(max, score.id || 0), 0);
    return maxId + 1;
}

/**
 * Generate unique ID for new comments
 */
function generateCommentId() {
    const data = readComments();
    const maxId = data.comments.reduce((max, comment) => Math.max(max, comment.id || 0), 0);
    return maxId + 1;
}

// ========================================
// API ROUTES
// ========================================

/**
 * Get all scores with detailed statistics (top 100)
 */
app.get('/api/scores', (req, res) => {
    const data = readScores();
    const sortedScores = data.scores
        .sort((a, b) => b.score - a.score || new Date(a.created_at) - new Date(b.created_at))
        .slice(0, 100);
    
    res.json(sortedScores);
});

/**
 * Add new score with detailed statistics
 */
app.post('/api/scores', (req, res) => {
    console.log('Received POST request to /api/scores');
    console.log('Request body:', req.body);
    
    const { 
        name, 
        score,
        startTime,
        endTime,
        maxLives,
        maxMultiplier,
        redBallsCollected,
        blueBallsCollected,
        yellowBallsCollected,
        greenBallsCollected,
        ballsBurst,
        ballsClicked,
        tone1Correct,
        tone2Correct,
        tone3Correct,
        tone4Correct,
        tone5Correct,
        tone6Correct,
        repeatedCorrect
    } = req.body;
    
    if (!name || !score || isNaN(score)) {
        console.log('Invalid score data:', { name, score });
        return res.status(400).json({ error: 'Invalid score data' });
    }
    
    const data = readScores();
    const newScore = {
        id: generateId(),
        name,
        score: parseInt(score),
        date: new Date().toLocaleDateString('zh-Hant'),
        time: new Date().toLocaleTimeString('zh-Hant'),
        start_time: startTime || null,
        end_time: endTime || null,
        max_lives: maxLives || 3,
        max_multiplier: maxMultiplier || 1,
        red_balls_collected: redBallsCollected || 0,
        blue_balls_collected: blueBallsCollected || 0,
        yellow_balls_collected: yellowBallsCollected || 0,
        green_balls_collected: greenBallsCollected || 0,
        balls_burst: ballsBurst || 0,
        tone1_correct: tone1Correct || 0,
        tone2_correct: tone2Correct || 0,
        tone3_correct: tone3Correct || 0,
        tone4_correct: tone4Correct || 0,
        tone5_correct: tone5Correct || 0,
        tone6_correct: tone6Correct || 0,
        repeated_correct: repeatedCorrect || 0,
        balls_clicked: ballsClicked || 0,
        created_at: new Date().toISOString()
    };
    
    data.scores.push(newScore);
    data.metadata.total_scores = data.scores.length;
    data.metadata.last_updated = new Date().toISOString();
    
    if (writeScores(data)) {
        console.log('Successfully added score with ID:', newScore.id);
        res.json({ 
            success: true, 
            id: newScore.id,
            message: 'Score with statistics added successfully' 
        });
    } else {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

/**
 * Get score statistics
 */
app.get('/api/stats', (req, res) => {
    const data = readScores();
    const scores = data.scores;
    
    const stats = {
        totalScores: { count: scores.length },
        topScore: { maxScore: scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0 },
        averageScore: { avgScore: scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0 }
    };
    
    res.json(stats);
});

/**
 * Clear all scores (admin function)
 */
app.delete('/api/scores', (req, res) => {
    const { adminKey } = req.body;
    
    // Simple admin key check (in production, use proper authentication)
    if (adminKey !== 'admin123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = {
        scores: [],
        metadata: {
            created_at: new Date().toISOString(),
            total_scores: 0,
            source: 'JSON storage - cleared'
        }
    };
    
    if (writeScores(data)) {
        res.json({ success: true, message: 'All scores cleared' });
    } else {
        res.status(500).json({ error: 'Failed to clear scores' });
    }
});

// ========================================
// COMMENT API ROUTES
// ========================================

/**
 * Get all comments (latest 50)
 */
app.get('/api/comments', (req, res) => {
    const data = readComments();
    const sortedComments = data.comments
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50);
    
    res.json(sortedComments);
});

/**
 * Add new comment
 */
app.post('/api/comments', (req, res) => {
    console.log('Received POST request to /api/comments');
    console.log('Request body:', req.body);
    
    const { text, timestamp } = req.body;
    
    if (!text || !text.trim()) {
        console.log('Invalid comment data:', { text });
        return res.status(400).json({ error: 'Invalid comment data' });
    }
    
    const data = readComments();
    const newComment = {
        id: generateCommentId(),
        text: text.trim(),
        timestamp: timestamp || new Date().toISOString(),
        created_at: new Date().toISOString()
    };
    
    data.comments.push(newComment);
    data.metadata.total_comments = data.comments.length;
    data.metadata.last_updated = new Date().toISOString();
    
    if (writeComments(data)) {
        console.log('Successfully added comment with ID:', newComment.id);
        res.json({ 
            success: true, 
            id: newComment.id,
            message: 'Comment added successfully' 
        });
    } else {
        res.status(500).json({ error: 'Failed to save comment' });
    }
});

/**
 * Clear all comments (admin function)
 */
app.delete('/api/comments', (req, res) => {
    const { adminKey } = req.body;
    
    // Simple admin key check (in production, use proper authentication)
    if (adminKey !== 'admin123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = {
        comments: [],
        metadata: {
            created_at: new Date().toISOString(),
            total_comments: 0,
            source: 'JSON storage - cleared'
        }
    };
    
    if (writeComments(data)) {
        res.json({ success: true, message: 'All comments cleared' });
    } else {
        res.status(500).json({ error: 'Failed to clear comments' });
    }
});

// ========================================
// STATIC ROUTES
// ========================================

/**
 * Serve the main HTML file
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========================================
// ERROR HANDLING
// ========================================

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ========================================
// SERVER STARTUP
// ========================================

/**
 * Start server
 */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/`);
    initJsonData();
    initCommentsData(); // Initialize comments file on startup
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

/**
 * Graceful shutdown
 */
process.on('SIGINT', () => {
    console.log('Server shutting down gracefully...');
    process.exit(0);
}); 