// BarAdvisor Bergen - Ultra Modern 2025 JavaScript

// Enhanced Global State Management
class BarAdvisorApp {
    constructor() {
        this.map = null;
        this.currentMarkers = [];
        this.allBars = [];
        this.allTags = [];
        this.favorites = this.getFavorites();
        this.currentRating = {
            barId: null,
            barName: null
        };
        
        // Bergen coordinates
        this.bergenCoords = [60.3913, 5.3221];
        
        // Storage keys
        this.storageKeys = {
            favorites: 'baradvisor_favorites_v2',
            settings: 'baradvisor_settings_v2'
        };
        
        // Animation timings
        this.animations = {
            fast: 150,
            base: 250,
            slow: 350
        };
    }

    // Initialize the entire application
    async init() {
        console.log('🍺 Initializing BarAdvisor Bergen 2025...');
        
        try {
            await this.initializeMap();
            await this.loadTags();
            await this.loadBars();
            this.setupEventListeners();
            this.updateFavoritesDisplay();
            
            // Add smooth reveal animation
            this.animateAppearance();
            
            console.log('✨ App initialization complete!');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showAlert('Failed to load the application. Please refresh the page.', 'error');
        }
    }

    // Initialize ultra-modern map
    async initializeMap() {
        this.map = L.map('map', {
            center: this.bergenCoords,
            zoom: 13,
            zoomControl: false,
            attributionControl: false,
            preferCanvas: true
        });
        
        // Add modern tile layer with enhanced styling
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            className: 'map-tiles'
        }).addTo(this.map);
        
        // Add custom zoom control
        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);
        
        // Add scale control
        L.control.scale({
            position: 'bottomleft'
        }).addTo(this.map);
        
        console.log('🗺️ Modern map initialized');
    }

    // Load tags with caching
    async loadTags() {
        try {
            const response = await fetch('/api/tags');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.allTags = await response.json();
            this.populateTagFilter();
            
            console.log(`🏷️ Loaded ${this.allTags.length} tags`);
        } catch (error) {
            console.error('Error loading tags:', error);
            this.showAlert('Failed to load bar categories. Some features may be limited.', 'warning');
        }
    }

    // Populate tag filter with enhanced UX
    populateTagFilter() {
        const tagFilter = document.getElementById('tagFilter');
        if (!tagFilter) return;
        
        tagFilter.innerHTML = '';
        
        this.allTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.name;
            option.textContent = `${this.getTagEmoji(tag.name)} ${tag.name}`;
            tagFilter.appendChild(option);
        });
    }

    // Get emoji for tag categories
    getTagEmoji(tagName) {
        const emojiMap = {
            'Craft Beer': '🍺',
            'Wine Bar': '🍷',
            'Cocktails': '🍸',
            'Live Music': '🎵',
            'Outdoor Seating': '🌿',
            'Sports Bar': '⚽',
            'Dance Floor': '💃',
            'Cozy': '🔥',
            'Upscale': '✨',
            'Casual': '😊',
            'Food': '🍕',
            'Late Night': '🌙',
            'Historic': '🏛️',
            'Waterfront': '🌊'
        };
        return emojiMap[tagName] || '🍻';
    }

    // Load bars with advanced filtering
    async loadBars(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            if (filters.tags?.length > 0) {
                params.append('tags', filters.tags.join(','));
            }
            
            if (filters.min_rating > 0) {
                params.append('min_rating', filters.min_rating);
            }
            
            const url = '/api/bars' + (params.toString() ? '?' + params.toString() : '');
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.allBars = await response.json();
            this.displayBarsOnMap();
            
            console.log(`📍 Loaded ${this.allBars.length} bars`);
        } catch (error) {
            console.error('Error loading bars:', error);
            this.showAlert('Failed to load bars. Please try refreshing the map.', 'warning');
        }
    }

    // Display bars with enhanced markers
    displayBarsOnMap() {
        // Clear existing markers with animation
        this.currentMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.currentMarkers = [];
        
        this.allBars.forEach(bar => {
            const isFavorite = this.isFavoriteBar(bar.id);
            const marker = this.createAdvancedMarker(bar, isFavorite);
            this.currentMarkers.push(marker);
        });
    }

    // Create advanced marker with custom popup
    createAdvancedMarker(bar, isFavorite) {
        // Custom icon based on rating and favorite status
        const iconColor = isFavorite ? 'red' : this.getMarkerColor(bar.avg_rating);
        const starRating = this.generateStarRating(bar.avg_rating);
        
        const popupContent = `
            <div style="min-width: 280px; font-family: 'Inter', sans-serif;">
                <div style="margin-bottom: 1rem;">
                    <h5 style="margin: 0 0 0.5rem 0; color: white; font-weight: 600;">${bar.name}</h5>
                    <p style="margin: 0 0 0.5rem 0; color: rgba(255,255,255,0.8); font-size: 0.875rem;">${bar.description}</p>
                    <p style="margin: 0 0 0.5rem 0; color: rgba(255,255,255,0.7); font-size: 0.8rem;">📍 ${bar.address}</p>
                    <div style="margin: 0.75rem 0;">
                        <span style="color: #f59e0b; font-size: 1.1rem;">${starRating}</span>
                        <span style="color: rgba(255,255,255,0.8); font-size: 0.875rem; margin-left: 0.5rem;">(${bar.avg_rating}/5)</span>
                    </div>
                    <div style="margin: 0.5rem 0;">
                        ${bar.tags.map(tag => `<span style="
                            background: rgba(59, 130, 246, 0.2); 
                            color: #3b82f6; 
                            padding: 0.25rem 0.5rem; 
                            border-radius: 1rem; 
                            font-size: 0.75rem; 
                            margin-right: 0.25rem;
                            border: 1px solid rgba(59, 130, 246, 0.3);
                        ">${this.getTagEmoji(tag)} ${tag}</span>`).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button 
                        onclick="app.toggleFavorite(${bar.id}, '${bar.name.replace(/'/g, "\\'")}')" 
                        style="
                            flex: 1;
                            padding: 0.5rem 1rem;
                            background: ${isFavorite ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255, 255, 255, 0.1)'};
                            color: white;
                            border: 1px solid ${isFavorite ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'};
                            border-radius: 0.75rem;
                            font-size: 0.875rem;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        "
                        onmouseover="this.style.transform='scale(1.02)'"
                        onmouseout="this.style.transform='scale(1)'"
                    >
                        ${isFavorite ? '💔 Remove' : '❤️ Favorite'}
                    </button>
                    <button 
                        onclick="app.openRatingModal(${bar.id}, '${bar.name.replace(/'/g, "\\'")}')" 
                        style="
                            flex: 1;
                            padding: 0.5rem 1rem;
                            background: linear-gradient(135deg, #f59e0b, #d97706);
                            color: white;
                            border: none;
                            border-radius: 0.75rem;
                            font-size: 0.875rem;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        "
                        onmouseover="this.style.transform='scale(1.02)'"
                        onmouseout="this.style.transform='scale(1)'"
                    >
                        ⭐ Rate Bar
                    </button>
                </div>
            </div>
        `;
        
        const marker = L.marker([bar.latitude, bar.longitude], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `
                    <div style="
                        width: 24px;
                        height: 24px;
                        background: linear-gradient(135deg, ${iconColor}, ${this.darkenColor(iconColor)});
                        border: 2px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                    ">
                        ${isFavorite ? '❤️' : '🍺'}
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        });
        
        marker.bindPopup(popupContent, { 
            maxWidth: 320,
            className: 'modern-popup'
        });
        
        marker.addTo(this.map);
        
        return marker;
    }

    // Generate star rating display
    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '⭐'.repeat(fullStars) + 
               (hasHalfStar ? '⭐' : '') + 
               '☆'.repeat(emptyStars);
    }

    // Get marker color based on rating
    getMarkerColor(rating) {
        if (rating >= 4.5) return '#10b981';      // Emerald
        if (rating >= 4.0) return '#3b82f6';      // Blue
        if (rating >= 3.5) return '#f59e0b';      // Amber
        if (rating >= 3.0) return '#ef4444';      // Red
        return '#6b7280';                          // Gray
    }

    // Darken color helper
    darkenColor(color) {
        // Simple color darkening
        const colorMap = {
            '#10b981': '#059669',
            '#3b82f6': '#2563eb',
            '#f59e0b': '#d97706',
            '#ef4444': '#dc2626',
            '#6b7280': '#4b5563'
        };
        return colorMap[color] || color;
    }

    // Enhanced filter application
    applyFilters() {
        const tagFilter = document.getElementById('tagFilter');
        const ratingFilter = document.getElementById('ratingFilter');
        
        const selectedTags = Array.from(tagFilter.selectedOptions).map(option => option.value);
        const minRating = parseFloat(ratingFilter.value);
        
        const filters = {
            tags: selectedTags,
            min_rating: minRating
        };
        
        this.loadBars(filters);
        
        const filterText = this.generateFilterText(selectedTags, minRating);
        this.showAlert(`🔍 ${filterText}`, 'info');
    }

    // Generate filter description
    generateFilterText(tags, minRating) {
        const parts = [];
        
        if (tags.length > 0) {
            parts.push(`${tags.length} tag${tags.length > 1 ? 's' : ''}`);
        }
        
        if (minRating > 0) {
            parts.push(`${minRating}⭐+ rating`);
        }
        
        if (parts.length === 0) {
            return `Found ${this.allBars.length} bars`;
        }
        
        return `Filtered by ${parts.join(' & ')} • Found ${this.allBars.length} bars`;
    }

    // Clear all filters
    clearFilters() {
        document.getElementById('tagFilter').selectedIndex = -1;
        document.getElementById('ratingFilter').value = '0';
        this.loadBars();
        this.showAlert('🔄 Filters cleared! Showing all bars.', 'success');
    }

    // Refresh map
    refreshMap() {
        this.loadBars();
        this.showAlert('🔄 Map refreshed!', 'success');
    }

    // Advanced favorites management
    getFavorites() {
        try {
            const favorites = localStorage.getItem(this.storageKeys.favorites);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem(this.storageKeys.favorites, JSON.stringify(this.favorites));
            this.updateFavoritesDisplay();
        } catch (error) {
            console.error('Error saving favorites:', error);
            this.showAlert('Failed to save favorites.', 'warning');
        }
    }

    isFavoriteBar(barId) {
        return this.favorites.some(fav => fav.id === barId);
    }

    toggleFavorite(barId, barName) {
        const existingIndex = this.favorites.findIndex(fav => fav.id === barId);
        
        if (existingIndex !== -1) {
            this.favorites.splice(existingIndex, 1);
            this.showAlert(`💔 ${barName} removed from favorites`, 'info');
        } else {
            this.favorites.push({
                id: barId,
                name: barName,
                added_at: new Date().toISOString()
            });
            this.showAlert(`❤️ ${barName} added to favorites!`, 'success');
        }
        
        this.saveFavorites();
        this.displayBarsOnMap(); // Refresh to update marker colors
    }

    updateFavoritesDisplay() {
        // Update counters
        const count = this.favorites.length;
        document.getElementById('favorites-count').textContent = count;
        const mobileCount = document.getElementById('favorites-count-mobile');
        if (mobileCount) mobileCount.textContent = count;
        
        // Update sidebar list
        this.updateSidebarFavorites();
    }

    updateSidebarFavorites() {
        const favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) return;
        
        if (this.favorites.length === 0) {
            favoritesList.innerHTML = `
                <p style="color: rgba(255,255,255,0.7); text-align: center; padding: 2rem 0; font-size: 0.875rem;">
                    No favorites yet! 💙<br>
                    Tap the ❤️ on bars to save them.
                </p>
            `;
            return;
        }
        
        favoritesList.innerHTML = this.favorites.map(fav => `
            <div class="favorite-item" onclick="app.focusOnBar(${fav.id})">
                <h6>${fav.name}</h6>
                <small>Added ${new Date(fav.added_at).toLocaleDateString()}</small>
                <button 
                    style="
                        position: absolute;
                        top: 0.5rem;
                        right: 0.5rem;
                        background: rgba(239, 68, 68, 0.2);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        color: #ef4444;
                        border-radius: 0.375rem;
                        padding: 0.25rem 0.5rem;
                        font-size: 0.75rem;
                        cursor: pointer;
                    "
                    onclick="event.stopPropagation(); app.removeFavorite(${fav.id})"
                >
                    Remove
                </button>
            </div>
        `).join('');
    }

    removeFavorite(barId) {
        const bar = this.favorites.find(fav => fav.id === barId);
        if (bar) {
            this.favorites = this.favorites.filter(fav => fav.id !== barId);
            this.saveFavorites();
            this.displayBarsOnMap();
            this.showAlert(`💔 ${bar.name} removed from favorites`, 'info');
        }
    }

    clearFavorites() {
        if (this.favorites.length === 0) {
            this.showAlert('No favorites to clear!', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear all favorites?')) {
            this.favorites = [];
            this.saveFavorites();
            this.displayBarsOnMap();
            this.showAlert('🗑️ All favorites cleared!', 'success');
        }
    }

    focusOnBar(barId) {
        const bar = this.allBars.find(b => b.id === barId);
        if (!bar) return;
        
        this.map.setView([bar.latitude, bar.longitude], 16, {
            animate: true,
            duration: 1
        });
        
        // Find and open popup
        const marker = this.currentMarkers.find(m => 
            m.getLatLng().lat === bar.latitude && m.getLatLng().lng === bar.longitude
        );
        
        if (marker) {
            setTimeout(() => marker.openPopup(), 500);
        }
    }

    showFavorites() {
        this.updateFavoritesModalDisplay();
        const modal = new bootstrap.Modal(document.getElementById('favoritesModal'));
        modal.show();
    }

    updateFavoritesModalDisplay() {
        const modalList = document.getElementById('favorites-modal-list');
        if (!modalList) return;
        
        if (this.favorites.length === 0) {
            modalList.innerHTML = `
                <div style="text-align: center; padding: 3rem 0; color: rgba(255,255,255,0.7);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">❤️</div>
                    <h4 style="color: white; margin-bottom: 0.5rem;">No favorites yet!</h4>
                    <p>Start exploring and save your favorite bars.</p>
                </div>
            `;
            return;
        }
        
        modalList.innerHTML = this.favorites.map(fav => {
            const bar = this.allBars.find(b => b.id === fav.id);
            const barInfo = bar ? `
                <small style="color: rgba(255,255,255,0.7); display: block;">
                    Rating: ${bar.avg_rating}⭐ • ${bar.tags.slice(0, 2).join(', ')}
                </small>
                <small style="color: rgba(255,255,255,0.6); display: block; margin-top: 0.25rem;">
                    📍 ${bar.address}
                </small>
            ` : '';
            
            return `
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                ">
                    <h5 style="color: white; margin: 0 0 0.5rem 0; font-weight: 600;">${fav.name}</h5>
                    ${barInfo}
                    <small style="color: rgba(255,255,255,0.6); display: block; margin-top: 0.75rem;">
                        Added ${new Date(fav.added_at).toLocaleDateString()}
                    </small>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button 
                            class="btn btn-primary btn-sm" 
                            onclick="app.focusOnBar(${fav.id}); bootstrap.Modal.getInstance(document.getElementById('favoritesModal')).hide();"
                        >
                            📍 View on Map
                        </button>
                        <button 
                            class="btn btn-secondary btn-sm" 
                            onclick="app.removeFavorite(${fav.id})"
                        >
                            💔 Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Enhanced rating system
    openRatingModal(barId, barName) {
        this.currentRating.barId = barId;
        this.currentRating.barName = barName;
        
        document.getElementById('rating-bar-name').textContent = barName;
        document.getElementById('rating-feedback').innerHTML = '';
        
        // Reset stars
        document.querySelectorAll('.modal-stars').forEach(star => {
            star.classList.remove('active');
        });
        
        const modal = new bootstrap.Modal(document.getElementById('ratingModal'));
        modal.show();
    }

    async submitRating() {
        const selectedStar = document.querySelector('.modal-stars.active:last-of-type');
        if (!selectedStar) {
            this.showAlert('Please select a rating first! ⭐', 'warning');
            return;
        }
        
        const rating = parseInt(selectedStar.dataset.rating);
        const feedbackEl = document.getElementById('rating-feedback');
        
        // Show loading state
        feedbackEl.innerHTML = `
            <div style="text-align: center; color: rgba(255,255,255,0.8);">
                <div class="loading" style="margin: 0 auto 1rem;"></div>
                <p>Submitting your rating...</p>
            </div>
        `;
        
        try {
            const response = await fetch('/api/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bar_id: this.currentRating.barId,
                    rating: rating
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                feedbackEl.innerHTML = `
                    <div style="
                        background: rgba(16, 185, 129, 0.2);
                        border: 1px solid rgba(16, 185, 129, 0.3);
                        color: #10b981;
                        padding: 1rem;
                        border-radius: 0.75rem;
                        text-align: center;
                    ">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✨</div>
                        <strong>Rating submitted!</strong><br>
                        New average: ${result.avg_rating}⭐
                    </div>
                `;
                
                // Auto-close and refresh
                setTimeout(() => {
                    this.loadBars();
                    bootstrap.Modal.getInstance(document.getElementById('ratingModal')).hide();
                }, 2000);
            } else {
                throw new Error(result.error || 'Failed to submit rating');
            }
        } catch (error) {
            console.error('Rating submission error:', error);
            feedbackEl.innerHTML = `
                <div style="
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    text-align: center;
                ">
                    <strong>Error!</strong><br>
                    ${error.message || 'Please try again.'}
                </div>
            `;
        }
    }

    // Enhanced event listeners
    setupEventListeners() {
        // Star rating interactions
        document.querySelectorAll('.modal-stars').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.setStarRating(rating);
            });
            
            star.addEventListener('mouseover', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.previewStarRating(rating);
            });
        });
        
        // Reset star preview on mouse leave
        document.getElementById('star-rating').addEventListener('mouseleave', () => {
            this.resetStarPreview();
        });
        
        console.log('🎯 Event listeners configured');
    }

    setStarRating(rating) {
        document.querySelectorAll('.modal-stars').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    previewStarRating(rating) {
        document.querySelectorAll('.modal-stars').forEach((star, index) => {
            star.style.color = index < rating ? '#f59e0b' : 'rgba(255,255,255,0.3)';
        });
    }

    resetStarPreview() {
        document.querySelectorAll('.modal-stars').forEach(star => {
            if (star.classList.contains('active')) {
                star.style.color = '#f59e0b';
            } else {
                star.style.color = 'rgba(255,255,255,0.3)';
            }
        });
    }

    // Advanced alert system
    showAlert(message, type = 'info', duration = 4000) {
        const alertEl = document.createElement('div');
        const icons = {
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌'
        };
        
        alertEl.className = `alert alert-${type}`;
        alertEl.innerHTML = `
            <span style="margin-right: 0.5rem;">${icons[type] || 'ℹ️'}</span>
            <span>${message}</span>
            <button type="button" style="
                background: none;
                border: none;
                color: inherit;
                margin-left: auto;
                cursor: pointer;
                opacity: 0.7;
            " onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(alertEl);
        
        // Auto-remove
        setTimeout(() => {
            if (alertEl.parentNode) {
                alertEl.style.transform = 'translateX(100%)';
                setTimeout(() => alertEl.remove(), 300);
            }
        }, duration);
    }

    // App appearance animation
    animateAppearance() {
        // Stagger animations for smooth appearance
        const elements = document.querySelectorAll('.fade-in');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Initialize global app instance
const app = new BarAdvisorApp();

// Global function wrappers for onclick handlers
window.toggleFavorite = (barId, barName) => app.toggleFavorite(barId, barName);
window.openRatingModal = (barId, barName) => app.openRatingModal(barId, barName);
window.submitRating = () => app.submitRating();
window.applyFilters = () => app.applyFilters();
window.clearFilters = () => app.clearFilters();
window.refreshMap = () => app.refreshMap();
window.showFavorites = () => app.showFavorites();
window.clearFavorites = () => app.clearFavorites();
window.focusOnBar = (barId) => app.focusOnBar(barId);
window.removeFavorite = (barId) => app.removeFavorite(barId);

// Initialize app when DOM is ready
function initializeApp() {
    app.init();
}

// Add global app reference for debugging
window.app = app;
