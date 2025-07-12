const fs = require('fs');
const path = require('path');

// ========================================
// JSON EXPORT SCRIPT
// ========================================

console.log('Starting JSON data export...');

// Configuration
const SCORES_FILE = './scores.json';
const EXPORT_DIR = './exports';
const EXPORT_FILE = `game_scores_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;

// ========================================
// EXPORT FUNCTIONS
// ========================================

/**
 * Read scores from JSON file
 */
function readScores() {
    try {
        if (!fs.existsSync(SCORES_FILE)) {
            console.error('❌ Scores file not found:', SCORES_FILE);
            return null;
        }
        
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error reading scores file:', error.message);
        return null;
    }
}

/**
 * Create export directory if it doesn't exist
 */
function ensureExportDir() {
    if (!fs.existsSync(EXPORT_DIR)) {
        fs.mkdirSync(EXPORT_DIR, { recursive: true });
        console.log('📁 Created exports directory');
    }
}

/**
 * Export data to JSON file
 */
function exportToJson() {
    const data = readScores();
    if (!data) {
        console.error('❌ Failed to read scores data');
        return false;
    }
    
    console.log(`📊 Found ${data.scores.length} scores to export`);
    
    // Create export directory
    ensureExportDir();
    
    // Prepare export data
    const exportData = {
        export_info: {
            exported_at: new Date().toISOString(),
            total_scores: data.scores.length,
            source: 'JSON export',
            version: '1.0'
        },
        metadata: data.metadata,
        scores: data.scores.map(score => ({
            ...score,
            // Ensure all fields are present
            id: score.id || 0,
            name: score.name || 'Unknown',
            score: score.score || 0,
            date: score.date || '',
            time: score.time || '',
            start_time: score.start_time || null,
            end_time: score.end_time || null,
            max_lives: score.max_lives || 3,
            max_multiplier: score.max_multiplier || 1,
            red_balls_collected: score.red_balls_collected || 0,
            blue_balls_collected: score.blue_balls_collected || 0,
            yellow_balls_collected: score.yellow_balls_collected || 0,
            green_balls_collected: score.green_balls_collected || 0,
            balls_burst: score.balls_burst || 0,
            tone1_correct: score.tone1_correct || 0,
            tone2_correct: score.tone2_correct || 0,
            tone3_correct: score.tone3_correct || 0,
            tone4_correct: score.tone4_correct || 0,
            tone5_correct: score.tone5_correct || 0,
            tone6_correct: score.tone6_correct || 0,
            repeated_correct: score.repeated_correct || 0,
            balls_clicked: score.balls_clicked || 0,
            created_at: score.created_at || new Date().toISOString()
        }))
    };
    
    // Write export file
    const exportPath = path.join(EXPORT_DIR, EXPORT_FILE);
    try {
        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
        console.log(`✅ Export completed successfully!`);
        console.log(`📁 File saved to: ${exportPath}`);
        console.log(`📊 Total scores exported: ${exportData.scores.length}`);
        
        // Show sample of exported data
        if (exportData.scores.length > 0) {
            console.log('\n�� Sample of exported data:');
            console.log(JSON.stringify(exportData.scores[0], null, 2));
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error writing export file:', error.message);
        return false;
    }
}

/**
 * Generate CSV export
 */
function exportToCsv() {
    const data = readScores();
    if (!data || data.scores.length === 0) {
        console.error('❌ No data to export to CSV');
        return false;
    }
    
    ensureExportDir();
    
    // CSV headers
    const headers = [
        'id', 'name', 'score', 'date', 'time', 'start_time', 'end_time',
        'max_lives', 'max_multiplier', 'red_balls_collected', 'blue_balls_collected',
        'yellow_balls_collected', 'green_balls_collected', 'balls_burst',
        'tone1_correct', 'tone2_correct', 'tone3_correct', 'tone4_correct',
        'tone5_correct', 'tone6_correct', 'repeated_correct', 'balls_clicked',
        'created_at'
    ];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.scores.forEach(score => {
        const row = headers.map(header => {
            const value = score[header] || '';
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvContent += row.join(',') + '\n';
    });
    
    // Write CSV file
    const csvFileName = `game_scores_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    const csvPath = path.join(EXPORT_DIR, csvFileName);
    
    try {
        fs.writeFileSync(csvPath, csvContent);
        console.log(`✅ CSV export completed!`);
        console.log(`📁 File saved to: ${csvPath}`);
        return true;
    } catch (error) {
        console.error('❌ Error writing CSV file:', error.message);
        return false;
    }
}

// ========================================
// MAIN EXECUTION
// ========================================

console.log('🚀 Starting data export...');

// Export to JSON
const jsonSuccess = exportToJson();

// Export to CSV
const csvSuccess = exportToCsv();

if (jsonSuccess && csvSuccess) {
    console.log('\n🎉 All exports completed successfully!');
    console.log(`📁 Check the '${EXPORT_DIR}' directory for your exported files.`);
} else {
    console.log('\n⚠️  Some exports failed. Check the errors above.');
}

console.log('\n📊 Export Summary:');
console.log(`- JSON export: ${jsonSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`- CSV export: ${csvSuccess ? '✅ Success' : '❌ Failed'}`); 