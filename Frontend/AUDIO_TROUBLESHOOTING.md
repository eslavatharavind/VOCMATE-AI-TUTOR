# Audio Troubleshooting Guide for AI Tutor

If you're having issues with AI voice not playing in the AI Tutor, follow these steps:

## Quick Test

1. **Test TTS Button**: Click the "🧪 Test TTS" button in the AI Tutor tab
   - This will test if the backend TTS service is working
   - You should hear "Hello! This is a test of the text-to-speech system."

## Common Issues & Solutions

### 1. Backend Server Not Running
**Symptoms**: Test TTS button shows "TTS test failed"
**Solution**: 
```bash
cd Backend
python app.py
```
You should see: "✅ Supabase connected successfully" and "Running on http://127.0.0.1:10000"

### 2. ElevenLabs API Key Missing
**Symptoms**: Audio generation fails
**Solution**: 
- Get a free API key from [ElevenLabs](https://elevenlabs.io/)
- Add to Backend/.env file:
```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 3. Browser Audio Permissions
**Symptoms**: Audio plays but no sound
**Solution**:
- Check browser audio settings
- Make sure your system volume is up
- Try refreshing the page
- Check if other websites can play audio

### 4. CORS Issues
**Symptoms**: Network errors in browser console
**Solution**: 
- Make sure backend is running on http://localhost:10000
- Check that CORS is properly configured in backend

### 5. Audio Format Issues
**Symptoms**: Audio loads but doesn't play
**Solution**:
- Check browser console for audio errors
- Try different browsers (Chrome works best)
- Check if audio format is supported

## Debug Steps

### 1. Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages when:
   - Clicking "Test TTS" button
   - Sending messages in voice mode
   - Clicking "Play" buttons

### 2. Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Send a message or click Test TTS
4. Look for requests to `/api/ai-tutor/text-to-speech`
5. Check if response contains `audio_url`

### 3. Test Backend Directly
```bash
curl -X POST http://localhost:10000/api/ai-tutor/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

## Expected Behavior

### When Working Correctly:
1. **Test TTS Button**: Plays test audio immediately
2. **Voice Mode**: AI responses play automatically
3. **Manual Play Buttons**: Play individual messages
4. **Console Logs**: Show "Audio started playing" messages

### Audio States:
- **🔊 Play**: Ready to play
- **🔊 Playing...**: Currently playing (button disabled)
- **🔊 Play**: Finished playing (button re-enabled)

## Environment Setup

Make sure these are configured:

### Backend (.env):
```env
ELEVENLABS_API_KEY=your_elevenlabs_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Frontend (.env):
```env
VITE_DEEPGRAM_API_KEY=your_deepgram_key
```

## Still Having Issues?

1. **Check all console logs** for specific error messages
2. **Verify backend is running** on port 10000
3. **Test with simple text** like "Hello"
4. **Try different browsers** (Chrome, Firefox, Edge)
5. **Check system audio** and browser permissions

## Support

If issues persist:
1. Check the browser console for specific error messages
2. Verify all API keys are valid
3. Ensure backend server is running without errors
4. Test with the "Test TTS" button first 