// Supabase Client for Frontend
// This allows the game to work on GitHub Pages without a backend server

// Supabase configuration - these should be public (anon key is safe to expose)
const SUPABASE_URL = 'https://ttcstmmbjyjsbryvkduz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Y3N0bW1ianlqc2JyeXZrZHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODQ1NTQsImV4cCI6MjA2Nzk2MDU1NH0.c8wcG4TGjTtL-7b5w0pw_4nYTOBHv42UkFqAnmW86tg';

// Load Supabase client from CDN
let supabase;

// Initialize Supabase client
async function initSupabase() {
    if (typeof window !== 'undefined') {
        console.log('🔄 Initializing Supabase client...');
        
        // Check if Supabase is already loaded
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized (already loaded)');
            return;
        }
        
        // Load Supabase from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = function() {
            try {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✅ Supabase client initialized successfully');
                console.log('🔗 Supabase URL:', SUPABASE_URL);
                console.log('🔑 Using anon key (safe to expose)');
            } catch (error) {
                console.error('❌ Error initializing Supabase client:', error);
            }
        };
        script.onerror = function() {
            console.error('❌ Failed to load Supabase from CDN');
        };
        document.head.appendChild(script);
    }
}

// Save score to Supabase
async function saveScoreToSupabase(scoreData) {
    try {
        console.log('🔄 Attempting to save score to Supabase...');
        console.log('📊 Score data:', scoreData);
        console.log('📋 Score data keys:', Object.keys(scoreData));
        
        if (!supabase) {
            console.error('❌ Supabase client not initialized');
            throw new Error('Supabase client not initialized');
        }

        console.log('✅ Supabase client is available');
        
        const { data, error } = await supabase
            .from('scores')
            .insert([scoreData])
            .select();

        if (error) {
            console.error('❌ Error saving score to Supabase:', error);
            console.error('❌ Error details:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Score saved to Supabase successfully:', data[0]);
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('❌ Error in saveScoreToSupabase:', error);
        return { success: false, error: error.message };
    }
}

// Load scores from Supabase
async function loadScoresFromSupabase() {
    try {
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase
            .from('scores')
            .select('*')
            .order('score', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error loading scores from Supabase:', error);
            return [];
        }

        console.log('✅ Scores loaded from Supabase:', data.length);
        return data || [];
    } catch (error) {
        console.error('Error in loadScoresFromSupabase:', error);
        return [];
    }
}

// Save comment to Supabase
async function saveCommentToSupabase(commentData) {
    try {
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase
            .from('comments')
            .insert([commentData])
            .select();

        if (error) {
            console.error('Error saving comment to Supabase:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Comment saved to Supabase:', data[0]);
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error in saveCommentToSupabase:', error);
        return { success: false, error: error.message };
    }
}

// Load comments from Supabase
async function loadCommentsFromSupabase() {
    try {
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error loading comments from Supabase:', error);
            return [];
        }

        console.log('✅ Comments loaded from Supabase:', data.length);
        return data || [];
    } catch (error) {
        console.error('Error in loadCommentsFromSupabase:', error);
        return [];
    }
}

// Initialize when the page loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initSupabase);
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.saveScoreToSupabase = saveScoreToSupabase;
    window.loadScoresFromSupabase = loadScoresFromSupabase;
    window.saveCommentToSupabase = saveCommentToSupabase;
    window.loadCommentsFromSupabase = loadCommentsFromSupabase;
} 