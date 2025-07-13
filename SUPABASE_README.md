# Supabase Setup

## Quick Setup

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from Settings > API
3. Create a `.env` file with your credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Create these tables in your Supabase SQL Editor:

```sql
CREATE TABLE scores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    date VARCHAR(50),
    time VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    max_lives INTEGER DEFAULT 3,
    max_multiplier INTEGER DEFAULT 1,
    red_balls_collected INTEGER DEFAULT 0,
    blue_balls_collected INTEGER DEFAULT 0,
    yellow_balls_collected INTEGER DEFAULT 0,
    green_balls_collected INTEGER DEFAULT 0,
    balls_burst INTEGER DEFAULT 0,
    tone1_correct INTEGER DEFAULT 0,
    tone2_correct INTEGER DEFAULT 0,
    tone3_correct INTEGER DEFAULT 0,
    tone4_correct INTEGER DEFAULT 0,
    tone5_correct INTEGER DEFAULT 0,
    tone6_correct INTEGER DEFAULT 0,
    repeated_correct INTEGER DEFAULT 0,
    balls_clicked INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. Install dependencies: `npm install`
6. Start the server: `npm start`

## API Endpoints

- `GET /api/scores` - Get all scores
- `POST /api/scores` - Add new score
- `GET /api/stats` - Get score statistics
- `GET /api/comments` - Get all comments
- `POST /api/comments` - Add new comment 