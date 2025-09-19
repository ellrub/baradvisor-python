#!/usr/bin/env python3
"""
BarAdvisor Bergen - Main Application Entry Point
Run this file to start the web application
"""

from app import app, create_tables, init_sample_data

if __name__ == '__main__':
    print("🍺 Starting BarAdvisor Bergen...")
    print("📍 Initializing database and sample data...")
    
    # Create database tables
    create_tables()
    
    # Initialize with sample data
    init_sample_data()
    
    print("✅ Database initialized!")
    print("🚀 Starting web server...")
    print("🌐 Open your browser and go to: http://localhost:5001")
    print("📱 Or on your local network: http://0.0.0.0:5001")
    print("⏹️  Press Ctrl+C to stop the server")
    
    # Start the Flask development server
    app.run(debug=True, host='0.0.0.0', port=5001)
