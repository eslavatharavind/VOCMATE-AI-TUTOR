# VocMate AI Tutor Backend

A Flask-based backend for the VocMate AI Tutor language learning application, featuring AI-powered conversation practice, speech synthesis, and progress tracking.

## Technologies Used:

- **AI Agent**: Groq API for natural language processing
- **Database**: Supabase (PostgreSQL) for data storage
- **Speech Synthesis**: ElevenLabs API for text-to-speech
- **Backend Framework**: Flask with CORS support
- **Authentication**: Supabase Auth (optional)

## Features:

- AI-powered conversation practice with different scenarios
- Text-to-speech and speech-to-text conversion
- Progress tracking and analytics
- Daily challenges and peer challenges
- Reading practice with multiple topics
- Shadowing exercises
- Voice preference management

## Setup Instructions:

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**:
   Copy `env.example` to `.env` and fill in your API keys:
   ```bash
   cp env.example .env
   ```

3. **Set Up Supabase Database**:
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Run the SQL schema from `supabase_schema.sql`

4. **Start the Server**:
   ```bash
   python app.py
   ```

## API Endpoints:

### AI Tutor Endpoints:
- `POST /api/ai-tutor/voice-chat` - Voice-based AI conversation
- `POST /api/ai-tutor/text-to-speech` - Convert text to speech
- `POST /api/ai-tutor/speech-to-text` - Convert speech to text

### Progress Tracking:
- `POST /api/progress/session` - Record a practice session
- `GET /api/progress/dashboard/<user_id>` - Get user progress data

### Practice Features:
- `GET /api/shadowing/sentence` - Get shadowing sentences
- `POST /api/shadowing/evaluate` - Evaluate shadowing performance
- `GET /api/conversation/scenarios` - Get conversation scenarios
- `POST /api/conversation/start` - Start a conversation session
- `POST /api/conversation/respond` - Get AI response in conversation

### Challenges:
- `GET /api/challenges/daily` - Get daily challenge
- `POST /api/challenges/submit` - Submit challenge response
- `POST /api/challenge/create` - Create peer challenge
- `POST /api/challenge/join/<challenge_id>` - Join peer challenge

### Reading Practice:
- `GET /api/reading/topics` - Get available reading topics
- `GET /api/reading/content/<topic>` - Get reading content
- `POST /api/reading/analyze` - Analyze reading performance
- `POST /api/reading/paragraph-audio` - Get paragraph audio

### Recommendations:
- `GET /api/recommendations/<user_id>` - Get personalized recommendations

### General:
- `POST /api/english-tutor` - General English tutoring
- `POST /feedback` - Submit feedback

## Database Schema:

The application uses the following Supabase tables:
- `sessions` - Practice session records
- `progress` - User learning progress
- `challenges` - Daily and peer challenges
- `voice_preferences` - User voice settings
- `users` - User accounts (if not using Supabase Auth)

## Environment Variables:

Required environment variables (see `env.example`):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key
- `ELEVENLABS_API_KEY` - ElevenLabs API key for speech synthesis

## Security Features:

- Row Level Security (RLS) policies in Supabase
- User data isolation
- CORS configuration for frontend communication
- Environment variable protection for API keys

## Development:

The backend includes fallback in-memory storage when Supabase is not available, making it suitable for development and testing without a database connection.

## Support:

For issues related to:
- Supabase: Check `SUPABASE_SETUP.md`
- API endpoints: Check the endpoint documentation above
- General setup: Follow the setup instructions in this README