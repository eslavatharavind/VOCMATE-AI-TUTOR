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
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "https://vocmate-ai-tutor.vercel.app"]}}, supports_credentials=True)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://lbefxnzdyudpsxuyujhv.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# In-memory storage fallback (always initialized)
in_memory_data = {
    'users': {},
    'sessions': [],
    'progress': {},
    'challenges': []
}

# Try to connect to Supabase, fallback to in-memory storage
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    SUPABASE_AVAILABLE = True
    print("Supabase connected successfully")
except Exception as e:
    print(f"Supabase not available: {e}")
    print("Using in-memory storage as fallback")
    SUPABASE_AVAILABLE = False

# Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ElevenLabs configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your-elevenlabs-api-key")
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

# Voice settings
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "cgSgspJ2msm6clMCkdW9")  # Lily voice as fallback
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
        "context": "You are interviewing a candidate for a software developer position.",
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
    },
    "doctor_visit": {
        "role": "Doctor",
        "context": "You are a doctor discussing symptoms with a patient.",
        "questions": [
            "What symptoms have you been experiencing lately?",
            "How long have you felt this way?",
            "Are you currently taking any medications?"
        ]
    },
    "airport_checkin": {
        "role": "Customs Officer",
        "context": "You are a customs officer checking a traveler's passport.",
        "questions": [
            "What is the purpose of your visit?",
            "How long do you plan to stay in the country?",
            "Do you have anything to declare?"
        ]
    },
    "buying_coffee": {
        "role": "Barista",
        "context": "You are a barista taking orders at a coffee house.",
        "questions": [
            "What can I get started for you today?",
            "What size cup would you like?",
            "Would you like any pastries or snacks with that?"
        ]
    },
    "asking_directions": {
        "role": "Local Resident",
        "context": "You are a local resident helping a tourist.",
        "questions": [
            "Are you lost? Where are you trying to go?",
            "Do you have a map or are you navigating on your phone?",
            "Would you like me to walk you to the nearest station?"
        ]
    },
    "project_meeting": {
        "role": "Project Manager",
        "context": "You are a manager leading a project status update.",
        "questions": [
            "Can you give us a quick status update on your tasks?",
            "What roadblocks are you currently facing?",
            "Do we need to adjust our timeline for the next milestone?"
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

PICTURE_CHALLENGE_IMAGES = [
    "https://images.unsplash.com/photo-1513829096999-4978602294fc?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1488459718432-0105587d5b82?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop"
]

STORY_WORDS = [
    "airport", "birthday", "rain", "teacher", "dog",
    "coffee", "bicycle", "umbrella", "backpack", "guitar",
    "market", "forest", "camera", "clock", "friend",
    "ocean", "window", "key", "letter", "shoes",
    "scientist", "painting", "island", "bridge", "library",
    "mountain", "chef", "garden", "airplane", "museum"
]

# Reading Practice Content
READING_TOPICS_LIST = [
    {"id": "travel", "title": "Travel & Tourism"},
    {"id": "business", "title": "Business English"},
    {"id": "daily_conversations", "title": "Daily Conversations"},
    {"id": "academic", "title": "Academic Reading"},
    {"id": "news", "title": "News & Current Events"},
    {"id": "science", "title": "Science & Tech"},
    {"id": "history", "title": "World History"},
    {"id": "literature", "title": "Classic Literature"},
    {"id": "health", "title": "Health & Fitness"},
    {"id": "cooking", "title": "Culinary Arts"},
    {"id": "space", "title": "Space Exploration"},
    {"id": "music", "title": "History of Music"},
    {"id": "art", "title": "Fine Arts & Design"},
    {"id": "ai", "title": "Artificial Intelligence"},
    {"id": "quantum", "title": "Quantum Computing"},
    {"id": "space_colonization", "title": "Space Colonization"},
    {"id": "renewable_energy", "title": "Renewable Energy"},
    {"id": "climate_change", "title": "Climate Change"},
    {"id": "marine_biology", "title": "Marine Biology"},
    {"id": "genetics", "title": "Genetics & CRISPR"},
    {"id": "cybersecurity", "title": "Cybersecurity Basics"},
    {"id": "internet_history", "title": "The History of Internet"},
    {"id": "robotics", "title": "Robotics in Medicine"},
    {"id": "vr", "title": "Virtual Reality"},
    {"id": "nanotechnology", "title": "Nanotechnology"},
    {"id": "big_data", "title": "Big Data Analytics"},
    {"id": "self_driving", "title": "Self-Driving Cars"},
    {"id": "future_of_jobs", "title": "The Future of Jobs"},
    {"id": "pyramids", "title": "Ancient Egyptian Pyramids"},
    {"id": "roman_empire", "title": "The Roman Empire"},
    {"id": "silk_road", "title": "The Silk Road"},
    {"id": "renaissance", "title": "The Renaissance"},
    {"id": "industrial_revolution", "title": "Industrial Revolution"},
    {"id": "ww2", "title": "World War II History"},
    {"id": "greek_philosophy", "title": "Ancient Greek Philosophy"},
    {"id": "space_race", "title": "The Space Race"},
    {"id": "maya", "title": "Maya Civilization"},
    {"id": "feudal_japan", "title": "Feudal Japan"},
    {"id": "great_wall", "title": "The Great Wall of China"},
    {"id": "writing_history", "title": "History of Writing"},
    {"id": "vikings", "title": "Viking Voyages"},
    {"id": "printing_press", "title": "The Printing Press"},
    {"id": "agriculture_origins", "title": "Origins of Agriculture"},
    {"id": "nutrition", "title": "Nutrition & Diet"},
    {"id": "mental_health", "title": "Mental Health Awareness"},
    {"id": "yoga", "title": "Yoga & Mindfulness"},
    {"id": "sleep_science", "title": "Sleep Science"},
    {"id": "cardio", "title": "Cardiovascular Fitness"},
    {"id": "longevity", "title": "Longevity Studies"},
    {"id": "stress_science", "title": "The Science of Stress"},
    {"id": "gardening", "title": "Home Gardening"},
    {"id": "walking_benefits", "title": "Benefits of Walking"},
    {"id": "hydration", "title": "Hydration and Health"},
    {"id": "classical_music", "title": "Classical Music Masters"},
    {"id": "modern_art", "title": "Modern Art Movements"},
    {"id": "cinema_history", "title": "History of Cinema"},
    {"id": "architecture_wonders", "title": "Architectural Wonders"},
    {"id": "photography", "title": "Photography Techniques"},
    {"id": "mythology", "title": "Mythology & Folklore"},
    {"id": "theater", "title": "Theater and Drama"},
    {"id": "creative_writing", "title": "Creative Writing"},
    {"id": "dance_history", "title": "History of Dance"},
    {"id": "fashion", "title": "Fashion and Society"},
    {"id": "microeconomics", "title": "Microeconomics"},
    {"id": "behavioral_psychology", "title": "Behavioral Psychology"},
    {"id": "anthropology", "title": "Cultural Anthropology"},
    {"id": "media_sociology", "title": "Sociology of Media"},
    {"id": "political_philosophy", "title": "Political Philosophy"},
    {"id": "urban_planning", "title": "Urban Planning"},
    {"id": "public_speaking", "title": "Public Speaking"},
    {"id": "negotiation", "title": "Negotiation Skills"},
    {"id": "eq", "title": "Emotional Intelligence"},
    {"id": "time_management", "title": "Time Management"},
    {"id": "national_parks", "title": "National Parks Wonders"},
    {"id": "ocean_currents", "title": "Ocean Currents"},
    {"id": "desert_ecosystems", "title": "Desert Ecosystems"},
    {"id": "rainforest", "title": "Amazon Rainforest"},
    {"id": "volcanoes", "title": "Active Volcanoes"},
    {"id": "glaciers", "title": "Glacier Retreats"},
    {"id": "bird_migration", "title": "Bird Migration"},
    {"id": "solar_system", "title": "Solar System Planets"},
    {"id": "deep_sea", "title": "Deep Sea Exploration"},
    {"id": "microbes", "title": "Microscopic Life"},
    {"id": "coffee_culture", "title": "Coffee Culture"},
    {"id": "baking_science", "title": "Baking Science"},
    {"id": "pet_care", "title": "Pet Care and Behavior"},
    {"id": "diy_projects", "title": "DIY Home Projects"},
    {"id": "board_games", "title": "Board Games History"},
    {"id": "stargazing", "title": "Stargazing Tips"},
    {"id": "ecotourism", "title": "Ecotourism Travel"},
    {"id": "financial_literacy", "title": "Financial Literacy"},
    {"id": "minimalist_living", "title": "Minimalist Living"},
    {"id": "public_transport", "title": "Public Transportation"},
    {"id": "english_idioms", "title": "English Idioms & Phrases"},
    {"id": "presentations", "title": "Formal Presentation Tips"},
    {"id": "job_interview", "title": "Job Interview Prep"},
    {"id": "work_socializing", "title": "Socializing at Work"},
    {"id": "email_writing", "title": "Writing Emails"},
    {"id": "describing_feelings", "title": "Describing Feelings"},
    {"id": "directions", "title": "Giving Directions"},
    {"id": "restaurant_order", "title": "Ordering at a Restaurant"},
    {"id": "hotel_checkin", "title": "Checking into a Hotel"},
    {"id": "shopping_conversations", "title": "Shopping Conversations"},
    {"id": "sports_history", "title": "The History of Sports"},
    {"id": "sustainable_architecture", "title": "Sustainable Architecture"},
    {"id": "first_aid", "title": "Basic First Aid"},
    {"id": "learning_psychology", "title": "The Psychology of Learning"},
    {"id": "blogging", "title": "Blogging & Content Creation"}
]

READING_TOPICS = {
    "travel": {
        "title": "Travel & Tourism",
        "paragraphs": [
            "Welcome to our comprehensive travel guide. When planning your next adventure, consider the local customs and traditions of your destination. Research the best time to visit, as weather conditions can significantly impact your experience. Always book accommodations in advance, especially during peak seasons. Remember to pack essential items like travel documents, comfortable clothing, and necessary medications. Learning basic phrases in the local language can greatly enhance your travel experience and help you connect with the community.",
            "Exploring new destinations offers incredible opportunities for personal growth and cultural enrichment. Each place has its unique history, cuisine, and way of life waiting to be discovered. Take time to immerse yourself in the local culture by trying traditional foods, visiting historical sites, and interacting with residents. Keep an open mind and be respectful of different customs and traditions. Document your journey through photos and journal entries to preserve precious memories for years to come.",
            "Sustainable tourism practices are becoming increasingly important in today's world. Choose eco-friendly accommodations and transportation options whenever possible. Support local businesses and artisans by purchasing authentic souvenirs and dining at family-owned restaurants. Minimize your environmental impact by reducing plastic waste and conserving water and energy. Remember that you are a guest in someone else's home, so treat the destination and its people with the respect they deserve.",
            "Cultural awareness is a key aspect of traveling responsibly and respectfully. Take the time to learn about local etiquette, dress codes, and communication styles to avoid accidental misunderstandings. Try to support the local economy directly by hiring local guides and purchasing local services. When you travel with respect and curiosity, you help build bridges of understanding between different cultures, enriching both your life and the lives of those you meet along the way."
        ]
    },
    "business": {
        "title": "Business English",
        "paragraphs": [
            "Effective communication is essential in today's competitive business environment. Whether you're presenting to clients, negotiating contracts, or collaborating with team members, clear and professional communication can make the difference between success and failure. Develop strong listening skills to understand your colleagues' perspectives and respond appropriately. Practice active listening by maintaining eye contact, asking clarifying questions, and providing thoughtful feedback. Remember that communication is a two-way street that requires both speaking and listening effectively.",
            "Building strong professional relationships is crucial for career advancement and business success. Networking events provide excellent opportunities to connect with industry professionals and potential collaborators. When attending these events, prepare an elevator pitch that clearly communicates your value proposition and professional goals. Follow up with new contacts within 48 hours to maintain momentum and demonstrate your interest in building lasting relationships. Remember that genuine connections are built on mutual respect and shared interests rather than purely transactional interactions.",
            "Leadership in the modern workplace requires adaptability and emotional intelligence. Successful leaders inspire their teams through clear vision, consistent communication, and genuine care for their employees' well-being. Foster a positive work culture by recognizing achievements, providing constructive feedback, and creating opportunities for professional development. Lead by example by demonstrating the values and behaviors you expect from your team members. Remember that great leadership is about serving others and helping them reach their full potential.",
            "Conflict resolution is another critical aspect of modern business communication. In any collaborative environment, differences of opinion are bound to arise, but managing them constructively is key to maintaining a healthy workplace. Active listening and empathy allow teams to address disagreements directly and find mutually beneficial solutions. When communication is open and respectful, conflicts can actually lead to innovative ideas and stronger professional ties."
        ]
    },
    "daily_conversations": {
        "title": "Daily Conversations",
        "paragraphs": [
            "Everyday conversations form the foundation of our social connections and relationships. Whether you're chatting with neighbors, colleagues, or friends, being a good conversationalist involves both speaking and listening effectively. Show genuine interest in others by asking thoughtful questions and remembering details about their lives. Share your own experiences and opinions while being respectful of different viewpoints. Remember that conversations are opportunities to learn, connect, and build meaningful relationships with the people around you.",
            "Small talk serves as an important social lubricant in many situations, from waiting in line to attending social events. Master the art of casual conversation by having a few go-to topics ready, such as current events, weather, or shared experiences. Pay attention to social cues and body language to gauge whether someone wants to continue the conversation or politely end it. Be mindful of cultural differences in communication styles and adjust your approach accordingly. Remember that even brief interactions can brighten someone's day and create positive connections.",
            "Active listening is perhaps the most important skill in effective communication. When someone is speaking, give them your full attention by putting away distractions and maintaining appropriate eye contact. Use verbal and non-verbal cues to show you're engaged, such as nodding, making encouraging sounds, and asking relevant follow-up questions. Avoid interrupting or thinking about your response while the other person is still talking. Instead, focus on understanding their message completely before formulating your reply.",
            "In daily life, non-verbal cues can speak just as loudly as the spoken word. Facial expressions, gestures, and posture all play a significant role in conveying emotion and meaning. Being aware of your own body language helps you appear approachable and engaged, while reading others' cues allows you to respond more empathetically. Developing sensitivity to these subtle signals helps create deeper connections in every social interaction."
        ]
    },
    "academic": {
        "title": "Academic Reading",
        "paragraphs": [
            "Academic research plays a crucial role in advancing human knowledge and understanding across all fields of study. Researchers employ rigorous methodologies to investigate complex questions and develop evidence-based conclusions. The peer review process ensures that published findings meet high standards of quality and reliability. Collaboration between researchers from different institutions and countries often leads to breakthrough discoveries that would be impossible for individual scholars working alone. This international cooperation demonstrates the universal nature of scientific inquiry and the shared human desire to understand our world better.",
            "Critical thinking skills are essential for evaluating information and making informed decisions in today's complex world. Students must learn to distinguish between reliable sources and misinformation, analyze arguments for logical fallacies, and consider multiple perspectives on important issues. Developing these skills requires practice and patience, as critical thinking involves questioning assumptions, examining evidence, and forming well-reasoned conclusions. Educational institutions have a responsibility to teach these skills alongside subject-specific knowledge, preparing students to navigate an increasingly complex information landscape.",
            "The scientific method provides a systematic approach to investigating questions and testing hypotheses through observation, experimentation, and analysis. This process begins with asking a clear, specific question that can be answered through empirical investigation. Researchers then develop hypotheses, design experiments to test them, collect and analyze data, and draw conclusions based on evidence. The iterative nature of this process means that scientific understanding constantly evolves as new evidence emerges and theories are refined or replaced.",
            "Ethical considerations are fundamental to all academic research and scholarship. Researchers must maintain integrity in data collection, document sources accurately to avoid plagiarism, and treat participants with respect. Institutional review boards oversee studies to ensure that ethical standards are consistently met. This commitment to honesty and respect preserves public trust in scientific progress and ensures that research benefits society as a whole."
        ]
    },
    "news": {
        "title": "News & Current Events",
        "paragraphs": [
            "Staying informed about current events is essential for active citizenship and making informed decisions in our daily lives. Reliable news sources provide accurate, timely information about local, national, and international developments that affect our communities and the world. However, in today's digital age, it's crucial to evaluate the credibility of information sources and distinguish between factual reporting and opinion or misinformation. Developing media literacy skills helps us navigate the complex information landscape and make better decisions about what to believe and share with others.",
            "Technology continues to transform how we access and consume news, with social media platforms playing an increasingly important role in information dissemination. While these platforms offer unprecedented access to diverse perspectives and real-time updates, they also present challenges related to information quality and algorithmic bias. Users must be particularly vigilant about verifying information before sharing it, as false or misleading content can spread rapidly online. Responsible digital citizenship involves being thoughtful about our information consumption and sharing habits.",
            "Global interconnectedness means that events in one part of the world can have far-reaching consequences for people everywhere. Understanding international relations, economic trends, and environmental challenges helps us appreciate our place in the global community and make informed decisions about issues that affect us all. This global perspective encourages empathy and cooperation across cultural and national boundaries, fostering a sense of shared responsibility for addressing common challenges like climate change, economic inequality, and public health crises.",
            "A well-informed public is the cornerstone of any democratic society, enabling citizens to hold leaders accountable and engage in meaningful debate. When journalists adhere to rigorous standards of accuracy and objectivity, they perform a vital public service. Supporting independent journalism by subscribing to reliable news outlets helps ensure that high-quality reporting remains available to guide our collective decisions and protect public interests."
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
            "model_id": "eleven_multilingual_v2",
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
        
        data = {
            "model_id": "scribe"
        }
        
        response = requests.post(url, files=files, data=data, headers=headers)
        
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

# Helper functions to sanitize user ID and handle non-UUID strings gracefully
def ensure_user_exists(user_id):
    if SUPABASE_AVAILABLE:
        try:
            res = supabase.table('users').select('*').eq('id', user_id).execute()
            if not res.data:
                # Insert placeholder user to satisfy foreign key constraints
                supabase.table('users').insert({'id': user_id, 'email': f'{user_id}@placeholder.com'}).execute()
        except Exception as e:
            print(f"Error ensuring user exists: {e}")

def sanitize_user_id(user_id):
    if not user_id:
        return str(uuid.uuid4())
    try:
        # Check if valid UUID
        uuid.UUID(str(user_id))
        sanitized = str(user_id)
    except ValueError:
        # Deterministic UUID mapping for non-UUID strings
        sanitized = str(uuid.uuid5(uuid.NAMESPACE_DNS, str(user_id)))
    ensure_user_exists(sanitized)
    return sanitized

# Helper functions for data storage with Supabase
def store_data(collection_name, data):
    if data and 'user_id' in data:
        data['user_id'] = sanitize_user_id(data['user_id'])
        
    success = False
    if SUPABASE_AVAILABLE:
        try:
            if collection_name == 'sessions':
                # Map the app dictionary to database columns
                db_data = {
                    'id': data.get('session_id') or str(uuid.uuid4()),
                    'user_id': data.get('user_id'),
                    'session_type': data.get('session_type') or 'practice',
                    'topic': data.get('topic'),
                    'duration': data.get('duration') or 0,
                    'score': data.get('total_score') or data.get('score') or 0.0,
                    'feedback': data.get('feedback') or '',
                    'metadata': {
                        'fluency_score': data.get('fluency_score', 0),
                        'accuracy_score': data.get('accuracy_score', 0),
                        'speed_score': data.get('speed_score', 0),
                        'mistakes': data.get('mistakes', [])
                    }
                }
                supabase.table('sessions').insert(db_data).execute()
                success = True
            elif collection_name == 'progress':
                # Map the app dictionary to database columns
                db_data = {
                    'user_id': data.get('user_id'),
                    'total_sessions': data.get('total_sessions', 0),
                    'average_score': data.get('average_score', 0.0),
                    'last_session_at': datetime.now().isoformat(),
                    'learning_stats': {
                        'level': data.get('level', 1),
                        'experience': data.get('experience', 0),
                        'badges': data.get('badges', [])
                    }
                }
                supabase.table('progress').upsert(db_data).execute()
                success = True
            elif collection_name == 'challenges':
                # Map the app dictionary to database columns
                db_data = {
                    'user_id': data.get('user_id'),
                    'challenge_type': data.get('challenge_type') or 'speaking',
                    'title': data.get('challenge_text') or 'Daily Challenge',
                    'description': data.get('spoken_text') or '',
                    'status': 'completed',
                    'score': data.get('evaluation', {}).get('total_score') or 0.0,
                    'feedback': data.get('evaluation', {}).get('feedback') or '',
                    'completed_at': datetime.now().isoformat(),
                    'metadata': {
                        'evaluation': data.get('evaluation'),
                        'challenge_text': data.get('challenge_text'),
                        'spoken_text': data.get('spoken_text')
                    }
                }
                supabase.table('challenges').insert(db_data).execute()
                success = True
        except Exception as e:
            print(f"Error storing data in Supabase: {e}. Falling back to in-memory storage.")
            success = False

    if not success or not SUPABASE_AVAILABLE:
        # Fallback to in-memory storage
        if collection_name == 'sessions':
            in_memory_data['sessions'].append(data)
        elif collection_name == 'progress':
            in_memory_data['progress'][data['user_id']] = data
        elif collection_name == 'challenges':
            in_memory_data['challenges'].append(data)
    return True

def get_data(collection_name, query=None):
    if query and 'user_id' in query:
        query['user_id'] = sanitize_user_id(query['user_id'])
        
    if SUPABASE_AVAILABLE:
        try:
            if collection_name == 'progress':
                if query and 'user_id' in query:
                    response = supabase.table('progress').select('*').eq('user_id', query['user_id']).execute()
                    if response.data:
                        row = response.data[0]
                        stats = row.get('learning_stats') or {}
                        # Map database columns back to app dictionary
                        return {
                            'user_id': row.get('user_id'),
                            'total_sessions': row.get('total_sessions', 0),
                            'average_score': row.get('average_score', 0.0),
                            'level': stats.get('level', 1),
                            'experience': stats.get('experience', 0),
                            'badges': stats.get('badges', [])
                        }
            elif collection_name == 'sessions':
                if query and 'user_id' in query:
                    response = supabase.table('sessions').select('*').eq('user_id', query['user_id']).execute()
                else:
                    response = supabase.table('sessions').select('*').execute()
                
                if response.data is not None:
                    results = []
                    for row in response.data:
                        metadata = row.get('metadata') or {}
                        results.append({
                            'session_id': row.get('id'),
                            'user_id': row.get('user_id'),
                            'session_type': row.get('session_type'),
                            'topic': row.get('topic'),
                            'duration': row.get('duration'),
                            'total_score': row.get('score'),
                            'feedback': row.get('feedback'),
                            'fluency_score': metadata.get('fluency_score', 0),
                            'accuracy_score': metadata.get('accuracy_score', 0),
                            'speed_score': metadata.get('speed_score', 0),
                            'mistakes': metadata.get('mistakes', []),
                            'timestamp': row.get('created_at')
                        })
                    return results
            elif collection_name == 'challenges':
                if query and 'user_id' in query:
                    response = supabase.table('challenges').select('*').eq('user_id', query['user_id']).execute()
                else:
                    response = supabase.table('challenges').select('*').execute()
                
                if response.data is not None:
                    results = []
                    for row in response.data:
                        metadata = row.get('metadata') or {}
                        results.append({
                            'user_id': row.get('user_id'),
                            'challenge_text': metadata.get('challenge_text') or row.get('title'),
                            'spoken_text': metadata.get('spoken_text') or row.get('description'),
                            'evaluation': metadata.get('evaluation') or {
                                'total_score': row.get('score'),
                                'feedback': row.get('feedback')
                            },
                            'timestamp': row.get('completed_at') or row.get('created_at')
                        })
                    return results
        except Exception as e:
            print(f"Error getting data from Supabase: {e}. Falling back to in-memory storage.")

    # Fallback to in-memory storage
    if collection_name == 'progress':
        progress = in_memory_data['progress'].get(query['user_id']) if query and 'user_id' in query else None
        if not progress and query and 'user_id' in query:
            # Return default progress if not found in cache
            progress = {
                'user_id': query['user_id'],
                'level': 1,
                'experience': 0,
                'badges': [],
                'total_sessions': 0,
                'average_score': 0
            }
            in_memory_data['progress'][query['user_id']] = progress
        return progress
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
        
        # Self-healing streak check: reset streak if they missed a day
        today_date = datetime.now().date()
        if user_progress:
            last_practice_str = user_progress.get('last_practice_date')
            if last_practice_str:
                try:
                    last_practice_date = datetime.fromisoformat(last_practice_str).date()
                    delta = (today_date - last_practice_date).days
                    if delta > 1:
                        user_progress['current_streak'] = 0
                        store_data('progress', user_progress)
                except Exception as e:
                    print(f"Error checking streak expiration: {e}")
        else:
            user_progress = {
                'user_id': user_id,
                'level': 1,
                'experience': 0,
                'badges': [],
                'total_sessions': 0,
                'average_score': 0,
                'current_streak': 0,
                'longest_streak': 0,
                'last_practice_date': None
            }
            store_data('progress', user_progress)

        # Get all completed activities (sessions & challenges)
        all_sessions = get_data('sessions', {'user_id': user_id}) or []
        all_challenges = get_data('challenges', {'user_id': user_id}) or []
        
        # Format and aggregate completed activities
        activities = []
        
        # Add sessions
        for s in all_sessions:
            topic = s.get('topic') or 'General'
            category = "Simulation"
            if topic.startswith("reading_"):
                category = "Reading Practice"
            elif s.get('session_type') == 'shadowing':
                category = "Shadowing"
            
            timestamp = s.get('timestamp')
            if isinstance(timestamp, datetime):
                timestamp = timestamp.isoformat()
                
            activities.append({
                'name': topic.replace("reading_", "").replace("_", " ").title(),
                'category': category,
                'date': timestamp,
                'score': float(s.get('total_score') or s.get('score') or 0),
                'duration': int(s.get('duration') or 0) * 60,
                'fluency_score': s.get('fluency_score'),
                'grammar_score': s.get('accuracy_score'),
                'pronunciation_score': s.get('speed_score')
            })
            
        # Add challenges
        for c in all_challenges:
            eval_data = c.get('evaluation') or {}
            challenge_type = c.get('challenge_type') or 'daily'
            
            cat_map = {
                'daily': 'Daily Challenge',
                'jam': 'JAM (Just A Minute)',
                'picture': 'Picture Description',
                'story': 'Story Building',
                'roleplay': 'Role Play Challenge',
                'debate': 'Debate Challenge'
            }
            category = cat_map.get(challenge_type, 'Challenge')
            
            duration = 60
            if challenge_type == 'story':
                duration = 120
            elif challenge_type == 'debate':
                duration = 120
            elif challenge_type == 'roleplay':
                duration = 180
                
            timestamp = c.get('timestamp')
            if isinstance(timestamp, datetime):
                timestamp = timestamp.isoformat()
                
            activities.append({
                'name': c.get('challenge_text') or 'Speaking Task',
                'category': category,
                'date': timestamp,
                'score': float(eval_data.get('total_score') or c.get('score') or 0),
                'duration': duration,
                'fluency_score': eval_data.get('fluency_score'),
                'grammar_score': eval_data.get('grammar_score'),
                'pronunciation_score': eval_data.get('pronunciation_score'),
                'vocabulary_score': eval_data.get('vocabulary_score'),
                'confidence_score': eval_data.get('confidence_score'),
                'conversation_score': eval_data.get('conversation_score')
            })
            
        # Sort activities by date descending
        activities = sorted(activities, key=lambda x: x.get('date') or '', reverse=True)
        recent_activities = activities[:5]
        
        # Calculations for metrics
        total_activities = len(activities)
        overall_score = 0.0
        total_speaking_time = 0
        
        if total_activities > 0:
            overall_score = round(sum(a['score'] for a in activities) / total_activities, 1)
            total_speaking_time = sum(a['duration'] for a in activities if a.get('duration'))
            
        # Determine English level label
        if overall_score < 50:
            english_level = "Beginner"
        elif overall_score < 70:
            english_level = "Intermediate"
        elif overall_score < 85:
            english_level = "Advanced"
        else:
            english_level = "Fluent"
            
        # Skill averages aggregation
        skills = {
            'Fluency': [],
            'Grammar': [],
            'Pronunciation': [],
            'Vocabulary': [],
            'Confidence': [],
            'Reading': [],
            'Conversation Skills': []
        }
        
        for a in activities:
            if a.get('fluency_score') is not None:
                skills['Fluency'].append(float(a['fluency_score']))
            if a.get('grammar_score') is not None:
                skills['Grammar'].append(float(a['grammar_score']))
            if a.get('pronunciation_score') is not None:
                skills['Pronunciation'].append(float(a['pronunciation_score']))
            if a.get('vocabulary_score') is not None:
                skills['Vocabulary'].append(float(a['vocabulary_score']))
            if a.get('confidence_score') is not None:
                skills['Confidence'].append(float(a['confidence_score']))
            if a['category'] == 'Reading Practice':
                skills['Reading'].append(a['score'])
            if a['category'] in ['Simulation', 'Role Play Challenge'] or a.get('conversation_score') is not None:
                skills['Conversation Skills'].append(a.get('conversation_score') or a['score'])
                
        # Calculate averages, defaulting to 0 for unpracticed categories
        aggregated_skills = {}
        for skill_name, scores_list in skills.items():
            if scores_list:
                aggregated_skills[skill_name] = round(sum(scores_list) / len(scores_list), 1)
            else:
                aggregated_skills[skill_name] = 0.0
                
        # Daily Streak milestones calculation
        current_streak = user_progress.get('current_streak', 0)
        longest_streak = user_progress.get('longest_streak', 0)
        last_practice_str = user_progress.get('last_practice_date')
        
        milestones = [3, 7, 15, 30, 50, 100]
        next_milestone = 3
        for m in milestones:
            if m > current_streak:
                next_milestone = m
                break
                
        # Determine motivational message
        if current_streak == 0:
            motivation_message = "Practice today to start a new streak!"
        elif current_streak == longest_streak and current_streak > 0:
            motivation_message = "Amazing! New longest streak!"
        elif current_streak + 1 == next_milestone:
            motivation_message = f"Only 1 day left to reach a {next_milestone}-day streak!"
        else:
            motivation_message = "Keep your streak alive!"
            
        # Milestone celebration
        milestone_celebration = False
        if current_streak in milestones and last_practice_str == today_date.isoformat():
            milestone_celebration = True
            
        # AI insights generation based on actual history logs
        ai_insights = None
        if total_activities > 0:
            try:
                history_list = []
                for a in activities[:5]:
                    history_list.append(f"- {a['category']}: {a['name']} (Score: {a['score']})")
                history_str = "\n".join(history_list)
                
                prompt = (
                    "You are a professional English speaking coach.\n"
                    "Evaluate the user's progress based on their recent activity logs:\n"
                    f"{history_str}\n\n"
                    "Analyze their skill strengths and identify areas to improve based on these categories (Fluency, Grammar, Pronunciation, Vocabulary, Confidence, Reading, Conversation).\n"
                    "Provide realistic, highly constructive points.\n"
                    "You MUST return a JSON object with these EXACT keys:\n"
                    "1. 'strengths': List of 2 strings (concrete strengths, max 10 words each)\n"
                    "2. 'improvements': List of 2 strings (concrete improvements, max 10 words each)\n"
                    "3. 'suggestion': A single short sentence recommending what specific challenge or setting to practice next."
                )
                
                response = groq_client.chat.completions.create(
                    messages=[{"role": "system", "content": prompt}],
                    model="llama-3.3-70b-versatile",
                    response_format={"type": "json_object"}
                )
                ai_insights = json.loads(response.choices[0].message.content)
            except Exception as ge:
                print(f"Error generating AI insights with Groq: {ge}")
                ai_insights = None
                
        if not ai_insights:
            ai_insights = {
                'strengths': [
                    "Willingness to practice diverse topics",
                    "Takes challenges to build vocabulary"
                ],
                'improvements': [
                    "Increase speaking duration parameters",
                    "Focus on grammar structure consistency"
                ],
                'suggestion': "Complete a JAM speaking challenge today to test your vocabulary pace under pressure!"
            }

        return jsonify({
            'overall_score': overall_score,
            'english_level': english_level,
            'total_activities': total_activities,
            'total_speaking_time': total_speaking_time,
            'skills': aggregated_skills,
            'streak': {
                'current': current_streak,
                'longest': longest_streak,
                'last_practice_date': last_practice_str,
                'next_milestone': next_milestone,
                'message': motivation_message,
                'milestone_celebration': milestone_celebration
            },
            'recent_activities': recent_activities,
            'ai_insights': ai_insights,
            'user_progress': user_progress
        })
    except Exception as e:
        print(f"Error in get_progress_dashboard: {e}")
        return jsonify({'error': str(e)}), 500

# 2. Shadowing Mode
@app.route('/api/shadowing/sentence', methods=['GET'])
def get_shadowing_sentence():
    try:
        topic = request.args.get('topic')
        sentence = None
        
        if topic:
            try:
                # Use Groq to generate a sentence for the topic
                prompt = {
                    "role": "system",
                    "content": (
                        "You are an English speech tutor. Generate a single natural, simple English sentence "
                        f"suitable for pronunciation practice/shadowing on the topic: '{topic}'. "
                        "The sentence MUST be under 12 words, clean, and contain no quotes, explanations, or formatting. "
                        "Just output the plain sentence text."
                    )
                }
                response = groq_client.chat.completions.create(
                    messages=[prompt],
                    model="llama-3.3-70b-versatile",
                )
                sentence = response.choices[0].message.content.strip().strip('"').strip("'")
            except Exception as ge:
                print(f"Error generating shadowing sentence with Groq: {ge}")
                sentence = None
                
        if not sentence:
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
        print(f"Error in shadowing sentence endpoint: {e}")
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
        custom_topic = data.get('custom_topic')
        duration = data.get('duration', 5)
        
        if not scenario and not custom_topic:
            return jsonify({'error': 'No scenario or custom topic provided'}), 400
            
        conversation_id = str(uuid.uuid4())
        
        if custom_topic:
            # Generate custom scenario using Groq in JSON format
            prompt = (
                f"The user wants to practice English conversation on the custom topic: '{custom_topic}'.\n"
                "You must act as their conversational roleplay partner.\n"
                "Please generate a suitable roleplay configuration and return a JSON object with these EXACT keys:\n"
                "1. 'role': The name of the role you will play (e.g. 'Cashier', 'Doctor', 'Interviewer', 'Friend'). Keep it under 3-4 words.\n"
                "2. 'context': A brief description of the setting and relationship (e.g. 'You are checking in a guest at a hotel front desk. Be polite.'). Keep it under 15 words.\n"
                "3. 'first_message': Your opening greeting and first question to start the conversation naturally. Keep it under 2 sentences."
            )
            response = groq_client.chat.completions.create(
                messages=[{"role": "system", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}
            )
            raw_content = response.choices[0].message.content
            try:
                parsed = json.loads(raw_content)
                role = parsed.get('role', 'AI Partner')
                context = parsed.get('context', f'A conversation about {custom_topic}.')
                first_message = parsed.get('first_message', f'Hello! Let\'s chat about {custom_topic}.')
            except Exception as je:
                print(f"Error parsing custom scenario JSON: {je}")
                role = "AI Partner"
                context = f"A conversation about {custom_topic}."
                first_message = f"Hello! What would you like to discuss about {custom_topic}?"
                
            scenario_data = {
                'role': role,
                'context': context,
                'questions': [first_message]
            }
        else:
            if scenario not in CONVERSATION_SCENARIOS:
                return jsonify({'error': 'Invalid scenario'}), 400
            scenario_data = CONVERSATION_SCENARIOS[scenario]
            first_message = scenario_data['questions'][0]
            
        return jsonify({
            'conversation_id': conversation_id,
            'scenario': scenario_data,
            'first_message': first_message
        })
    except Exception as e:
        print(f"Error in start_conversation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversation/respond', methods=['POST'])
def conversation_respond():
    try:
        data = request.get_json()
        conversation_id = data.get('conversation_id')
        user_message = data.get('user_message')
        scenario = data.get('scenario')
        history = data.get('history', [])
        
        # Safely extract role and context from the scenario parameter
        role = None
        context = None
        if isinstance(scenario, dict):
            # Try to get scenario ID from dict
            scenario_id = scenario.get('scenario')
            if scenario_id in CONVERSATION_SCENARIOS:
                role = CONVERSATION_SCENARIOS[scenario_id]['role']
                context = CONVERSATION_SCENARIOS[scenario_id]['context']
            else:
                role = scenario.get('role')
                context = scenario.get('context')
        elif isinstance(scenario, str):
            if scenario in CONVERSATION_SCENARIOS:
                role = CONVERSATION_SCENARIOS[scenario]['role']
                context = CONVERSATION_SCENARIOS[scenario]['context']
                
        if not role or not context:
            # Fallback values
            role = "AI Partner"
            context = "You are a helpful conversation partner."
            
        duration = data.get('duration', 5)
        time_left = data.get('time_left')
        
        pacing_instruction = ""
        if time_left is not None:
            time_left_min = int(time_left) // 60
            time_left_sec = int(time_left) % 60
            time_str = f"{time_left_min} minutes and {time_left_sec} seconds"
            pacing_instruction = f" The total practice duration is {duration} minutes, and there is {time_str} remaining. "
            if int(time_left) < 60:
                pacing_instruction += "Only a short time remains! Begin wrapping up the conversation naturally and politely."

        # Prompt Groq to return JSON containing conversational response and grammar analysis
        prompt_content = (
            f"You are a {role}. {context}{pacing_instruction} "
            "Respond naturally to the user's input. "
            "You MUST return a JSON object with the following keys:\n"
            "1. 'reply': Your natural, conversational response (concise, 1-3 sentences).\n"
            "2. 'grammar_check': A brief analysis of the user's last message. If their message has grammatical errors, spelling issues, or awkward phrasing, explain the error and provide a better alternative. If it's perfect, say 'Perfect grammar!' or offer a more advanced/natural way to say the same thing (e.g., 'Tip: You can also say ...'). Keep this analysis under 1-2 sentences."
        )
        
        messages = [
            {
                "role": "system",
                "content": prompt_content
            }
        ]
        
        # Append history to allow context-aware conversation
        for item in history:
            role_type = "user" if item.get('type') == 'user' else "assistant"
            content = item.get('message')
            if content:
                messages.append({
                    "role": role_type,
                    "content": content
                })
                
        response = groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        raw_content = response.choices[0].message.content
        
        import json
        try:
            parsed_response = json.loads(raw_content)
            ai_response = parsed_response.get('reply', '')
            grammar_check = parsed_response.get('grammar_check', '')
        except Exception as je:
            print(f"Error parsing Groq JSON: {je}. Raw: {raw_content}")
            ai_response = raw_content
            grammar_check = ""
            
        # Generate speech for AI response if not skipped
        skip_tts = data.get('skip_tts', False)
        audio_base64 = ''
        audio_url = ''
        success = False
        
        if not skip_tts:
            tts_result = text_to_speech(ai_response)
            audio_base64 = tts_result.get('audio_base64', '')
            audio_url = tts_result.get('audio_url', '')
            success = tts_result.get('success', False)
        
        return jsonify({
            'ai_response': ai_response,
            'grammar_check': grammar_check,
            'audio_data': audio_base64,
            'audio_url': audio_url,
            'success': success
        })
    except Exception as e:
        print(f"Error in conversation_respond: {e}")
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

@app.route('/api/challenges/picture/random', methods=['GET'])
def get_random_picture():
    try:
        url = random.choice(PICTURE_CHALLENGE_IMAGES)
        return jsonify({'image_url': url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/challenges/story/words', methods=['GET'])
def get_story_words():
    try:
        count = random.randint(4, 6)
        words = random.sample(STORY_WORDS, count)
        return jsonify({'words': words})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/challenges/evaluate', methods=['POST'])
def evaluate_challenge():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        challenge_type = data.get('challenge_type')
        spoken_text = data.get('spoken_text', '')
        
        if not user_id or not challenge_type:
            return jsonify({'error': 'Missing user_id or challenge_type'}), 400
            
        # Build evaluation instructions and prompt for Groq depending on the challenge
        if challenge_type == 'jam':
            topic = data.get('topic', 'General')
            prompt = (
                f"You are a professional English speaking coach.\n"
                f"Evaluate the user's spoken response for a 'Just A Minute' (JAM) challenge on the topic: '{topic}'.\n"
                f"The user spoke: \"{spoken_text}\"\n\n"
                "Analyze their fluency, grammar, vocabulary, pronunciation, confidence, and pace.\n"
                "You must return a JSON object with these EXACT keys:\n"
                "1. 'total_score': Integer (overall score /100, award 55-69 for average speaking, 70-84 for good, 85+ for excellent)\n"
                "2. 'fluency_score': Integer (/100)\n"
                "3. 'grammar_score': Integer (/100)\n"
                "4. 'vocabulary_score': Integer (/100)\n"
                "5. 'pronunciation_score': Integer (/100)\n"
                "6. 'confidence_score': Integer (/100)\n"
                "7. 'strengths': List of 3 strings (top 3 strengths)\n"
                "8. 'improvements': List of 3 strings (top 3 areas to improve)\n"
                "9. 'feedback': A realistic AI Review (2-4 sentences explaining why they received this score based on their mistakes)\n"
                "10. 'suggestion': A short personalized suggestion (1-2 sentences) for improvement"
            )
        elif challenge_type == 'picture':
            prompt = (
                f"You are a professional English speaking coach.\n"
                f"Evaluate the user's descriptive speech for a Picture Description challenge.\n"
                f"The user spoke: \"{spoken_text}\"\n\n"
                "Evaluate their fluency, vocabulary richness, grammar, pronunciation, observation skills, and creativity.\n"
                "You must return a JSON object with these EXACT keys:\n"
                "1. 'total_score': Integer (overall score /100)\n"
                "2. 'fluency_score': Integer (/100)\n"
                "3. 'vocabulary_score': Integer (/100)\n"
                "4. 'grammar_score': Integer (/100)\n"
                "5. 'pronunciation_score': Integer (/100)\n"
                "6. 'observation_score': Integer (/100)\n"
                "7. 'creativity_score': Integer (/100)\n"
                "8. 'strengths': List of 3 strings\n"
                "9. 'improvements': List of 3 strings\n"
                "10. 'feedback': A realistic AI Review (2-4 sentences explaining why they received this score)\n"
                "11. 'suggestion': A short personalized suggestion (1-2 sentences) for improvement"
            )
        elif challenge_type == 'story':
            words = data.get('words', [])
            words_str = ", ".join(words)
            prompt = (
                f"You are a professional English speaking coach.\n"
                f"Evaluate the user's creative story built using the target words: [{words_str}].\n"
                f"The user spoke: \"{spoken_text}\"\n\n"
                "Evaluate their creativity, story coherence, grammar, vocabulary, fluency, and check if all target words were used.\n"
                "You must return a JSON object with these EXACT keys:\n"
                "1. 'total_score': Integer (overall score /100)\n"
                "2. 'creativity_score': Integer (/100)\n"
                "3. 'coherence_score': Integer (/100)\n"
                "4. 'grammar_score': Integer (/100)\n"
                "5. 'vocabulary_score': Integer (/100)\n"
                "6. 'fluency_score': Integer (/100)\n"
                "7. 'words_used_status': A string explaining if they successfully used all target words\n"
                "8. 'strengths': List of 3 strings\n"
                "9. 'improvements': List of 3 strings\n"
                "10. 'feedback': A realistic AI Review (2-4 sentences explaining why they received this score)\n"
                "11. 'suggestion': A short personalized suggestion (1-2 sentences) for improvement"
            )
        elif challenge_type == 'roleplay':
            topic = data.get('topic', 'General')
            prompt = (
                f"You are a professional English speaking coach.\n"
                f"Evaluate the user's roleplay conversation in a '{topic}' scenario.\n"
                f"The user spoke: \"{spoken_text}\"\n\n"
                "Evaluate their fluency, grammar, vocabulary, pronunciation, confidence, conversation skills, response relevance, and professionalism.\n"
                "You must return a JSON object with these EXACT keys:\n"
                "1. 'total_score': Integer (overall score /100)\n"
                "2. 'fluency_score': Integer (/100)\n"
                "3. 'grammar_score': Integer (/100)\n"
                "4. 'vocabulary_score': Integer (/100)\n"
                "5. 'pronunciation_score': Integer (/100)\n"
                "6. 'confidence_score': Integer (/100)\n"
                "7. 'conversation_score': Integer (/100)\n"
                "8. 'relevance_score': Integer (/100)\n"
                "9. 'professionalism_score': Integer (/100)\n"
                "10. 'strengths': List of 3 strings\n"
                "11. 'improvements': List of 3 strings\n"
                "12. 'feedback': A realistic AI Review (2-4 sentences explaining why they received this score)\n"
                "13. 'suggestion': A short personalized suggestion (1-2 sentences) for improvement"
            )
        elif challenge_type == 'debate':
            topic = data.get('topic', 'General')
            stance = data.get('stance', 'For')
            prompt = (
                f"You are a professional English speaking coach.\n"
                f"Evaluate the user's debate speech on the topic: '{topic}' (Stance: '{stance}').\n"
                f"The user spoke: \"{spoken_text}\"\n\n"
                "Evaluate their fluency, grammar, vocabulary, logical reasoning, persuasiveness, confidence, and structure of arguments.\n"
                "You must return a JSON object with these EXACT keys:\n"
                "1. 'total_score': Integer (overall score /100)\n"
                "2. 'fluency_score': Integer (/100)\n"
                "3. 'grammar_score': Integer (/100)\n"
                "4. 'vocabulary_score': Integer (/100)\n"
                "5. 'reasoning_score': Integer (/100)\n"
                "6. 'persuasiveness_score': Integer (/100)\n"
                "7. 'confidence_score': Integer (/100)\n"
                "8. 'structure_score': Integer (/100)\n"
                "9. 'strongest_point': A string describing their strongest argument\n"
                "10. 'improvements': List of 3 strings (top 3 areas to improve)\n"
                "11. 'feedback': A realistic AI Review (2-4 sentences explaining why they received this score)\n"
                "12. 'suggestion': A short personalized suggestion (1-2 sentences) for improvement"
            )
        else:
            return jsonify({'error': 'Invalid challenge type'}), 400

        # Request json mode completion from Groq
        response = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        raw_content = response.choices[0].message.content
        parsed = json.loads(raw_content)
        
        # Calculate spoken WPM (Words Per Minute)
        words_count = len(spoken_text.split())
        if challenge_type == 'jam':
            parsed['wpm'] = words_count
        elif challenge_type == 'picture':
            parsed['wpm'] = words_count
        elif challenge_type == 'story':
            parsed['wpm'] = int(words_count / 2)
        else:
            parsed['wpm'] = words_count
            
        # Store challenge submission
        challenge_data = {
            'user_id': user_id,
            'challenge_type': challenge_type,
            'challenge_text': topic if challenge_type in ['jam', 'roleplay', 'debate'] else ('Story Building' if challenge_type == 'story' else 'Picture Description'),
            'spoken_text': spoken_text,
            'evaluation': parsed,
            'timestamp': datetime.now()
        }
        store_data('challenges', challenge_data)
        
        # Update user progress with experience points
        update_user_progress(user_id, parsed.get('total_score', 60))
        
        return jsonify(parsed)
    except Exception as e:
        print(f"Error in evaluate_challenge: {e}")
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
            'average_score': 0,
            'current_streak': 0,
            'longest_streak': 0,
            'last_practice_date': None
        }
    
    progress['experience'] += score
    progress['total_sessions'] += 1
    progress['average_score'] = (progress['average_score'] * (progress['total_sessions'] - 1) + score) / progress['total_sessions']
    
    # Streak tracking logic
    today_str = datetime.now().date().isoformat()
    last_practice_str = progress.get('last_practice_date')
    
    current_streak = progress.get('current_streak', 0)
    longest_streak = progress.get('longest_streak', 0)
    
    if not last_practice_str:
        current_streak = 1
        longest_streak = max(longest_streak, 1)
        progress['last_practice_date'] = today_str
    else:
        try:
            last_practice_date = datetime.fromisoformat(last_practice_str).date()
            today_date = datetime.now().date()
            delta = (today_date - last_practice_date).days
            
            if delta == 1:
                current_streak += 1
                longest_streak = max(longest_streak, current_streak)
                progress['last_practice_date'] = today_str
            elif delta > 1:
                current_streak = 1
                progress['last_practice_date'] = today_str
        except Exception as se:
            print(f"Error parsing streak date: {se}")
            current_streak = 1
            progress['last_practice_date'] = today_str
            
    progress['current_streak'] = current_streak
    progress['longest_streak'] = longest_streak
    
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
        return jsonify({"topics": READING_TOPICS_LIST})
    except Exception as e:
        print(f"Error getting reading topics: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/reading/content/<topic>', methods=['GET'])
def get_reading_content(topic):
    """Get reading content for a specific topic"""
    try:
        topic_item = next((item for item in READING_TOPICS_LIST if item["id"] == topic), None)
        if not topic_item:
            return jsonify({"error": "Topic not found"}), 404
            
        title = topic_item["title"]
        
        if topic in READING_TOPICS:
            paragraphs = READING_TOPICS[topic]["paragraphs"]
        else:
            try:
                prompt = (
                    "You are an expert English teacher.\n"
                    f"Create a reading practice lesson for the topic: '{title}'.\n"
                    "Generate exactly 4 comprehensive, educational paragraphs suitable for reading aloud and learning English.\n"
                    "Each paragraph must be around 60 to 80 words, using clear grammar and engaging sentences.\n"
                    "You must return a JSON object with these EXACT keys:\n"
                    "1. 'title': The title of the reading topic.\n"
                    "2. 'paragraphs': A list of exactly 4 strings (the paragraphs)."
                )
                response = groq_client.chat.completions.create(
                    messages=[{"role": "system", "content": prompt}],
                    model="llama-3.3-70b-versatile",
                    response_format={"type": "json_object"}
                )
                generated = json.loads(response.choices[0].message.content)
                paragraphs = generated.get("paragraphs") or [
                    f"Welcome to reading about {title}. This is the first section of your dynamic study guide.",
                    f"In this second section of {title}, we explore key concepts and practical terms.",
                    f"Moving forward, practicing reading aloud helps build natural speaking cadence.",
                    f"In conclusion, consistent focus on pronunciation builds confidence and accuracy."
                ]
            except Exception as ge:
                print(f"Error generating dynamic reading topic content: {ge}")
                paragraphs = [
                    f"Welcome to reading about {title}. This is the first section of your dynamic study guide.",
                    f"In this second section of {title}, we explore key concepts and practical terms.",
                    f"Moving forward, practicing reading aloud helps build natural speaking cadence.",
                    f"In conclusion, consistent focus on pronunciation builds confidence and accuracy."
                ]
                
        return jsonify({
            "topic": topic,
            "title": title,
            "paragraphs": paragraphs,
            "current_paragraph": 0,
            "audio_data": "",
            "audio_url": "",
            "success": False
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
        print(f"Error occurred in /api/english-tutor: {e}")
        error_message = str(e)
        if "rate_limit_exceeded" in error_message.lower():
            return jsonify({"response": "⚠️ Groq Rate Limit Exceeded. Please try again in a few minutes."})
        elif "authentication" in error_message.lower() or "api_key" in error_message.lower():
            return jsonify({"response": "⚠️ Groq Authentication Error. Please check your API key."})
        else:
            return jsonify({"response": f"⚠️ Groq API Error: {error_message}"})

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    print("User feedback:", data)
    return jsonify({'status': 'received'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(debug=True, host='0.0.0.0', port=port)
