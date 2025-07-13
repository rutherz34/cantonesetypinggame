require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = {
    SCORES: 'scores',
    COMMENTS: 'comments'
};

async function initializeTables() {
    try {
        await supabase.from(TABLES.SCORES).select('id').limit(1);
        await supabase.from(TABLES.COMMENTS).select('id').limit(1);
        console.log('Supabase tables checked successfully');
    } catch (error) {
        console.error('Error checking Supabase tables:', error);
    }
}

async function getScores() {
    try {
        const { data, error } = await supabase
            .from(TABLES.SCORES)
            .select('*')
            .order('score', { ascending: false })
            .limit(100);
        
        if (error) {
            console.error('Error fetching scores:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in getScores:', error);
        return [];
    }
}

async function addScore(scoreData) {
    try {
        const { data, error } = await supabase
            .from(TABLES.SCORES)
            .insert([scoreData])
            .select();
        
        if (error) {
            console.error('Error adding score:', error);
            return { success: false, error: error.message };
        }
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error in addScore:', error);
        return { success: false, error: error.message };
    }
}

async function getComments() {
    try {
        const { data, error } = await supabase
            .from(TABLES.COMMENTS)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in getComments:', error);
        return [];
    }
}

async function addComment(commentData) {
    try {
        const { data, error } = await supabase
            .from(TABLES.COMMENTS)
            .insert([commentData])
            .select();
        
        if (error) {
            console.error('Error adding comment:', error);
            return { success: false, error: error.message };
        }
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error in addComment:', error);
        return { success: false, error: error.message };
    }
}

async function getScoreStats() {
    try {
        const { data, error } = await supabase
            .from(TABLES.SCORES)
            .select('score');
        
        if (error) {
            console.error('Error fetching score stats:', error);
            return { totalScores: 0, topScore: 0, averageScore: 0 };
        }
        
        const scores = data || [];
        const totalScores = scores.length;
        const topScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
        const averageScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;
        
        return { totalScores, topScore, averageScore };
    } catch (error) {
        console.error('Error in getScoreStats:', error);
        return { totalScores: 0, topScore: 0, averageScore: 0 };
    }
}

async function clearScores() {
    try {
        const { error } = await supabase
            .from(TABLES.SCORES)
            .delete()
            .neq('id', 0);
        
        if (error) {
            console.error('Error clearing scores:', error);
            return { success: false, error: error.message };
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error in clearScores:', error);
        return { success: false, error: error.message };
    }
}

async function clearComments() {
    try {
        const { error } = await supabase
            .from(TABLES.COMMENTS)
            .delete()
            .neq('id', 0);
        
        if (error) {
            console.error('Error clearing comments:', error);
            return { success: false, error: error.message };
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error in clearComments:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    supabase,
    TABLES,
    initializeTables,
    getScores,
    addScore,
    getComments,
    addComment,
    getScoreStats,
    clearScores,
    clearComments
}; 