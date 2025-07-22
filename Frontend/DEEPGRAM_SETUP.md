# Deepgram Setup Guide for VocMate AI Tutor

This guide will help you set up Deepgram for real-time speech recognition in the Advanced Features section.

## What is Deepgram?

Deepgram provides high-accuracy, real-time speech recognition that works better than browser-based speech recognition. It offers:
- Better accuracy in noisy environments
- Real-time transcription with low latency
- Support for multiple languages
- Professional-grade speech recognition

## Step 1: Get a Deepgram API Key

1. Go to [Deepgram Console](https://console.deepgram.com/)
2. Sign up for a free account
3. Create a new project
4. Copy your API key from the project settings

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and add your Deepgram API key:
   ```env
   VITE_DEEPGRAM_API_KEY=your_actual_deepgram_api_key_here
   ```

## Step 3: Test the Integration

1. Start your frontend development server:
   ```bash
   npm run dev
   ```

2. Go to the Advanced Features section
3. Click on the "AI Tutor" tab
4. Enable "Voice Mode (Deepgram + ElevenLabs)"
5. Click "Start Voice Recording"
6. Speak into your microphone

## How It Works

### Voice Mode Features:
- **Real-time Transcription**: Your speech is transcribed in real-time as you speak
- **Automatic Processing**: After 3 seconds of silence, your message is automatically sent to the AI
- **Voice Response**: The AI responds with synthesized speech using ElevenLabs
- **Live Transcript Display**: See what you're saying as you speak

### Fallback System:
If Deepgram is not configured, the system automatically falls back to browser-based speech recognition.

## Troubleshooting

### Microphone Access Issues:
- Make sure your browser has permission to access the microphone
- Check that your microphone is working in other applications
- Try refreshing the page and granting permissions again

### API Key Issues:
- Verify your Deepgram API key is correct
- Check that your Deepgram account has available credits
- Ensure the API key is properly set in the `.env` file

### Connection Issues:
- Check your internet connection
- Verify that the backend server is running
- Look for any error messages in the browser console

## Advanced Configuration

### Customizing Speech Recognition:
You can modify the Deepgram parameters in `AdvancedFeatures.jsx`:

```javascript
const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?${new URLSearchParams({
  model: 'nova-3',           // Speech recognition model
  language: 'en-US',         // Language
  interim_results: 'true',   // Show interim results
  endpointing: '3000',       // Silence timeout (ms)
  vad_events: 'true',        // Voice activity detection
  punctuate: 'true',         // Add punctuation
})}`, ['token', deepgramApiKey]);
```

### Available Models:
- `nova-3`: Latest and most accurate (recommended)
- `nova-2`: Good balance of speed and accuracy
- `enhanced`: Enhanced accuracy for challenging audio

## Cost Information

Deepgram offers:
- **Free Tier**: 200 hours of audio processing per month
- **Pay-as-you-go**: $0.0043 per hour after free tier
- **Enterprise**: Custom pricing for high-volume usage

For most users, the free tier is sufficient for testing and personal use.

## Support

For issues related to:
- Deepgram API: Check [Deepgram Documentation](https://developers.deepgram.com/)
- Frontend integration: Check the browser console for error messages
- General setup: Follow this guide step by step

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and don't share them publicly
- Consider using environment variables in production deployments 