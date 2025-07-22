from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from groq import Groq
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta
import uuid
import random
import requests
import base64
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5174"])

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ejjfcobyzwmhttpsbkhpmprrv.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqamZjb2J5endtYmtocG1wcnJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzYzMjM5MSwiZXhwIjoyMDYzMjA4MzkxfQ.s95WYrM6yLp9xsNWhgWr0G25JHYV6eti9ox6o2PXCFc")

# Try to connect to Supabase, fallback to in-memory storage
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    SUPABASE_AVAILABLE = True
    print("✅ Supabase connected successfully")
except Exception as e:
    print(f"⚠️ Supabase not available: {e}")
    print("📝 Using in-memory storage as fallback")
    SUPABASE_AVAILABLE = False
    # In-memory storage
    in_memory_data = {
        'users': {},
        'sessions': [],
        'progress': {},
        'challenges': []
    }

# Groq client
groq_client = Groq(api_key="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")

# ElevenLabs configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your-elevenlabs-api-key")
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

# Voice settings
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice (you can change this)
VOICE_SETTINGS = {
    "stability": 0.5,
    "similarity_boost": 0.5,
    "style": 0.0,
    "use_speaker_boost": True
}

# Sample data for different features
SHADOWING_SENTENCES = [
    "Welcome to your English learning journey.",
    "Practice makes perfect in language learning.",
    "Confidence comes from consistent practice.",
    "Every mistake is a learning opportunity.",
    "Speak clearly and take your time."
]

CONVERSATION_SCENARIOS = {
    "job_interview": {
        "role": "Interviewer",
        "context": "You are interviewdeepgraming a candidate for a software developer position.",
        "questions": [
            "Tell me about your experience with Python.",
            "How do you handle difficult team situations?",
            "What are your career goals for the next five years?"
        ]
    },
    "restaurant": {
        "role": "Waiter",
        "context": "You are a waiter at a busy restaurant.",
        "questions": [
            "What would you like to order today?",
            "How would you like your steak cooked?",
            "Would you like to see our dessert menu?"
        ]
    },
    "hotel": {
        "role": "Receptionist",
        "context": "You are a hotel receptionist helping guests.",
        "questions": [
            "Do you have a reservation?",
            "What type of room would you prefer?",
            "How many nights will you be staying?"
        ]
    }
}

DAILY_CHALLENGES = [
    "Describe your favorite holiday and why you love it.",
    "Talk about a book or movie that changed your perspective.",
    "Explain your dream job and what makes it perfect for you.",
    "Describe your hometown and what makes it special.",
    "Talk about a person who has influenced your life."
]

# Reading Practice Content
READING_TOPICS = {
    "travel": {
        "title": "Travel & Tourism",
        "paragraphs": [
            "Welcome to our comprehensive travel guide. When planning your next adventure, consider the local customs and traditions of your destination. Research the best time to visit, as weather conditions can significantly impact your experience. Always book accommodations in advance, especially during peak tourist seasons. Remember to pack essential items like travel documents, comfortable clothing, and any necessary medications. Learning a few basic phrases in the local language can greatly enhance your travel experience and help you connect with the local community.",
            "Exploring new destinations offers incredible opportunities for personal growth and cultural enrichment. Each place has its unique history, cuisine, and way of life waiting to be discovered. Take time to immerse yourself in the local culture by trying traditional foods, visiting historical sites, and interacting with residents. Keep an open mind and be respectful of different customs and traditions. Document your journey through photos and journal entries to preserve precious memories for years to come.",
            "Sustainable tourism practices are becoming increasingly important in today's world. Choose eco-friendly accommodations and transportation options whenever possible. Support local businesses and artisans by purchasing authentic souvenirs and dining at family-owned restaurants. Minimize your environmental impact by reducing plastic waste and conserving water and energy. Remember that you are a guest in someone else's home, so treat the destination and its people with the respect they deserve."
        ]
    },
    "business": {
        "title": "Business English",
        "paragraphs": [
            "Effective communication is essential in today's competitive business environment. Whether you're presenting to clients, negotiating contracts, or collaborating with team members, clear and professional communication can make the difference between success and failure. Develop strong listening skills to understand your colleagues' perspectives and respond appropriately. Practice active listening by maintaining eye contact, asking clarifying questions, and providing thoughtful feedback. Remember that communication is a two-way street that requires both speaking and listening effectively.",
            "Building strong professional relationships is crucial for career advancement and business success. Networking events provide excellent opportunities to connect with industry professionals and potential collaborators. When attending these events, prepare an elevator pitch that clearly communicates your value proposition and professional goals. Follow up with new contacts within 48 hours to maintain momentum and demonstrate your interest in building lasting relationships. Remember that genuine connections are built on mutual respect and shared interests rather than purely transactional interactions.",
            "Leadership in the modern workplace requires adaptability and emotional intelligence. Successful leaders inspire their teams through clear vision, consistent communication, and genuine care for their employees' well-being. Foster a positive work culture by recognizing achievements, providing constructive feedback, and creating opportunities for professional development. Lead by example by demonstrating the values and behaviors you expect from your team members. Remember that great leadership is about serving others and helping them reach their full potential."
        ]
    },
    "daily_conversations": {
        "title": "Daily Conversations",
        "paragraphs": [
            "Everyday conversations form the foundation of our social connections and relationships. Whether you're chatting with neighbors, colleagues, or friends, being a good conversationalist involves both speaking and listening effectively. Show genuine interest in others by asking thoughtful questions and remembering details about their lives. Share your own experiences and opinions while being respectful of different viewpoints. Remember that conversations are opportunities to learn, connect, and build meaningful relationships with the people around you.",
            "Small talk serves as an important social lubricant in many situations, from waiting in line to attending social events. Master the art of casual conversation by having a few go-to topics ready, such as current events, weather, or shared experiences. Pay attention to social cues and body language to gauge whether someone wants to continue the conversation or politely end it. Be mindful of cultural differences in communication styles and adjust your approach accordingly. Remember that even brief interactions can brighten someone's day and create positive connections.",
            "Active listening is perhaps the most important skill in effective communication. When someone is speaking, give them your full attention by putting away distractions and maintaining appropriate eye contact. Use verbal and non-verbal cues to show you're engaged, such as nodding, making encouraging sounds, and asking relevant follow-up questions. Avoid interrupting or thinking about your response while the other person is still talking. Instead, focus on understanding their message completely before formulating your reply."
        ]
    },
    "academic": {
        "title": "Academic Reading",
        "paragraphs": [
            "Academic research plays a crucial role in advancing human knowledge and understanding across all fields of study. Researchers employ rigorous methodologies to investigate complex questions and develop evidence-based conclusions. The peer review process ensures that published findings meet high standards of quality and reliability. Collaboration between researchers from different institutions and countries often leads to breakthrough discoveries that would be impossible for individual scholars working alone. This international cooperation demonstrates the universal nature of scientific inquiry and the shared human desire to understand our world better.",
            "Critical thinking skills are essential for evaluating information and making informed decisions in today's complex world. Students must learn to distinguish between reliable sources and misinformation, analyze arguments for logical fallacies, and consider multiple perspectives on important issues. Developing these skills requires practice and patience, as critical thinking involves questioning assumptions, examining evidence, and forming well-reasoned conclusions. Educational institutions have a responsibility to teach these skills alongside subject-specific knowledge, preparing students to navigate an increasingly complex information landscape.",
            "The scientific method provides a systematic approach to investigating questions and testing hypotheses through observation, experimentation, and analysis. This process begins with asking a clear, specific question that can be answered through empirical investigation. Researchers then develop hypotheses, design experiments to test them, collect and analyze data, and draw conclusions based on evidence. The iterative nature of this process means that scientific understanding constantly evolves as new evidence emerges and theories are refined or replaced."
        ]
    },
    "news": {
        "title": "News & Current Events",
        "paragraphs": [
            "Staying informed about current events is essential for active citizenship and making informed decisions in our daily lives. Reliable news sources provide accurate, timely information about local, national, and international developments that affect our communities and the world. However, in today's digital age, it's crucial to evaluate the credibility of information sources and distinguish between factual reporting and opinion or misinformation. Developing media literacy skills helps us navigate the complex information landscape and make better decisions about what to believe and share with others.",
            "Technology continues to transform how we access and consume news, with social media platforms playing an increasingly important role in information dissemination. While these platforms offer unprecedented access to diverse perspectives and real-time updates, they also present challenges related to information quality and algorithmic bias. Users must be particularly vigilant about verifying information before sharing it, as false or misleading content can spread rapidly online. Responsible digital citizenship involves being thoughtful about our information consumption and sharing habits.",
            "Global interconnectedness means that events in one part of the world can have far-reaching consequences for people everywhere. Understanding international relations, economic trends, and environmental challenges helps us appreciate our place in the global community and make informed decisions about issues that affect us all. This global perspective encourages empathy and cooperation across cultural and national boundaries, fostering a sense of shared responsibility for addressing common challenges like climate change, economic inequality, and public health crises."
        ]
    }
}

# ElevenLabs Voice Functions
def text_to_speech(text, voice_id=VOICE_ID):
    """Convert text to speech using ElevenLabs"""
    try:
        url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": VOICE_SETTINGS
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            # Convert audio to base64 for frontend
            audio_base64 = base64.b64encode(response.content).decode('utf-8')
            return {
                "success": True,
                "audio_base64": audio_base64,
                "audio_url": f"data:audio/mpeg;base64,{audio_base64}"
            }
        else:
            print(f"ElevenLabs API error: {response.status_code} - {response.text}")
            return {"success": False, "error": f"API error: {response.status_code}"}
            
    except Exception as e:
        print(f"Error in text_to_speech: {e}")
        return {"success": False, "error": str(e)}

def speech_to_text(audio_data):
    """Convert speech to text using ElevenLabs"""
    try:
        url = f"{ELEVENLABS_BASE_URL}/speech-to-text"
        
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        files = {
            "audio": ("audio.wav", audio_data, "audio/wav")
        }
        
        response = requests.post(url, files=files, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "text": result.get("text", "")
            }
        else:
            print(f"ElevenLabs STT error: {response.status_code} - {response.text}")
            return {"success": False, "error": f"API error: {response.status_code}"}
            
    except Exception as e:
        print(f"Error in speech_to_text: {e}")
        return {"success": False, "error": str(e)}

# Helper functions for data storage with Supabase
def store_data(collection_name, data):
    if SUPABASE_AVAILABLE:
        try:
            if collection_name == 'sessions':
                supabase.table('sessions').insert(data).execute()
            elif collection_name == 'progress':
                # Upsert progress data
                supabase.table('progress').upsert(data).execute()
            elif collection_name == 'challenges':
                supabase.table('challenges').insert(data).execute()
            return True
        except Exception as e:
            print(f"Error storing data in Supabase: {e}")
            return False
    else:
        # Fallback to in-memory storage
        if collection_name == 'sessions':
            in_memory_data['sessions'].append(data)
        elif collection_name == 'progress':
            in_memory_data['progress'][data['user_id']] = data
        elif collection_name == 'challenges':
            in_memory_data['challenges'].append(data)
        return True

def get_data(collection_name, query=None):
    if SUPABASE_AVAILABLE:
        try:
            if collection_name == 'progress':
                if query and 'user_id' in query:
                    response = supabase.table('progress').select('*').eq('user_id', query['user_id']).execute()
                    return response.data[0] if response.data else None
                return None
            elif collection_name == 'sessions':
                if query and 'user_id' in query:
                    response = supabase.table('sessions').select('*').eq('user_id', query['user_id']).execute()
                    return response.data
                else:
                    response = supabase.table('sessions').select('*').execute()
                    return response.data
            elif collection_name == 'challenges':
                if query and 'user_id' in query:
                    response = supabase.table('challenges').select('*').eq('user_id', query['user_id']).execute()
                    return response.data
                else:
                    response = supabase.table('challenges').select('*').execute()
                    return response.data
        except Exception as e:
            print(f"Error getting data from Supabase: {e}")
            return None
    else:
        # Fallback to in-memory storage
        if collection_name == 'progress':
            return in_memory_data['progress'].get(query['user_id']) if query and 'user_id' in query else None
        elif collection_name == 'sessions':
            if query and 'user_id' in query:
                return [s for s in in_memory_data['sessions'] if s.get('user_id') == query.get('user_id')]
            return in_memory_data['sessions']
        elif collection_name == 'challenges':
            if query and 'user_id' in query:
                return [c for c in in_memory_data['challenges'] if c.get('user_id') == query.get('user_id')]
            return in_memory_data['challenges']
    return None

# Voice-enabled AI Tutor endpoints
@app.route('/api/ai-tutor/voice-chat', methods=['POST'])
def voice_chat():
    """Handle voice chat with AI tutor"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        user_id = data.get('user_id', 'default')
        
        # Get AI response
        prompt = {
            "role": "system",
            "content": """You are a helpful AI Tutor your job is to help out students learn English, 
            Now keep the conversations small and simple , under 20 words, don't explain everything to user,
            only ask questions and correct the answers user gave according to vocabulary, grammar, sentence formation ,etc .."""
        }
        
        user_msg = {
            "role": "user",
            "content": user_message
        }
        
        response = groq_client.chat.completions.create(
            messages=[prompt, user_msg],
            model="llama-3.3-70b-versatile",
        )
        
        ai_response = response.choices[0].message.content
        
        # Convert AI response to speech
        tts_result = text_to_speech(ai_response)
        
        return jsonify({
            'ai_response': ai_response,
            'audio_data': tts_result.get('audio_base64', ''),
            'audio_url': tts_result.get('audio_url', ''),
            'success': tts_result.get('success', False)
        })
        
    except Exception as e:
        print(f"Error in voice_chat: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai-tutor/text-to-speech', methods=['POST'])
def generate_speech():
    """Convert text to speech"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        result = text_to_speech(text)
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in generate_speech: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai-tutor/speech-to-text', methods=['POST'])
def convert_speech():
    """Convert speech to text"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        audio_data = audio_file.read()
        
        result = speech_to_text(audio_data)
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in convert_speech: {e}")
        return jsonify({'error': str(e)}), 500

# 1. Gamified Progress Tracker
@app.route('/api/progress/session', methods=['POST'])
def record_session():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        session_data = {
            'user_id': user_id,
            'topic': data.get('topic'),
            'fluency_score': data.get('fluency_score', 0),
            'accuracy_score': data.get('accuracy_score', 0),
            'speed_score': data.get('speed_score', 0),
            'total_score': data.get('total_score', 0),
            'mistakes': data.get('mistakes', []),
            'timestamp': datetime.now(),
            'session_id': str(uuid.uuid4())
        }
        
        store_data('sessions', session_data)
        
        # Update user progress
        update_user_progress(user_id, session_data['total_score'])
        
        return jsonify({'status': 'success', 'session_id': session_data['session_id']})
    except Exception as e:
        print(f"Error in record_session: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/progress/dashboard/<user_id>', methods=['GET'])
def get_progress_dashboard(user_id):
    try:
        # Get user's progress data
        user_progress = get_data('progress', {'user_id': user_id})
        if not user_progress:
            user_progress = {
                'user_id': user_id,
                'level': 1,
                'experience': 0,
                'badges': [],
                'total_sessions': 0,
                'average_score': 0
            }
            store_data('progress', user_progress)
        
        # Get recent sessions
        recent_sessions = get_data('sessions', {'user_id': user_id})
        if recent_sessions:
            recent_sessions = sorted(recent_sessions, key=lambda x: x.get('timestamp', datetime.min), reverse=True)[:10]
        else:
            recent_sessions = []
        
        # Calculate weekly/monthly stats
        week_ago = datetime.now() - timedelta(days=7)
        weekly_sessions = [s for s in get_data('sessions', {'user_id': user_id}) if s.get('timestamp', datetime.min) >= week_ago]
        
        weekly_avg = sum(s['total_score'] for s in weekly_sessions) / len(weekly_sessions) if weekly_sessions else 0
        
        return jsonify({
            'user_progress': user_progress,
            'recent_sessions': recent_sessions,
            'weekly_average': weekly_avg,
            'weekly_sessions_count': len(weekly_sessions)
        })
    except Exception as e:
        print(f"Error in get_progress_dashboard: {e}")
        return jsonify({'error': str(e)}), 500

# 2. Shadowing Mode
@app.route('/api/shadowing/sentence', methods=['GET'])
def get_shadowing_sentence():
    try:
        sentence = random.choice(SHADOWING_SENTENCES)
        
        # Generate speech for the sentence
        tts_result = text_to_speech(sentence)
        
        return jsonify({
            'sentence': sentence,
            'audio_data': tts_result.get('audio_base64', ''),
            'audio_url': tts_result.get('audio_url', ''),
            'success': tts_result.get('success', False)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/shadowing/evaluate', methods=['POST'])
def evaluate_shadowing():
    try:
        data = request.get_json()
        original_sentence = data.get('original_sentence')
        spoken_text = data.get('spoken_text')
        
        # Simple comparison (in real app, use more sophisticated NLP)
        original_words = set(original_sentence.lower().split())
        spoken_words = set(spoken_text.lower().split())
        
        missed_words = original_words - spoken_words
        extra_words = spoken_words - original_words
        
        accuracy = len(original_words.intersection(spoken_words)) / len(original_words) * 100
        
        feedback = {
            'accuracy': accuracy,
            'missed_words': list(missed_words),
            'extra_words': list(extra_words),
            'score': min(100, accuracy + (100 - len(missed_words) * 10))
        }
        
        return jsonify(feedback)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 3. Conversation Simulator
@app.route('/api/conversation/scenarios', methods=['GET'])
def get_conversation_scenarios():
    try:
        return jsonify(list(CONVERSATION_SCENARIOS.keys()))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversation/start', methods=['POST'])
def start_conversation():
    try:
        data = request.get_json()
        scenario = data.get('scenario')
        
        if scenario not in CONVERSATION_SCENARIOS:
            return jsonify({'error': 'Invalid scenario'}), 400
        
        scenario_data = CONVERSATION_SCENARIOS[scenario]
        conversation_id = str(uuid.uuid4())
        
        return jsonify({
            'conversation_id': conversation_id,
            'scenario': scenario_data,
            'first_message': scenario_data['questions'][0]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversation/respond', methods=['POST'])
def conversation_respond():
    try:
        data = request.get_json()
        conversation_id = data.get('conversation_id')
        user_message = data.get('user_message')
        scenario = data.get('scenario')
        
        # Generate AI response using Groq
        prompt = {
            "role": "system",
            "content": f"You are a {CONVERSATION_SCENARIOS[scenario]['role']}. {CONVERSATION_SCENARIOS[scenario]['context']} Respond naturally and conversationally."
        }
        
        user_msg = {
            "role": "user",
            "content": user_message
        }
        
        response = groq_client.chat.completions.create(
            messages=[prompt, user_msg],
            model="llama-3.3-70b-versatile",
        )
        
        ai_response = response.choices[0].message.content
        
        # Generate speech for AI response
        tts_result = text_to_speech(ai_response)
        
        return jsonify({
            'ai_response': ai_response,
            'audio_data': tts_result.get('audio_base64', ''),
            'audio_url': tts_result.get('audio_url', ''),
            'success': tts_result.get('success', False)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 4. Personalized Topic Suggestions
@app.route('/api/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    try:
        # Get user's performance data
        user_sessions = get_data('sessions', {'user_id': user_id})
        
        if not user_sessions:
            return jsonify({'recommendations': ['Travel', 'Daily Life', 'Business']})
        
        # Analyze weak areas
        topic_performance = {}
        for session in user_sessions:
            topic = session.get('topic', 'General')
            if topic not in topic_performance:
                topic_performance[topic] = []
            topic_performance[topic].append(session['total_score'])
        
        # Find topics with lowest average scores
        topic_averages = {
            topic: sum(scores) / len(scores) 
            for topic, scores in topic_performance.items()
        }
        
        # Recommend topics with lowest performance
        sorted_topics = sorted(topic_averages.items(), key=lambda x: x[1])
        weak_topics = [topic for topic, score in sorted_topics[:3]]
        
        return jsonify({'recommendations': weak_topics})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 5. Daily Challenges
@app.route('/api/challenges/daily', methods=['GET'])
def get_daily_challenge():
    try:
        today = datetime.now().strftime('%Y-%m-%d')
        challenge = random.choice(DAILY_CHALLENGES)
        
        return jsonify({
            'date': today,
            'challenge': challenge,
            'category': 'speaking'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/challenges/submit', methods=['POST'])
def submit_challenge():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        challenge_text = data.get('challenge_text')
        spoken_text = data.get('spoken_text')
        
        # Evaluate the challenge submission
        evaluation = evaluate_speaking_challenge(spoken_text, challenge_text)
        
        # Store challenge submission
        challenge_data = {
            'user_id': user_id,
            'challenge_text': challenge_text,
            'spoken_text': spoken_text,
            'evaluation': evaluation,
            'timestamp': datetime.now()
        }
        store_data('challenges', challenge_data)
        
        return jsonify(evaluation)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 6. Peer Challenge Mode
@app.route('/api/challenge/create', methods=['POST'])
def create_peer_challenge():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        topic = data.get('topic')
        
        challenge_id = str(uuid.uuid4())
        
        return jsonify({'challenge_id': challenge_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/challenge/join/<challenge_id>', methods=['POST'])
def join_peer_challenge(challenge_id):
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        return jsonify({'status': 'joined', 'topic': 'General'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper functions
def update_user_progress(user_id, score):
    progress = get_data('progress', {'user_id': user_id})
    
    if not progress:
        progress = {
            'user_id': user_id,
            'level': 1,
            'experience': 0,
            'badges': [],
            'total_sessions': 0,
            'average_score': 0
        }
    
    progress['experience'] += score
    progress['total_sessions'] += 1
    progress['average_score'] = (progress['average_score'] * (progress['total_sessions'] - 1) + score) / progress['total_sessions']
    
    # Level up logic
    new_level = (progress['experience'] // 1000) + 1
    if new_level > progress['level']:
        progress['level'] = new_level
        progress['badges'].append(f'Level {new_level} Achiever')
    
    store_data('progress', progress)

def evaluate_speaking_challenge(spoken_text, challenge_text):
    # Simple evaluation (in real app, use more sophisticated NLP)
    words_spoken = len(spoken_text.split())
    words_challenge = len(challenge_text.split())
    
    fluency_score = min(100, (words_spoken / words_challenge) * 100)
    grammar_score = 85  # Placeholder
    vocabulary_score = 80  # Placeholder
    
    total_score = (fluency_score + grammar_score + vocabulary_score) / 3
    
    return {
        'fluency_score': fluency_score,
        'grammar_score': grammar_score,
        'vocabulary_score': vocabulary_score,
        'total_score': total_score,
        'feedback': f"Great effort! You spoke {words_spoken} words. Keep practicing for better fluency."
    }

# Reading Practice Analysis Functions
def analyze_reading_performance(original_text, spoken_text, reading_time, total_words):
    """Analyze reading performance and provide detailed feedback"""
    try:
        # Convert to lowercase for comparison
        original_lower = original_text.lower()
        spoken_lower = spoken_text.lower()
        
        # Split into words
        original_words = original_lower.split()
        spoken_words = spoken_lower.split()
        
        # Calculate accuracy metrics
        total_original_words = len(original_words)
        total_spoken_words = len(spoken_words)
        
        # Find correct words
        correct_words = []
        missed_words = []
        extra_words = []
        
        # Simple word-by-word comparison
        original_set = set(original_words)
        spoken_set = set(spoken_words)
        
        correct_words = list(original_set.intersection(spoken_set))
        missed_words = list(original_set - spoken_set)
        extra_words = list(spoken_set - original_set)
        
        # Calculate scores
        accuracy_score = len(correct_words) / total_original_words * 100 if total_original_words > 0 else 0
        
        # Calculate speed (words per minute)
        words_per_minute = (total_spoken_words / reading_time) * 60 if reading_time > 0 else 0
        
        # Determine fluency level
        if words_per_minute < 120:
            fluency_level = "Slow"
            fluency_score = 60
        elif words_per_minute < 150:
            fluency_level = "Moderate"
            fluency_score = 80
        elif words_per_minute < 180:
            fluency_level = "Good"
            fluency_score = 90
        else:
            fluency_level = "Fast"
            fluency_score = 95
        
        # Calculate overall score
        overall_score = (accuracy_score * 0.6) + (fluency_score * 0.4)
        
        # Generate feedback
        feedback = generate_reading_feedback(accuracy_score, fluency_score, missed_words, extra_words, words_per_minute)
        
        return {
            "accuracy_score": round(accuracy_score, 1),
            "fluency_score": round(fluency_score, 1),
            "speed_score": round(words_per_minute, 1),
            "overall_score": round(overall_score, 1),
            "words_per_minute": round(words_per_minute, 1),
            "fluency_level": fluency_level,
            "correct_words": len(correct_words),
            "missed_words": missed_words,
            "extra_words": extra_words,
            "total_original_words": total_original_words,
            "total_spoken_words": total_spoken_words,
            "feedback": feedback,
            "reading_time": reading_time
        }
        
    except Exception as e:
        print(f"Error in analyze_reading_performance: {e}")
        return {
            "accuracy_score": 0,
            "fluency_score": 0,
            "speed_score": 0,
            "overall_score": 0,
            "words_per_minute": 0,
            "fluency_level": "Unknown",
            "correct_words": 0,
            "missed_words": [],
            "extra_words": [],
            "total_original_words": 0,
            "total_spoken_words": 0,
            "feedback": "Error analyzing performance",
            "reading_time": 0
        }

def generate_reading_feedback(accuracy_score, fluency_score, missed_words, extra_words, words_per_minute):
    """Generate detailed feedback based on performance metrics"""
    feedback_parts = []
    
    # Accuracy feedback
    if accuracy_score >= 95:
        feedback_parts.append("Excellent accuracy! You captured almost all the words correctly.")
    elif accuracy_score >= 85:
        feedback_parts.append("Good accuracy with room for improvement.")
    elif accuracy_score >= 70:
        feedback_parts.append("Fair accuracy. Focus on reading each word carefully.")
    else:
        feedback_parts.append("Accuracy needs improvement. Practice reading more slowly and clearly.")
    
    # Speed feedback
    if words_per_minute < 120:
        feedback_parts.append("Your reading speed is quite slow. Try to increase your pace gradually.")
    elif words_per_minute < 150:
        feedback_parts.append("Moderate reading speed. Good balance between accuracy and pace.")
    elif words_per_minute < 180:
        feedback_parts.append("Good reading speed! You're maintaining a nice pace.")
    else:
        feedback_parts.append("Fast reading speed. Make sure you're not sacrificing accuracy for speed.")
    
    # Specific word feedback
    if missed_words:
        feedback_parts.append(f"Words to practice: {', '.join(missed_words[:5])}")
    
    if extra_words:
        feedback_parts.append(f"Extra words spoken: {', '.join(extra_words[:3])}")
    
    # Overall encouragement
    if accuracy_score >= 90 and words_per_minute >= 140:
        feedback_parts.append("Outstanding performance! Keep up the excellent work!")
    elif accuracy_score >= 80:
        feedback_parts.append("Good job! Continue practicing to improve further.")
    else:
        feedback_parts.append("Keep practicing! Reading aloud regularly will help improve your skills.")
    
    return " ".join(feedback_parts)

# Reading Practice Endpoints
@app.route('/api/reading/topics', methods=['GET'])
def get_reading_topics():
    """Get available reading topics"""
    try:
        topics = [{"id": key, "title": value["title"]} for key, value in READING_TOPICS.items()]
        return jsonify({"topics": topics})
    except Exception as e:
        print(f"Error getting reading topics: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/reading/content/<topic>', methods=['GET'])
def get_reading_content(topic):
    """Get reading content for a specific topic"""
    try:
        if topic not in READING_TOPICS:
            return jsonify({"error": "Topic not found"}), 404
        
        topic_data = READING_TOPICS[topic]
        
        # Generate speech for the first paragraph
        first_paragraph = topic_data["paragraphs"][0]
        tts_result = text_to_speech(first_paragraph)
        
        return jsonify({
            "topic": topic,
            "title": topic_data["title"],
            "paragraphs": topic_data["paragraphs"],
            "current_paragraph": 0,
            "audio_data": tts_result.get('audio_base64', ''),
            "audio_url": tts_result.get('audio_url', ''),
            "success": tts_result.get('success', False)
        })
    except Exception as e:
        print(f"Error getting reading content: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/reading/analyze', methods=['POST'])
def analyze_reading():
    """Analyze reading performance and provide feedback"""
    try:
        data = request.get_json()
        original_text = data.get('original_text', '')
        spoken_text = data.get('spoken_text', '')
        reading_time = data.get('reading_time', 0)  # in seconds
        user_id = data.get('user_id', 'default')
        topic = data.get('topic', 'general')
        
        # Analyze performance
        analysis = analyze_reading_performance(original_text, spoken_text, reading_time, len(spoken_text.split()))
        
        # Record session for progress tracking
        session_data = {
            'user_id': user_id,
            'topic': f"reading_{topic}",
            'fluency_score': analysis['fluency_score'],
            'accuracy_score': analysis['accuracy_score'],
            'speed_score': analysis['speed_score'],
            'total_score': analysis['overall_score'],
            'mistakes': analysis['missed_words'],
            'timestamp': datetime.now(),
            'session_id': str(uuid.uuid4()),
            'session_type': 'reading_practice'
        }
        
        store_data('sessions', session_data)
        
        # Update user progress
        update_user_progress(user_id, analysis['overall_score'])
        
        return jsonify(analysis)
        
    except Exception as e:
        print(f"Error analyzing reading: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/reading/paragraph-audio', methods=['POST'])
def get_paragraph_audio():
    """Generate audio for a specific paragraph"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        result = text_to_speech(text)
        return jsonify(result)
        
    except Exception as e:
        print(f"Error generating paragraph audio: {e}")
        return jsonify({'error': str(e)}), 500

# Existing endpoints
@app.route('/api/english-tutor', methods=['POST'])
def get_reply():
    try:
        data = request.get_json()
        user_messages = data.get('messages')
        print(data)
        
        prompt = {
            "role": "system",
            "content": f"""
            **Context:**
                You are a helpful AI Tutor your job is to help out students learn English, Now keep the conversations small and simple , under 20 words, don't explain everything to user,
                only ask questions and correct the answers user gave according to vocabulary, grammar, sentence formation ,etc ."""
        }

        groq_messages = [prompt] + user_messages

        chat_completion = groq_client.chat.completions.create(
            messages=groq_messages,
            model="llama-3.3-70b-versatile",
        )

        response = {
            "response": chat_completion.choices[0].message.content
        }
        print(response)
        return jsonify(response)

    except Exception as e:
        print("Error occurred in /api/chat:", e)
        return jsonify({"response": "⚠️ Limit Exceeded , Please try again after sometime..."})

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    print("User feedback:", data)
    return jsonify({'status': 'received'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(debug=True, host='0.0.0.0', port=port)
