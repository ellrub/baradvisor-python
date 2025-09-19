# BarAdvisor Bergen 🍺

A web application for discovering and rating bars in Bergen, Norway, with an interactive map interface.

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-v3.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

🗺️ **Interactive Map** - Explore bars in Bergen with an interactive Leaflet map  
🏷️ **Smart Filtering** - Filter bars by tags (craft beer, cocktails, live music, etc.) and ratings  
❤️ **Favorites** - Save your favorite bars to local storage  
⭐ **Rating System** - Rate bars with a 5-star system  
📱 **Responsive Design** - Works seamlessly on desktop and mobile devices  
🎯 **Local Focus** - Curated selection of Bergen's best bars with real coordinates  

## Screenshots

The application features a clean, modern interface with:
- Interactive map showing all bars in Bergen
- Filter panel for tags and ratings
- Favorites management system
- Modal rating interface
- Mobile-responsive design

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ellrub/baradvisor-python.git
   cd baradvisor-python
   ```

2. **Set up virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python run.py
   ```

5. **Open your browser:**
   ```
   http://localhost:5001
   ```

## Detailed Setup

For comprehensive setup instructions, including troubleshooting and deployment options, see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md).

## Technology Stack

- **Backend:** Python Flask with SQLAlchemy ORM
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Database:** SQLite (development), easily configurable for PostgreSQL/MySQL
- **Maps:** Leaflet.js for interactive mapping
- **UI:** Bootstrap 5 for responsive design
- **Icons:** Unicode emojis and symbols

## Project Structure

```
baradvisor-python/
├── app/
│   ├── __init__.py          # Flask application and routes
│   ├── models.py            # Database models (Bar, Rating, Tag)
│   ├── static/
│   │   ├── css/style.css    # Custom styling
│   │   └── js/app.js        # Frontend JavaScript
│   └── templates/
│       └── index.html       # Main HTML template
├── .env                     # Environment configuration
├── requirements.txt         # Python dependencies
├── run.py                  # Application entry point
├── SETUP_INSTRUCTIONS.md   # Detailed setup guide
└── README.md              # This file
```

## API Endpoints

- `GET /` - Main application interface
- `GET /api/bars` - Retrieve bars (supports tag and rating filters)
- `GET /api/tags` - Get all available tags
- `POST /api/rate` - Submit a bar rating

**Example API Usage:**
```bash
# Get all bars
curl http://localhost:5001/api/bars

# Filter bars by tags and rating
curl "http://localhost:5001/api/bars?tags=Craft Beer,Cocktails&min_rating=4"

# Rate a bar
curl -X POST http://localhost:5001/api/rate \
  -H "Content-Type: application/json" \
  -d '{"bar_id": 1, "rating": 5}'
```

## Sample Data

The application includes 8 real bars in Bergen:
- **Garage Bergen** - Rock bar with live music
- **Apollon Platebar** - Upscale cocktail bar with city views
- **Café Opera** - Historic Art Nouveau café
- **Magic Ice Bar** - Unique ice bar experience
- **Ricks Café & Saloon** - American-style sports bar
- **Biblioteket Bar** - Book-themed cocktail bar
- **No Stress** - Relaxed bar with outdoor seating
- **Pingvinen** - Traditional Bergen pub

## Development

### Running in Development Mode
```bash
python run.py
```
The application runs with debug mode enabled, providing automatic reloading and detailed error messages.

### Database Management
The SQLite database is automatically created and populated with sample data on first run. To reset:
```bash
rm baradvisor.db
python run.py
```

### Adding New Bars
Bars can be added programmatically by modifying the `init_sample_data()` function in `app/__init__.py`, or by creating an admin interface (future enhancement).

## Production Deployment

### Using Gunicorn
```bash
gunicorn --bind 0.0.0.0:5001 --workers 4 run:app
```

### Environment Variables
```bash
export SECRET_KEY="your-super-secret-production-key"
export DATABASE_URL="postgresql://user:pass@localhost/baradvisor"
```

### Docker Support (Future Enhancement)
Docker configuration for easy deployment is planned for a future release.

## Network Access

To access the application from other devices on your network:

1. Find your local IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Access from any device on the same network:
   ```
   http://YOUR_IP_ADDRESS:5001
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- 🔐 User authentication and profiles
- 📝 Detailed bar reviews and comments
- 📊 Analytics dashboard for bar owners
- 🔍 Advanced search with autocomplete
- 🌙 Dark mode theme
- 📱 Progressive Web App (PWA) support
- 🐳 Docker containerization
- 🌍 Multi-city support
- 🎉 Events and happy hour information

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Bergen bar data compiled from local knowledge and public sources
- Map tiles provided by OpenStreetMap contributors
- Icons and UI components from Bootstrap and Unicode
- Flask and Python community for excellent documentation

## Support

For setup issues, see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) or open an issue on GitHub.

---

**Built with ❤️ for Bergen's bar scene**

