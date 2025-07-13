const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { 
    initializeTables,
    getScores,
    addScore,
    getComments,
    addComment,
    getScoreStats,
    clearScores,
    clearComments
} = require('./supabase-config');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

app.get('/api/scores', async (req, res) => {
    try {
        const scores = await getScores();
        res.json(scores);
    } catch (error) {
        console.error('Error fetching scores:', error);
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

app.post('/api/scores', async (req, res) => {
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
    
    const scoreData = {
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
    
    try {
        const result = await addScore(scoreData);
        if (result.success) {
            console.log('Successfully added score with ID:', result.data.id);
            res.json({ 
                success: true, 
                id: result.data.id,
                message: 'Score with statistics added successfully' 
            });
        } else {
            console.error('Failed to add score:', result.error);
            res.status(500).json({ error: 'Failed to save score' });
        }
    } catch (error) {
        console.error('Error adding score:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const stats = await getScoreStats();
        res.json({
            totalScores: { count: stats.totalScores },
            topScore: { maxScore: stats.topScore },
            averageScore: { avgScore: Math.round(stats.averageScore * 100) / 100 }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

app.delete('/api/scores', async (req, res) => {
    const { adminKey } = req.body;
    
    if (adminKey !== 'admin123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const result = await clearScores();
        if (result.success) {
            res.json({ success: true, message: 'All scores cleared' });
        } else {
            res.status(500).json({ error: 'Failed to clear scores' });
        }
    } catch (error) {
        console.error('Error clearing scores:', error);
        res.status(500).json({ error: 'Failed to clear scores' });
    }
});

app.get('/api/comments', async (req, res) => {
    try {
        const comments = await getComments();
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

app.post('/api/comments', async (req, res) => {
    console.log('Received POST request to /api/comments');
    console.log('Request body:', req.body);
    
    const { text, timestamp } = req.body;
    
    if (!text || !text.trim()) {
        console.log('Invalid comment data:', { text });
        return res.status(400).json({ error: 'Invalid comment data' });
    }
    
    const commentData = {
        text: text.trim(),
        timestamp: timestamp || new Date().toISOString(),
        created_at: new Date().toISOString()
    };
    
    try {
        const result = await addComment(commentData);
        if (result.success) {
            console.log('Successfully added comment with ID:', result.data.id);
            res.json({ 
                success: true, 
                id: result.data.id,
                message: 'Comment added successfully' 
            });
        } else {
            console.error('Failed to add comment:', result.error);
            res.status(500).json({ error: 'Failed to save comment' });
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to save comment' });
    }
});

app.delete('/api/comments', async (req, res) => {
    const { adminKey } = req.body;
    
    if (adminKey !== 'admin123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const result = await clearComments();
        if (result.success) {
            res.json({ success: true, message: 'All comments cleared' });
        } else {
            res.status(500).json({ error: 'Failed to clear comments' });
        }
    } catch (error) {
        console.error('Error clearing comments:', error);
        res.status(500).json({ error: 'Failed to clear comments' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/`);
    
    try {
        await initializeTables();
        console.log('Supabase connection initialized successfully');
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
});

process.on('SIGINT', () => {
    console.log('Server shutting down gracefully...');
    process.exit(0);
}); 