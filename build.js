const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

// Read the supabase-client.js template
let clientCode = fs.readFileSync('supabase-client.js', 'utf8');

// Replace placeholders with environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://ttcstmmbjyjsbryvkduz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Y3N0bW1ianlqc2JyeXZrZHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODQ1NTQsImV4cCI6MjA2Nzk2MDU1NH0.c8wcG4TGjTtL-7b5w0pw_4nYTOBHv42UkFqAnmW86tg';

clientCode = clientCode.replace(
    /const SUPABASE_URL = '.*';/,
    `const SUPABASE_URL = '${supabaseUrl}';`
);

clientCode = clientCode.replace(
    /const SUPABASE_ANON_KEY = '.*';/,
    `const SUPABASE_ANON_KEY = '${supabaseAnonKey}';`
);

// Write the built file
fs.writeFileSync('supabase-client-built.js', clientCode);
console.log('✅ Built supabase-client.js with environment variables');
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Anon key configured'); 