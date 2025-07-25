// ========================================
// NAVIGATION BAR PAGES
// ========================================

const MODAL_DATA = {
    jyutping: {
        title: '學習粵拼',
        content: `
            <div class="modal-body">
                <h3>粵拼基本概念：</h3>
                <p>粵拼係香港語言學學會制定嘅粵語拼音方案，用於標註粵語發音。</p>
                
                <h3>聲母 (Initials)：</h3>
                <div class="jyutping-grid">
                    <div><strong>b</strong> - 爸</div>
                    <div><strong>p</strong> - 怕</div>
                    <div><strong>m</strong> - 媽</div>
                    <div><strong>f</strong> - 花</div>
                    <div><strong>d</strong> - 打</div>
                    <div><strong>t</strong> - 他</div>
                    <div><strong>n</strong> - 那</div>
                    <div><strong>l</strong> - 啦</div>
                    <div><strong>g</strong> - 家</div>
                    <div><strong>k</strong> - 卡</div>
                    <div><strong>ng</strong> - 牙</div>
                    <div><strong>h</strong> - 蝦</div>
                    <div><strong>gw</strong> - 瓜</div>
                    <div><strong>kw</strong> - 誇</div>
                    <div><strong>w</strong> - 蛙</div>
                    <div><strong>j</strong> - 也</div>
                    <div><strong>z</strong> - 渣</div>
                    <div><strong>c</strong> - 叉</div>
                    <div><strong>s</strong> - 沙</div>
                </div>
                
                <h3>韻母 (Finals)：</h3>
                <div class="jyutping-grid">
                    <div><strong>aa</strong> - 家</div>
                    <div><strong>aai</strong> - 街</div>
                    <div><strong>aau</strong> - 交</div>
                    <div><strong>aam</strong> - 監</div>
                    <div><strong>aan</strong> - 間</div>
                    <div><strong>aang</strong> - 耕</div>
                    <div><strong>aap</strong> - 甲</div>
                    <div><strong>aat</strong> - 八</div>
                    <div><strong>aak</strong> - 百</div>
                    <div><strong>ai</strong> - 雞</div>
                    <div><strong>au</strong> - 狗</div>
                    <div><strong>am</strong> - 金</div>
                    <div><strong>an</strong> - 根</div>
                    <div><strong>ang</strong> - 更</div>
                    <div><strong>ap</strong> - 急</div>
                    <div><strong>at</strong> - 吉</div>
                    <div><strong>ak</strong> - 北</div>
                </div>
                
                <h3>聲調 (Tones)：</h3>
                <div class="tone-grid">
                    <div><strong>1</strong> - 陰平 (高平調)</div>
                    <div><strong>2</strong> - 陰上 (高升調)</div>
                    <div><strong>3</strong> - 陰去 (高降調)</div>
                    <div><strong>4</strong> - 陽平 (低平調)</div>
                    <div><strong>5</strong> - 陽上 (低升調)</div>
                    <div><strong>6</strong> - 陽去 (低降調)</div>
                </div>
                
                <h3>例子：</h3>
                <div class="examples">
                    <p><strong>你好</strong> = nei5 hou2</p>
                    <p><strong>多謝</strong> = do1 ze6</p>
                    <p><strong>唔該</strong> = m4 goi1</p>
                    <p><strong>再見</strong> = zoi3 gin3</p>
                </div>
            </div>
        `
    },

    scoreboard: {
        title: '排行榜',
        content: `
            <div class="modal-body">
                <div id="scoreboardContent">
                    <div class="scoreboard-header">
                        <h3>最高分排行榜</h3>
                    </div>
                    <div id="scoreboardList">
                        <p class="no-scores">還沒有分數記錄</p>
                    </div>
                </div>
            </div>
        `
    },

    contact: {
        title: '聯絡我哋',
        content: `
            <div class="modal-body">
                <div id="contactContent">
                    <h3>意見回饋</h3>
                    <p>我哋非常重視您嘅意見！如有任何建議、問題定回饋，請直接發送電子郵件至：</p>
                    <p class="email-link">rutherz34@gmail.com</p>
                    <p class="contact-note">我哋會盡快回覆您嘅郵件。</p>
                </div>
            </div>
        `
    }
};

// ========================================
// SCOREBOARD SYSTEM
// ========================================

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Generates a random 10-character alphanumeric player name
 * @returns {string} Random player name
 */
function generateRandomPlayerName() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Loads scores from API with fallback to localStorage
 * @returns {Promise<Array>} Array of score objects
 */
async function loadScores() {
    try {
        // Try to load from Supabase directly first
        if (typeof loadScoresFromSupabase === 'function') {
            const scores = await loadScoresFromSupabase();
            console.log('Loaded scores from Supabase directly:', scores.length);
            return scores;
        } else {
            // Fallback to server API
            const response = await fetch('/api/scores');
            if (response.ok) {
                const scores = await response.json();
                console.log('Loaded scores from server API:', scores.length);
                return scores;
            } else {
                throw new Error('Failed to load scores from server');
            }
        }
    } catch (error) {
        console.warn('Server unavailable, falling back to localStorage:', error);
        
        // Fallback to localStorage
        const storedScores = localStorage.getItem('jyutpingScores');
        if (storedScores) {
            const scores = JSON.parse(storedScores);
            console.log('Loaded scores from localStorage:', scores.length);
            return scores;
        }
        
        return [];
    }
}

/**
 * Saves scores to localStorage (fallback method)
 * @param {Array} scores - Array of score objects
 */
function saveScores(scores) {
    localStorage.setItem('jyutpingScores', JSON.stringify(scores));
}

/**
 * Adds a new score to the scoreboard via API with fallback
 * @param {string} playerName - Player's name
 * @param {number} score - Player's score
 */
async function addScore(playerName, score) {
    const scoreData = {
        name: playerName || '匿名玩家',
        score: score
    };

    try {
        const response = await fetch(`${API_BASE_URL}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scoreData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Score saved to server:', result);
        } else {
            throw new Error('Failed to save score to server');
        }
    } catch (error) {
        console.warn('Server unavailable, saving to localStorage:', error);
        // Fallback to localStorage
        const scores = loadScoresFromLocalStorage();
        const newScore = {
            name: playerName || '匿名玩家',
            score: score,
            date: new Date().toLocaleDateString('zh-Hant'),
            time: new Date().toLocaleTimeString('zh-Hant')
        };
        
        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 100 scores
        if (scores.length > 100) {
            scores.splice(100);
        }
        
        saveScores(scores);
    }
}

/**
 * Loads scores from localStorage (fallback method)
 * @returns {Array} Array of score objects
 */
function loadScoresFromLocalStorage() {
    const scores = localStorage.getItem('jyutpingScores');
    return scores ? JSON.parse(scores) : [];
}

/**
 * Filters scores to show only the highest score for each player
 * @param {Array} scores - Array of all score objects
 * @returns {Array} Array of unique player scores (highest score per player)
 */
function filterHighestScoresPerPlayer(scores) {
    const playerScores = new Map();
    
    // Group scores by player name and keep the highest score
    scores.forEach(score => {
        const playerName = score.name || '匿名玩家';
        const currentScore = parseInt(score.score) || 0;
        
        if (!playerScores.has(playerName) || currentScore > playerScores.get(playerName).score) {
            playerScores.set(playerName, {
                name: playerName,
                score: currentScore,
                date: score.date,
                time: score.time
            });
        }
    });
    
    // Convert back to array and sort by score (highest first)
    const uniqueScores = Array.from(playerScores.values());
    uniqueScores.sort((a, b) => b.score - a.score);
    
    return uniqueScores;
}

/**
 * Displays the scoreboard
 */
async function displayScoreboard() {
    const scoreboardList = document.getElementById('scoreboardList');
    
    // Check if element exists
    if (!scoreboardList) {
        console.warn('Scoreboard list element not found');
        return;
    }
    
    // Show loading state
    scoreboardList.innerHTML = '<p class="loading">載入中...</p>';
    
    try {
        const allScores = await loadScores();
        
        if (allScores.length === 0) {
            scoreboardList.innerHTML = '<p class="no-scores">還沒有分數記錄</p>';
            return;
        }
        
        // Filter to show only highest score per player
        const uniqueScores = filterHighestScoresPerPlayer(allScores);
        
        let html = '<div class="scoreboard-table">';
        html += '<div class="scoreboard-row header">';
        html += '<div class="rank">排名</div>';
        html += '<div class="name">玩家</div>';
        html += '<div class="score">分數</div>';
        html += '</div>';
        
        uniqueScores.forEach((score, index) => {
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            html += `<div class="scoreboard-row ${rankClass}">`;
            html += `<div class="rank">${index + 1}</div>`;
            html += `<div class="name">${score.name}</div>`;
            html += `<div class="score">${score.score}</div>`;
            html += '</div>';
        });
        
        html += '</div>';
        
        // Add a summary at the bottom
        html += `<div class="scoreboard-summary">`;
        html += `<p>共顯示 ${uniqueScores.length} 個玩家嘅最高分記錄</p>`;
        html += `</div>`;
        
        scoreboardList.innerHTML = html;
    } catch (error) {
        console.error('Error loading scoreboard:', error);
        scoreboardList.innerHTML = '<p class="error">載入失敗，請稍後再試</p>';
    }
}

/**
 * Saves the current score and restarts the game
 */
async function saveScoreAndRestart() {
    // Capture current game state before restarting
    const currentScore = typeof score !== 'undefined' ? score : 0;
    const currentPlayerName = document.getElementById('playerName')?.value || '匿名玩家';
    
    // Save the score directly if we have a valid score
    if (currentScore > 0) {
        try {
            // Try to save to Supabase first
            if (typeof saveScoreToSupabase === 'function') {
                const scoreData = {
                    name: currentPlayerName,
                    score: currentScore,
                    date: new Date().toLocaleDateString('zh-Hant'),
                    time: new Date().toLocaleTimeString('zh-Hant'),
                    start_time: gameStats?.startTime || new Date().toISOString(),
                    end_time: new Date().toISOString(),
                    max_lives: gameStats?.maxLives || 3,
                    max_multiplier: gameStats?.maxMultiplier || 1,
                    red_balls_collected: gameStats?.redBallsCollected || 0,
                    blue_balls_collected: gameStats?.blueBallsCollected || 0,
                    yellow_balls_collected: gameStats?.yellowBallsCollected || 0,
                    green_balls_collected: gameStats?.greenBallsCollected || 0,
                    balls_burst: gameStats?.ballsBurst || 0,
                    balls_clicked: gameStats?.ballsClicked || 0,
                    tone1_correct: gameStats?.tone1Correct || 0,
                    tone2_correct: gameStats?.tone2Correct || 0,
                    tone3_correct: gameStats?.tone3Correct || 0,
                    tone4_correct: gameStats?.tone4Correct || 0,
                    tone5_correct: gameStats?.tone5Correct || 0,
                    tone6_correct: gameStats?.tone6Correct || 0,
                    repeated_correct: gameStats?.repeatedCorrect || 0
                };
                
                const result = await saveScoreToSupabase(scoreData);
                if (result.success) {
                    console.log('✅ Score saved to Supabase successfully:', result);
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
                    body: JSON.stringify({
                        name: currentPlayerName,
                        score: currentScore,
                        date: new Date().toLocaleDateString('zh-Hant'),
                        time: new Date().toLocaleTimeString('zh-Hant'),
                        start_time: gameStats?.startTime || new Date().toISOString(),
                        end_time: new Date().toISOString(),
                        max_lives: gameStats?.maxLives || 3,
                        max_multiplier: gameStats?.maxMultiplier || 1,
                        red_balls_collected: gameStats?.redBallsCollected || 0,
                        blue_balls_collected: gameStats?.blueBallsCollected || 0,
                        yellow_balls_collected: gameStats?.yellowBallsCollected || 0,
                        green_balls_collected: gameStats?.greenBallsCollected || 0,
                        balls_burst: gameStats?.ballsBurst || 0,
                        balls_clicked: gameStats?.ballsClicked || 0,
                        tone1_correct: gameStats?.tone1Correct || 0,
                        tone2_correct: gameStats?.tone2Correct || 0,
                        tone3_correct: gameStats?.tone3Correct || 0,
                        tone4_correct: gameStats?.tone4Correct || 0,
                        tone5_correct: gameStats?.tone5Correct || 0,
                        tone6_correct: gameStats?.tone6Correct || 0,
                        repeated_correct: gameStats?.repeatedCorrect || 0
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Score saved to server successfully:', result);
                } else {
                    throw new Error('Failed to save score to server');
                }
            }
            
            // Also save to localStorage as backup
            const storedScores = localStorage.getItem('jyutpingScores');
            const scores = storedScores ? JSON.parse(storedScores) : [];
            
            const newScore = {
                name: currentPlayerName,
                score: currentScore,
                date: new Date().toLocaleDateString('zh-Hant'),
                time: new Date().toLocaleTimeString('zh-Hant'),
                start_time: gameStats?.startTime || new Date().toISOString(),
                end_time: new Date().toISOString(),
                max_lives: gameStats?.maxLives || 3,
                max_multiplier: gameStats?.maxMultiplier || 1,
                red_balls_collected: gameStats?.redBallsCollected || 0,
                blue_balls_collected: gameStats?.blueBallsCollected || 0,
                yellow_balls_collected: gameStats?.yellowBallsCollected || 0,
                green_balls_collected: gameStats?.greenBallsCollected || 0,
                balls_burst: gameStats?.ballsBurst || 0,
                balls_clicked: gameStats?.ballsClicked || 0,
                tone1_correct: gameStats?.tone1Correct || 0,
                tone2_correct: gameStats?.tone2Correct || 0,
                tone3_correct: gameStats?.tone3Correct || 0,
                tone4_correct: gameStats?.tone4Correct || 0,
                tone5_correct: gameStats?.tone5Correct || 0,
                tone6_correct: gameStats?.tone6Correct || 0,
                repeated_correct: gameStats?.repeatedCorrect || 0
            };
            
            scores.push(newScore);
            scores.sort((a, b) => b.score - a.score);
            
            // Keep only top 100 scores
            if (scores.length > 100) {
                scores.splice(100);
            }
            
            localStorage.setItem('jyutpingScores', JSON.stringify(scores));
            console.log('✅ Score also saved to localStorage as backup');
            
        } catch (error) {
            console.error('❌ Error saving score:', error);
        }
    }
    
    // Reset the name field to random player name for next game
    document.getElementById('playerName').value = generateRandomPlayerName();
    
    // Call the original restart function
    restartGame();
}

// ========================================
// MODAL FUNCTIONS
// ========================================

/**
 * Shows a modal with specified content
 * @param {string} modalType - Type of modal ('rules', 'jyutping', or 'scoreboard')
 */
function showModal(modalType) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    const data = MODAL_DATA[modalType];
    
    if (modal && content && data) {
        content.innerHTML = `<h2>${data.title}</h2>${data.content}`;
        modal.style.display = 'block';
        
        // If showing scoreboard, display the scores
        if (modalType === 'scoreboard') {
            // Use setTimeout to ensure DOM is ready
            setTimeout(displayScoreboard, 100);
        }
    }
}

/**
 * Closes the modal
 */
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

/**
 * Close modal when clicking outside of it
 */
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

/**
 * Close modal with Escape key
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

/**
 * Initialize the game with default player name
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set default player name to random alphanumeric name
    const playerNameInput = document.getElementById('playerName');
    if (playerNameInput) {
        playerNameInput.value = generateRandomPlayerName();
    }
    
});

/**
 * Save score when page is unloaded (user closes tab/window or navigates away)
 */
window.addEventListener('beforeunload', function(event) {
    // Only save if there's an active game with a score
    if (typeof gameState !== 'undefined' && gameState === 'gameOver' && typeof score !== 'undefined' && score > 0) {
        // Save the score before the page unloads
        if (typeof saveDetailedStats === 'function') {
            // Use synchronous localStorage as fallback since async operations won't complete
            try {
                const storedScores = localStorage.getItem('jyutpingScores');
                const scores = storedScores ? JSON.parse(storedScores) : [];
                
                const playerName = document.getElementById('playerName')?.value || '匿名玩家';
                const newScore = {
                    name: playerName,
                    score: score,
                    date: new Date().toLocaleDateString('zh-Hant'),
                    time: new Date().toLocaleTimeString('zh-Hant'),
                    start_time: gameStats?.startTime || new Date().toISOString(),
                    end_time: new Date().toISOString(),
                    max_lives: gameStats?.maxLives || 3,
                    max_multiplier: gameStats?.maxMultiplier || 1,
                    red_balls_collected: gameStats?.redBallsCollected || 0,
                    blue_balls_collected: gameStats?.blueBallsCollected || 0,
                    yellow_balls_collected: gameStats?.yellowBallsCollected || 0,
                    green_balls_collected: gameStats?.greenBallsCollected || 0,
                    balls_burst: gameStats?.ballsBurst || 0,
                    balls_clicked: gameStats?.ballsClicked || 0,
                    tone1_correct: gameStats?.tone1Correct || 0,
                    tone2_correct: gameStats?.tone2Correct || 0,
                    tone3_correct: gameStats?.tone3Correct || 0,
                    tone4_correct: gameStats?.tone4Correct || 0,
                    tone5_correct: gameStats?.tone5Correct || 0,
                    tone6_correct: gameStats?.tone6Correct || 0,
                    repeated_correct: gameStats?.repeatedCorrect || 0
                };
                
                scores.push(newScore);
                scores.sort((a, b) => b.score - a.score);
                
                // Keep only top 100 scores
                if (scores.length > 100) {
                    scores.splice(100);
                }
                
                localStorage.setItem('jyutpingScores', JSON.stringify(scores));
                console.log('✅ Score saved to localStorage on page unload');
            } catch (error) {
                console.error('❌ Error saving score on page unload:', error);
            }
        }
    }
});

/**
 * Clear all scores from both database and localStorage
 */
async function clearAllScores() {
    try {
        // Clear from database
        const response = await fetch(`${API_BASE_URL}/scores`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ adminKey: 'admin123' })
        });

        if (response.ok) {
            console.log('Scores cleared from database');
        } else {
            console.warn('Failed to clear scores from database');
        }
    } catch (error) {
        console.warn('Database unavailable, clearing localStorage only:', error);
    }

    // Clear from localStorage
    localStorage.removeItem('jyutpingScores');
    console.log('Scores cleared from localStorage');
    
    // Refresh scoreboard display
    if (document.getElementById('scoreboardList')) {
        displayScoreboard();
    }
}

