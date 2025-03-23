from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy # type: ignore
import os
import hashlib
import functools
from datetime import datetime

import subprocess
import os
from ocr_search import ocr_pdf, CourseAnalyzer

from ai import LocalLLM, my_api_key, process_prompt

app = Flask(__name__)
app.secret_key = 'your-secret-key'  # Used for sessions
CORS(app, supports_credentials=True)  # Enable credentials for sessions

# Create the db directory if it doesn't exist
db_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db')
os.makedirs(db_dir, exist_ok=True)

# Database configuration for SQLite
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db', 'database.sqlite')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# User model with all necessary fields
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    major = db.Column(db.String(100))
    emphasis = db.Column(db.String(100))
    gpa = db.Column(db.Float, default=0.0)
    credits_completed = db.Column(db.Integer, default=0)
    current_semester = db.Column(db.Integer, default=1)
    transcript = db.Column(db.Text, default='')
    profile_photo = db.Column(db.String(500), default='/default-profile.jpg') 
    
# Add this function to detect database changes and recreate if needed
def recreate_database():
    with app.app_context():
        # Check if database file exists
        if os.path.exists(db_path):
            try:
                # Test if we can access the profile_photo column
                db.session.execute(db.select(User.profile_photo).limit(1))
                print("Database schema is up-to-date.")
            except Exception as e:
                if "no such column" in str(e):
                    print("Schema has changed. Recreating database...")
                    # Close connections
                    db.session.close_all()
                    # Delete the database file
                    os.remove(db_path)
                    # Create new tables
                    db.create_all()
                    print("Database recreated successfully!")
        else:
            print("Creating new database...")
            db.create_all()

# Move the recreate_database() call inside the app context
with app.app_context():
    db.create_all()
    recreate_database()
    
# Simple password hashing function
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Auth middleware - simplified
def auth_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    # Check required fields
    required_fields = ['email', 'password', 'firstName', 'lastName']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already in use'}), 400
    
    # Hash the password
    password_hash = hash_password(data['password'])
    
    # Create new user
    user = User(
        email=data['email'],
        password_hash=password_hash,
        first_name=data['firstName'],
        last_name=data['lastName'],
        major=data.get('major'),
        emphasis=data.get('emphasis'),
        gpa=data.get('gpa', 0.0),
        credits_completed=data.get('credits_completed', 0),
        current_semester=data.get('current_semester', 1),
        transcript=data.get('transcript', ''),
        profile_photo=data.get('profile_photo', '/default-profile.jpg')  # Set default profile photo
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # Set user in session
        session['user_id'] = user.id
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'firstName': user.first_name,
                'lastName': user.last_name
            }
        })
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Log in a user"""
    data = request.json
    
    # Check required fields
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Verify password
    if user.password_hash != hash_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Set user in session
    session['user_id'] = user.id
    
    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'firstName': user.first_name,
            'lastName': user.last_name
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Log out a user by clearing session"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/auth/me', methods=['GET'])
@auth_required
def get_current_user():
    """Get current user info using session"""
    user = User.query.get(session['user_id'])
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'major': user.major,
        'emphasis': user.emphasis,
        'gpa': user.gpa,
        'credits_completed': user.credits_completed,
        'current_semester': user.current_semester,
        'profile_photo': user.profile_photo  # Added to the response
    })

# User data routes
@app.route('/api/users/<user_id>', methods=['GET'])
@auth_required
def get_user_by_id(user_id):
    # Only allow accessing own user data
    if str(session['user_id']) != str(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get(user_id)
    
    if not user:
        # Return empty data if user doesn't exist yet
        return jsonify({
            'id': user_id,
            'email': None,
            'major': None,
            'emphasis': None,
            'gpa': 0.0,
            'credits_completed': 0,
            'current_semester': 1,
            'transcript': '',
            'firstName': None,
            'lastName': None,
            'profile_photo': '/default-profile.jpg'  # Added default profile photo
        })
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'major': user.major,
        'emphasis': user.emphasis,
        'gpa': user.gpa,
        'credits_completed': user.credits_completed,
        'current_semester': user.current_semester,
        'transcript': user.transcript,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'profile_photo': user.profile_photo  # Added to the response
    })

@app.route('/api/users', methods=['POST'])
@auth_required
def create_or_update_user():
    """Create or update user data"""
    data = request.json
    
    # Ensure we're updating the authenticated user
    user_id = session['user_id']
    
    # Check if user exists
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Update user fields
    if 'email' in data:
        user.email = data['email']
    if 'major' in data:
        user.major = data['major']
    if 'emphasis' in data:
        user.emphasis = data['emphasis']
    if 'gpa' in data:
        user.gpa = data['gpa']
    if 'credits_completed' in data:
        user.credits_completed = data['credits_completed']
    if 'current_semester' in data:
        user.current_semester = data['current_semester']
    if 'transcript' in data:
        user.transcript = data['transcript']
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
    if 'profile_photo' in data:  # Added handling for profile photo updates
        user.profile_photo = data['profile_photo']
    
    try:
        db.session.commit()
        return jsonify({
            "message": "User data saved successfully",
            "id": user.id
        })
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompt', methods=['POST'])
def promptLLM():
    data = request.json
    prompt_text = data.get('prompt', '')
    
    # Call the AI processing function from ai.py
    result = process_prompt(prompt_text)
    
    # Return the response
    return jsonify(result)

# Route to handle file uploading and AI processing of the uploaded PDF, first through ocr in the ocr_search.py file and then take that txt output and put that through the AI model
@app.route('/api/upload', methods=['GET'])
def upload():
    # Define file paths
    pdf_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'OfficialTranscript.pdf')
    txt_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'OfficialTranscript.txt')
    requirements_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'json', 'requirementsDB.json')
    
    # No need to handle the uploaded file - just use the local file
    # The upload from the frontend is just for show
    print(f"[INFO] Using local PDF file: {pdf_path}")
    
    # Check if requirements file exists
    if not os.path.exists(requirements_path):
        requirements_path = None
    
    try:
        # 1. Run OCR using bash command
        cmd = f"python3 ocr_search.py -i {pdf_path} -o {txt_path}"
        print(f"[INFO] Running command: {cmd}")
        process = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if process.returncode != 0:
            print(f"[ERROR] OCR process failed: {process.stderr}")
            return jsonify({
                'success': False,
                'error': f"OCR process failed: {process.stderr}"
            }), 500
        
        # 2. Read the output text file
        with open(txt_path, 'r', encoding='utf-8') as f:
            transcript_text = f.read()
        
        # 3. Analyze the extracted text 
        analyzer = CourseAnalyzer(requirements_json=requirements_path)
        completed_courses = analyzer.extract_courses_from_text(transcript_text)
        
        # 4. Get GPA information
        gpa_info = analyzer.extract_gpa(transcript_text)
        
        # 5. Process the transcript through the AI model
        ai_prompt = f"""
        I'm analyzing a student transcript. Here's what I found:
        
        Courses completed: {', '.join(completed_courses)}
        
        GPA information: {gpa_info}
        
        Based on this information, provide a summary of the student's academic progress, 
        recommendations for future courses, and insights about their academic path.
        """
        
        ai_result = process_prompt(ai_prompt)
        
        # 6. Return combined results
        return jsonify({
            'success': True,
            'ocr_results': {
                'courses': list(completed_courses),
                'gpa_info': gpa_info
            },
            'ai_analysis': ai_result,
            'transcript_text': transcript_text[:500] + "..." if len(transcript_text) > 500 else transcript_text
        })
        
    except Exception as e:
        print(f"Error processing transcript: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)