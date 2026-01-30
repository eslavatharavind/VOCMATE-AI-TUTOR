# Supabase Setup Guide for VocMate AI Tutor

This guide will help you set up Supabase as the database for your VocMate AI Tutor application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Your Supabase project URL and API key

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `vocmate-ai-tutor` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following:
   - Project URL (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - Anon public key (starts with `eyJ...`)

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Click "New query"
3. Copy and paste the contents of `supabase_schema.sql` from this directory
4. Click "Run" to execute the SQL

This will create the following tables:
- `users` - User accounts (if not using Supabase Auth)
- `sessions` - Practice session records
- `progress` - User learning progress
- `challenges` - Daily and peer challenges
- `voice_preferences` - User voice settings

## Step 4: Configure Authentication (Optional)

If you want to use Supabase Auth instead of your own auth system:

1. Go to Authentication → Settings in your Supabase dashboard
2. Configure your preferred auth providers (Google, GitHub, etc.)
3. Update the frontend to use Supabase Auth

## Step 5: Update Environment Variables

Create a `.env` file in your Backend directory with:

```env
SUPABASE_URL=your_project_url_here
SUPABASE_KEY=your_anon_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

## Step 6: Install Dependencies

Run the following command in your Backend directory:

```bash
pip install -r requirements.txt
```

## Step 7: Test the Connection

Start your Flask application:

```bash
python app.py
```

You should see: "✅ Supabase connected successfully"

## Database Tables Overview

### sessions
Stores practice session data:
- `user_id`: Reference to user
- `session_type`: Type of practice (shadowing, conversation, reading, challenge)
- `topic`: Practice topic
- `duration`: Session duration in seconds
- `score`: User's score
- `feedback`: AI feedback
- `metadata`: Additional session data (JSON)

### progress
Tracks user learning progress:
- `user_id`: Reference to user
- `total_sessions`: Total number of sessions
- `total_duration`: Total practice time
- `average_score`: Average session score
- `learning_stats`: Detailed statistics (JSON)

### challenges
Stores daily and peer challenges:
- `user_id`: Reference to user
- `challenge_type`: Type of challenge
- `title`: Challenge title
- `difficulty`: Challenge difficulty level
- `status`: Challenge status
- `score`: User's score
- `metadata`: Additional challenge data

### voice_preferences
Stores user voice settings:
- `user_id`: Reference to user
- `voice_id`: ElevenLabs voice ID
- `voice_name`: Voice name
- `voice_settings`: Voice configuration (JSON)

## Security Features

The schema includes:
- Row Level Security (RLS) policies
- User isolation (users can only access their own data)
- Automatic timestamp updates
- Proper indexing for performance

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and API key
- Check if your project is active
- Ensure you're using the anon key, not the service role key

### Permission Errors
- Make sure RLS policies are properly set up
- Verify user authentication is working
- Check if the user_id matches the authenticated user

### Data Not Saving
- Check the console for error messages
- Verify table names match the code
- Ensure all required fields are provided

## Migration from MongoDB

If you're migrating from MongoDB:
1. Export your existing data
2. Transform the data to match the new schema
3. Import the data using Supabase's import tools
4. Update your application code to use the new Supabase functions

## Support

For Supabase-specific issues, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Supabase Discord](https://discord.supabase.com) 