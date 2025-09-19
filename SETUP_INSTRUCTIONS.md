# BarAdvisor Bergen - AI Setup Instructions

This document provides step-by-step instructions for an AI assistant to set up the BarAdvisor Bergen web application on a new computer after cloning the repository.

## Prerequisites Check

Before starting, verify these are available on the target system:
- Python 3.8 or higher
- Git (for cloning)
- Web browser for testing

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/ellrub/baradvisor-python.git
cd baradvisor-python
```

### 2. Set Up Python Virtual Environment

**For Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**For macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Create a `.env` file if it doesn't exist:
```bash
# Create .env file with default configuration
echo "SECRET_KEY=your-super-secret-key-change-this-in-production" > .env
echo "DATABASE_URL=sqlite:///baradvisor.db" >> .env
```

### 5. Initialize Database and Run Application
```bash
python run.py
```

### 6. Verify Installation
- The application should start and display startup messages
- Database will be automatically created with sample data
- Server will run on http://localhost:5001 by default

### 7. Test the Application
Open a web browser and navigate to:
- Local access: http://localhost:5001
- Network access: http://YOUR_IP_ADDRESS:5001

## Expected Features

After successful setup, the application should provide:

1. **Interactive Map**: Shows bars in Bergen with markers
2. **Filtering System**: Filter bars by tags and minimum rating
3. **Favorites**: Save favorite bars to local storage
4. **Rating System**: Rate bars with 1-5 stars
5. **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
baradvisor-python/
├── app/
│   ├── __init__.py          # Main Flask application
│   ├── models.py            # Database models
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css    # Custom styling
│   │   └── js/
│   │       └── app.js       # Frontend JavaScript
│   └── templates/
│       └── index.html       # Main HTML template
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── requirements.txt         # Python dependencies
├── run.py                  # Application entry point
└── README.md               # Project documentation
```

## Sample Data Included

The application automatically creates sample bars in Bergen:
- Garage Bergen (Rock bar with live music)
- Apollon Platebar (Upscale cocktail bar)
- Café Opera (Historic café in Art Nouveau building)
- Magic Ice Bar (Unique ice bar experience)
- Ricks Café & Saloon (American-style sports bar)
- Biblioteket Bar (Book-themed cocktail bar)
- No Stress (Relaxed bar with outdoor seating)
- Pingvinen (Traditional Bergen pub)

## Troubleshooting

### Common Issues and Solutions:

1. **Port 5001 already in use:**
   ```bash
   # Change port in run.py, line ~20
   app.run(debug=True, host='0.0.0.0', port=5002)
   ```

2. **Permission denied on macOS/Linux:**
   ```bash
   # Make run.py executable
   chmod +x run.py
   ```

3. **ModuleNotFoundError:**
   ```bash
   # Ensure virtual environment is activated
   source .venv/bin/activate  # macOS/Linux
   .venv\Scripts\activate     # Windows
   
   # Reinstall dependencies
   pip install -r requirements.txt
   ```

4. **Database issues:**
   ```bash
   # Delete existing database and restart
   rm baradvisor.db
   python run.py
   ```

## Development Mode

The application runs in debug mode by default, which provides:
- Automatic reloading on code changes
- Detailed error messages
- Debug toolbar in browser

## Production Deployment

For production deployment:

1. **Update .env file:**
   ```
   SECRET_KEY=generate-a-strong-secret-key-here
   DATABASE_URL=your-production-database-url
   ```

2. **Use Gunicorn:**
   ```bash
   gunicorn --bind 0.0.0.0:5001 --workers 4 run:app
   ```

3. **Set up reverse proxy (nginx/Apache)**
4. **Configure HTTPS**
5. **Set up proper database (PostgreSQL/MySQL)**

## API Endpoints

The application provides these API endpoints:
- `GET /` - Main application page
- `GET /api/bars` - Get all bars (supports filtering)
- `GET /api/tags` - Get all available tags
- `POST /api/rate` - Submit a bar rating

## Technology Stack

- **Backend**: Python Flask
- **Database**: SQLAlchemy with SQLite (development)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Maps**: Leaflet.js
- **UI Framework**: Bootstrap 5
- **Icons**: Unicode emojis and symbols

## Security Notes

- Uses session-based CSRF protection
- IP-based rating limitation
- Environment variables for sensitive data
- Input validation on all forms

## Browser Compatibility

Tested and compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Permissions

Ensure these files are executable:
- `run.py` (application entry point)

Ensure these directories are writable:
- Root directory (for SQLite database)
- `app/static/` (for any generated files)

## Success Verification Checklist

After setup, verify these features work:
- [ ] Map loads with Bergen centered
- [ ] Bar markers appear on map
- [ ] Clicking markers shows popup with bar details
- [ ] Filter by tags works
- [ ] Filter by rating works
- [ ] Adding favorites works (check browser local storage)
- [ ] Rating bars works (star selection and submission)
- [ ] Responsive design works on mobile
- [ ] All console errors resolved

## Support

If issues persist after following these instructions:
1. Check the terminal output for specific error messages
2. Verify all dependencies installed correctly
3. Ensure Python version compatibility (3.8+)
4. Check file permissions and directory structure
5. Verify network connectivity for external resources (Bootstrap CDN, etc.)

## Additional Notes for AI Assistants

When setting up this project:
1. Always activate the virtual environment before installing packages
2. Pay attention to the operating system (Windows vs macOS/Linux commands)
3. If port conflicts occur, modify the port number in `run.py`
4. The database is automatically created - no manual SQL needed
5. All static files are served by Flask - no separate web server required for development
6. The application is designed to work offline except for map tiles
