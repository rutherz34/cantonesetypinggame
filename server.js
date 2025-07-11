const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

// ========================================
// SERVER CONFIGURATION
// ========================================

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// ========================================
// DATABASE SETUP
// ========================================

const db = new sqlite3.Database('./scores.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// ========================================
// DATABASE FUNCTIONS
// ========================================

/**
 * Initialize database table
 */
function initDatabase() {
    const createTable = `
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(createTable, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Scores table ready');
        }
    });
}

// ========================================
// API ROUTES
// ========================================

/**
 * Get all scores (top 100)
 */
app.get('/api/scores', (req, res) => {
    const query = `
        SELECT name, score, date, time 
        FROM scores 
        ORDER BY score DESC, created_at ASC 
        LIMIT 100
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching scores:', err.message);
            res.status(500).json({ error: 'Failed to fetch scores' });
        } else {
            res.json(rows);
        }
    });
});

/**
 * Add new score
 */
app.post('/api/scores', (req, res) => {
    const { name, score } = req.body;
    
    if (!name || !score || isNaN(score)) {
        return res.status(400).json({ error: 'Invalid score data' });
    }
    
    const date = new Date().toLocaleDateString('zh-Hant');
    const time = new Date().toLocaleTimeString('zh-Hant');
    
    const query = `
        INSERT INTO scores (name, score, date, time)
        VALUES (?, ?, ?, ?)
    `;
    
    db.run(query, [name, score, date, time], function(err) {
        if (err) {
            console.error('Error adding score:', err.message);
            res.status(500).json({ error: 'Failed to add score' });
        } else {
            res.json({ 
                success: true, 
                id: this.lastID,
                message: 'Score added successfully' 
            });
        }
    });
});

/**
 * Get score statistics
 */
app.get('/api/stats', (req, res) => {
    const queries = {
        totalScores: 'SELECT COUNT(*) as count FROM scores',
        topScore: 'SELECT MAX(score) as maxScore FROM scores',
        averageScore: 'SELECT AVG(score) as avgScore FROM scores'
    };
    
    const stats = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;
    
    Object.keys(queries).forEach(key => {
        db.get(queries[key], [], (err, row) => {
            if (err) {
                console.error(`Error fetching ${key}:`, err.message);
            } else {
                stats[key] = row;
            }
            completed++;
            
            if (completed === totalQueries) {
                res.json(stats);
            }
        });
    });
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
    
    db.run('DELETE FROM scores', (err) => {
        if (err) {
            console.error('Error clearing scores:', err.message);
            res.status(500).json({ error: 'Failed to clear scores' });
        } else {
            res.json({ success: true, message: 'All scores cleared' });
        }
    });
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
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

/**
 * Graceful shutdown
 */
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
}); 