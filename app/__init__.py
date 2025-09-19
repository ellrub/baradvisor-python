"""
BarAdvisor Flask Application
A web application for discovering and rating bars in Bergen with interactive maps
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import folium
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///baradvisor.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Import models after db initialization
from app.models import create_models
Bar, Tag, BarTag, Rating = create_models(db)

# Bergen coordinates for map center
BERGEN_LAT = 60.3913
BERGEN_LON = 5.3221

@app.route('/')
def index():
    """Main page with interactive map"""
    return render_template('index.html')

@app.route('/map')
def get_map():
    """Generate and return the interactive map"""
    # Create map centered on Bergen
    m = folium.Map(
        location=[BERGEN_LAT, BERGEN_LON],
        zoom_start=13,
        tiles='OpenStreetMap'
    )
    
    # Get all bars from database
    bars = Bar.query.all()
    
    for bar in bars:
        # Calculate average rating
        avg_rating = db.session.query(db.func.avg(Rating.rating)).filter_by(bar_id=bar.id).scalar() or 0
        avg_rating = round(avg_rating, 1)
        
        # Get tags for this bar
        tags = [tag.name for tag in bar.tags]
        
        # Create popup content
        popup_content = f"""
        <div style="min-width: 200px;">
            <h4>{bar.name}</h4>
            <p><strong>Description:</strong> {bar.description}</p>
            <p><strong>Address:</strong> {bar.address}</p>
            <p><strong>Rating:</strong> {'⭐' * int(avg_rating)} ({avg_rating}/5)</p>
            <p><strong>Tags:</strong> {', '.join(tags)}</p>
            <button onclick="toggleFavorite({bar.id}, '{bar.name}')" id="fav-btn-{bar.id}">
                ❤️ Add to Favorites
            </button>
            <br><br>
            <button onclick="openRatingModal({bar.id}, '{bar.name}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px;">
                Rate this bar
            </button>
        </div>
        """
        
        # Add marker to map
        folium.Marker(
            location=[bar.latitude, bar.longitude],
            popup=folium.Popup(popup_content, max_width=300),
            tooltip=f"{bar.name} - {avg_rating}⭐",
            icon=folium.Icon(color='red', icon='glass')
        ).add_to(m)
    
    return m._repr_html_()

@app.route('/api/bars')
def api_bars():
    """API endpoint to get all bars with filtering"""
    tag_filter = request.args.get('tags', '')
    min_rating = request.args.get('min_rating', 0, type=float)
    
    query = Bar.query
    
    # Filter by tags if specified
    if tag_filter:
        tag_names = [tag.strip() for tag in tag_filter.split(',')]
        query = query.join(BarTag).join(Tag).filter(Tag.name.in_(tag_names))
    
    bars = query.all()
    
    result = []
    for bar in bars:
        # Calculate average rating
        avg_rating = db.session.query(db.func.avg(Rating.rating)).filter_by(bar_id=bar.id).scalar() or 0
        
        # Skip bars below minimum rating
        if avg_rating < min_rating:
            continue
            
        tags = [tag.name for tag in bar.tags]
        
        result.append({
            'id': bar.id,
            'name': bar.name,
            'description': bar.description,
            'address': bar.address,
            'latitude': bar.latitude,
            'longitude': bar.longitude,
            'avg_rating': round(avg_rating, 1),
            'tags': tags
        })
    
    return jsonify(result)

@app.route('/api/tags')
def api_tags():
    """API endpoint to get all available tags"""
    tags = Tag.query.all()
    return jsonify([{'id': tag.id, 'name': tag.name} for tag in tags])

@app.route('/api/rate', methods=['POST'])
def api_rate():
    """API endpoint to rate a bar"""
    data = request.get_json()
    bar_id = data.get('bar_id')
    rating_value = data.get('rating')
    user_ip = request.remote_addr
    
    if not bar_id or not rating_value:
        return jsonify({'error': 'Missing bar_id or rating'}), 400
    
    if not (1 <= rating_value <= 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    
    # Check if user already rated this bar (simple IP-based check)
    existing_rating = Rating.query.filter_by(bar_id=bar_id, user_identifier=user_ip).first()
    
    if existing_rating:
        existing_rating.rating = rating_value
        existing_rating.created_at = datetime.utcnow()
    else:
        new_rating = Rating(
            bar_id=bar_id,
            rating=rating_value,
            user_identifier=user_ip
        )
        db.session.add(new_rating)
    
    db.session.commit()
    
    # Return updated average rating
    avg_rating = db.session.query(db.func.avg(Rating.rating)).filter_by(bar_id=bar_id).scalar() or 0
    
    return jsonify({
        'success': True,
        'avg_rating': round(avg_rating, 1),
        'message': 'Rating updated successfully'
    })

def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()

def init_sample_data():
    """Initialize database with sample bars in Bergen"""
    with app.app_context():
        # Check if data already exists
        if Bar.query.first():
            return
        
        # Create tags
        tags_data = [
            'Craft Beer', 'Wine Bar', 'Cocktails', 'Live Music', 'Outdoor Seating',
            'Sports Bar', 'Dance Floor', 'Cozy', 'Upscale', 'Casual', 'Food',
            'Late Night', 'Historic', 'Waterfront'
        ]
        
        tags = {}
        for tag_name in tags_data:
            tag = Tag(name=tag_name)
            db.session.add(tag)
            tags[tag_name] = tag
        
        # Sample bars in Bergen with approximate coordinates
        bars_data = [
            {
                'name': 'Garage Bergen',
                'description': 'Popular rock bar with live music and great atmosphere',
                'address': 'Christies gate 6, 5015 Bergen',
                'latitude': 60.3937,
                'longitude': 5.3249,
                'tags': ['Live Music', 'Craft Beer', 'Late Night']
            },
            {
                'name': 'Apollon Platebar',
                'description': 'Upscale cocktail bar with excellent drinks and city views',
                'address': 'Platerstredet 5, 5015 Bergen',
                'latitude': 60.3925,
                'longitude': 5.3251,
                'tags': ['Cocktails', 'Upscale', 'Wine Bar']
            },
            {
                'name': 'Café Opera',
                'description': 'Historic café and bar in a beautiful Art Nouveau building',
                'address': 'Engen 18, 5015 Bergen',
                'latitude': 60.3912,
                'longitude': 5.3242,
                'tags': ['Historic', 'Wine Bar', 'Cozy']
            },
            {
                'name': 'Magic Ice Bar',
                'description': 'Unique ice bar experience with sculptures and drinks',
                'address': 'Georgenes Verft 12, 5011 Bergen',
                'latitude': 60.3969,
                'longitude': 5.3188,
                'tags': ['Cocktails', 'Upscale', 'Late Night']
            },
            {
                'name': 'Ricks Café & Saloon',
                'description': 'American-style bar with burgers and sports',
                'address': 'Veiten 3, 5014 Bergen',
                'latitude': 60.3915,
                'longitude': 5.3265,
                'tags': ['Sports Bar', 'Food', 'Casual']
            },
            {
                'name': 'Biblioteket Bar',
                'description': 'Cozy bar with book-themed décor and craft cocktails',
                'address': 'Georgernes Verft 3, 5011 Bergen',
                'latitude': 60.3962,
                'longitude': 5.3175,
                'tags': ['Cocktails', 'Cozy', 'Craft Beer']
            },
            {
                'name': 'No Stress',
                'description': 'Relaxed bar with outdoor seating and good vibes',
                'address': 'Neumanns gate 2, 5015 Bergen',
                'latitude': 60.3908,
                'longitude': 5.3228,
                'tags': ['Outdoor Seating', 'Casual', 'Craft Beer']
            },
            {
                'name': 'Pingvinen',
                'description': 'Traditional Bergen pub with local character',
                'address': 'Vaskerelven 14, 5014 Bergen',
                'latitude': 60.3889,
                'longitude': 5.3301,
                'tags': ['Historic', 'Casual', 'Food']
            }
        ]
        
        for bar_data in bars_data:
            bar = Bar(
                name=bar_data['name'],
                description=bar_data['description'],
                address=bar_data['address'],
                latitude=bar_data['latitude'],
                longitude=bar_data['longitude']
            )
            db.session.add(bar)
            
            # Add tags to bar
            for tag_name in bar_data['tags']:
                if tag_name in tags:
                    bar_tag = BarTag(bar=bar, tag=tags[tag_name])
                    db.session.add(bar_tag)
        
        db.session.commit()
        print("Sample data initialized!")

if __name__ == '__main__':
    create_tables()
    init_sample_data()
    app.run(debug=True, host='0.0.0.0', port=5001)
