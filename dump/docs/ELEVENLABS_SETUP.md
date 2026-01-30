# ElevenLabs Setup Guide for VocMate AI Tutor

This guide will help you set up ElevenLabs for high-quality AI voice generation.

## What is ElevenLabs?

ElevenLabs provides state-of-the-art text-to-speech technology that creates natural-sounding AI voices. It's used in the AI Tutor to make the AI responses sound more human-like.

## Step 1: Get ElevenLabs API Key

1. **Go to ElevenLabs**: Visit [https://elevenlabs.io/](https://elevenlabs.io/)
2. **Sign Up**: Create a free account
3. **Get API Key**: 
   - Go to your profile settings
   - Click on "API Key" section
   - Copy your API key (starts with `xi-api-`)

## Step 2: Configure the API Key

### Option A: Using Environment File (Recommended)

1. Create a `.env` file in the Backend directory:
   ```bash
   cd Backend
   copy env.example .env
   ```

2. Edit the `.env` file and add your ElevenLabs API key:
   ```env
   ELEVENLABS_API_KEY=xi-api-your-actual-api-key-here
   SUPABASE_URL=https://ejjfcobyzwmhttpsbkhpmprrv.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqamZjb2J5endtYmtocG1wcnJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzYzMjM5MSwiZXhwIjoyMDYzMjA4MzkxfQ.s95WYrM6yLp9xsNWhgWr0G25JHYV6eti9ox6o2PXCFc
   ```

### Option B: Direct Code Update (Temporary)

If you can't create the `.env` file, you can temporarily update the code:

1. Open `Backend/app.py`
2. Find this line (around line 40):
   ```python
   ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your-elevenlabs-api-key")
   ```
3. Replace it with:
   ```python
   ELEVENLABS_API_KEY = "xi-api-your-actual-api-key-here"
   ```

## Step 3: Test the Setup

1. **Restart the Backend Server**:
   ```bash
   cd Backend
   python app.py
   ```

2. **Test in Frontend**:
   - Go to Advanced Features → AI Tutor
   - Click the "🧪 Test TTS" button
   - You should hear: "Hello! This is a test of the text-to-speech system."

## Step 4: Available Voices

The app uses these ElevenLabs voices by default:

- **Rachel** (21m00Tcm4TlvDq8ikWAM) - Female, professional
- **Adam** (pNInz6obpgDQGcFmaJgB) - Male, friendly
- **Sam** (yoZ06aMxZJJ28mfd3POQ) - Male, clear
- **Dorothy** (ThT5KcBeYPX3keUQqHPh) - Female, warm

You can change the voice by updating the `VOICE_ID` in `Backend/app.py`:

```python
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Change this to any voice ID
```

## ElevenLabs Free Tier

- **10,000 characters per month** (about 10 minutes of speech)
- **Perfect for testing and personal use**
- **No credit card required**

## Troubleshooting

### "Could not generate audio" Error

1. **Check API Key**: Make sure it starts with `xi-api-`
2. **Check Backend**: Ensure server is running on port 10000
3. **Check Credits**: Verify you have remaining characters in ElevenLabs
4. **Check Network**: Ensure backend can reach ElevenLabs API

### Common Issues

1. **Invalid API Key**: Double-check the key format
2. **Out of Credits**: Check your ElevenLabs dashboard
3. **Network Error**: Check internet connection
4. **CORS Error**: Make sure backend is running properly

## Security Notes

- **Never commit your API key** to version control
- **Use environment variables** in production
- **Keep your API key secure** and don't share it publicly

## Support

- **ElevenLabs Documentation**: [https://docs.elevenlabs.io/](https://docs.elevenlabs.io/)
- **ElevenLabs Discord**: [https://discord.gg/elevenlabs](https://discord.gg/elevenlabs)
- **Check your usage**: [https://elevenlabs.io/account](https://elevenlabs.io/account) 