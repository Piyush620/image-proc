from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from PIL import Image, ImageEnhance, ImageFilter, UnidentifiedImageError
import os
import io
import base64
from concurrent.futures import ThreadPoolExecutor
# Initialize Flask App
app = Flask(__name__)
CORS(app)
# MongoDB Configuration
client = MongoClient('mongodb+srv://arth1234samepass:arth1234@cluster0.pdgx6ns.mongodb.net/?retryWrites=true&w=majority')
db = client['Xray']
users_collection = db['User']
xraydata_collection = db['xraydata']
# Helper Function to Encode Images to Base64
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
def encode_image(image):
    """Convert PIL Image to Base64 string."""
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def open_image(file):
    """Attempt to open and decode the image."""
    try:
        return Image.open(file).convert('RGB')
    except UnidentifiedImageError:
        raise ValueError("Uploaded file is not a valid image.")

# Image processing tasks
def convert_to_grayscale(image):
    return image.convert("L")

def increase_contrast(image):
    enhancer = ImageEnhance.Contrast(image)
    return enhancer.enhance(2.0)

def detect_edges(image):
    return image.filter(ImageFilter.FIND_EDGES)

def blur_image(image):
    return image.filter(ImageFilter.BLUR)

# Route to handle image processing
@app.route('/process-image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'status': 'fail', 'message': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'status': 'fail', 'message': 'Invalid image file'}), 400

    try:
        input_image = open_image(file)
    except ValueError as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 400

    tags = request.form.getlist('tags')
    results = []

    tasks = {
        'greyscale': convert_to_grayscale,
        'contrast': increase_contrast,
        'edges': detect_edges,
        'blur': blur_image,
    }

    with ThreadPoolExecutor() as executor:
        futures = {tag: executor.submit(tasks[tag], input_image) for tag in tags if tag in tasks}
        for tag, future in futures.items():
            try:
                processed_image = future.result()
                encoded_image = encode_image(processed_image)
                results.append({
                    'title': f'{tag.capitalize()} Image',
                    'description': f'This is the {tag} version of the uploaded image.',
                    'image': encoded_image
                })
            except Exception as e:
                results.append({
                    'title': f'Error processing {tag}',
                    'description': str(e),
                    'image': None
                })

    return jsonify({'status': 'success', 'images': results}), 200

# Routes
@app.route('/', methods=['GET'])
def index():
    return jsonify({'status': 'success', 'message': 'App running successfully'}), 200

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data['email']
    password = generate_password_hash(data['password'], method='sha256')

    if users_collection.find_one({'email': email}):
        return jsonify({'status': 'fail', 'message': 'User already exists'}), 400

    users_collection.insert_one({'email': email, 'password': password})
    return jsonify({'status': 'success', 'message': 'User created successfully'}), 201

@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    user = users_collection.find_one({'email': data['email']})
    
    if user and check_password_hash(user['password'], data['password']):
        return jsonify({'status': 'success', 'message': 'Logged in successfully'}), 200
    return jsonify({'status': 'fail', 'message': 'Invalid email or password'}), 401

@app.route('/getusers', methods=['GET'])
def get_users():
    users = users_collection.find()
    user_list = [{'id': str(user['_id']), 'email': user['email']} for user in users]
    return jsonify({'status': 'success', 'data': user_list}), 200
# @app.route('/process-image', methods=['POST'])
# def process_image():
#     if 'image' not in request.files:
#         return jsonify({'status': 'fail', 'message': 'No image provided'}), 400
#     image = Image.open(request.files['image'])
#     tags = request.form.getlist('tags')
#     processed_images = process_image(image, tags)
#     return jsonify({'status': 'success', 'images': processed_images}), 200
if __name__ == '__main__':
    app.run(debug=True)