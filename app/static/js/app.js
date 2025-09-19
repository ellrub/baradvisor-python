// BarAdvisor Bergen - Main JavaScript Application

// Global variables
let map;
let currentMarkers = [];
let allBars = [];
let allTags = [];
let currentRatingBarId = null;
let currentRatingBarName = null;

// Bergen coordinates
const BERGEN_LAT = 60.3913;
const BERGEN_LON = 5.3221;

// Local storage keys
const FAVORITES_KEY = 'baradvisor_favorites';

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Initializing BarAdvisor Bergen...');
    initializeMap();
    loadTags();
    loadBars();
    loadFavorites();
    setupEventListeners();
}

/**
 * Initialize Leaflet map
 */
function initializeMap() {
    map = L.map('map').setView([BERGEN_LAT, BERGEN_LON], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    console.log('Map initialized');
}

/**
 * Load available tags from API
 */
async function loadTags() {
    try {
        const response = await fetch('/api/tags');
        allTags = await response.json();
        
        const tagFilter = document.getElementById('tagFilter');
        tagFilter.innerHTML = '';
        
        allTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.name;
            option.textContent = tag.name;
            tagFilter.appendChild(option);
        });
        
        console.log('Tags loaded:', allTags.length);
    } catch (error) {
        console.error('Error loading tags:', error);
        showAlert('Error loading tags. Please refresh the page.', 'warning');
    }
}

/**
 * Load bars from API
 */
async function loadBars(filters = {}) {
    try {
        let url = '/api/bars';
        const params = new URLSearchParams();
        
        if (filters.tags && filters.tags.length > 0) {
            params.append('tags', filters.tags.join(','));
        }
        
        if (filters.min_rating && filters.min_rating > 0) {
            params.append('min_rating', filters.min_rating);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        allBars = await response.json();
        
        displayBarsOnMap();
        console.log('Bars loaded:', allBars.length);
    } catch (error) {
        console.error('Error loading bars:', error);
        showAlert('Error loading bars. Please refresh the page.', 'warning');
    }
}

/**
 * Display bars on the map
 */
function displayBarsOnMap() {
    // Clear existing markers
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];
    
    allBars.forEach(bar => {
        const isFavorite = isFavoriteBar(bar.id);
        const starRating = '⭐'.repeat(Math.floor(bar.avg_rating)) + (bar.avg_rating % 1 >= 0.5 ? '½' : '');
        
        const popupContent = `
            <div style="min-width: 250px;">
                <h5>${bar.name}</h5>
                <p><strong>Description:</strong> ${bar.description}</p>
                <p><strong>Address:</strong> ${bar.address}</p>
                <p><strong>Rating:</strong> ${starRating} (${bar.avg_rating}/5)</p>
                <p><strong>Tags:</strong> ${bar.tags.join(', ')}</p>
                <div class="mt-2">
                    <button class="btn btn-sm ${isFavorite ? 'btn-danger' : 'btn-outline-primary'}" 
                            onclick="toggleFavorite(${bar.id}, '${bar.name.replace(/'/g, "\\'")}')">
                        ${isFavorite ? '💔 Remove from Favorites' : '❤️ Add to Favorites'}
                    </button>
                    <button class="btn btn-sm btn-warning ms-1" 
                            onclick="openRatingModal(${bar.id}, '${bar.name.replace(/'/g, "\\'")}')">
                        ⭐ Rate Bar
                    </button>
                </div>
            </div>
        `;
        
        const marker = L.marker([bar.latitude, bar.longitude])
            .bindPopup(popupContent, { maxWidth: 300 })
            .addTo(map);
        
        currentMarkers.push(marker);
    });
}

/**
 * Apply filters to the bars
 */
function applyFilters() {
    const tagFilter = document.getElementById('tagFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    const selectedTags = Array.from(tagFilter.selectedOptions).map(option => option.value);
    const minRating = parseFloat(ratingFilter.value);
    
    const filters = {
        tags: selectedTags,
        min_rating: minRating
    };
    
    loadBars(filters);
    showAlert(`Filters applied! Found ${allBars.length} bars.`, 'info');
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('tagFilter').selectedIndex = -1;
    document.getElementById('ratingFilter').value = '0';
    loadBars();
    showAlert('Filters cleared!', 'info');
}

/**
 * Refresh the map
 */
function refreshMap() {
    loadBars();
    showAlert('Map refreshed!', 'success');
}

/**
 * Favorites functionality
 */
function getFavorites() {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoritesDisplay();
}

function isFavoriteBar(barId) {
    const favorites = getFavorites();
    return favorites.some(fav => fav.id === barId);
}

function toggleFavorite(barId, barName) {
    let favorites = getFavorites();
    const existingIndex = favorites.findIndex(fav => fav.id === barId);
    
    if (existingIndex !== -1) {
        // Remove from favorites
        favorites.splice(existingIndex, 1);
        showAlert(`${barName} removed from favorites!`, 'info');
    } else {
        // Add to favorites
        favorites.push({
            id: barId,
            name: barName,
            added_at: new Date().toISOString()
        });
        showAlert(`${barName} added to favorites!`, 'success');
    }
    
    saveFavorites(favorites);
    
    // Refresh the map to update button states
    displayBarsOnMap();
}

function loadFavorites() {
    updateFavoritesDisplay();
}

function updateFavoritesDisplay() {
    const favorites = getFavorites();
    const favoritesCount = document.getElementById('favorites-count');
    const favoritesList = document.getElementById('favorites-list');
    
    favoritesCount.textContent = favorites.length;
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="text-muted">No favorites yet. Click the heart button on bars to add them!</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map(fav => `
        <div class="favorite-item" onclick="focusOnBar(${fav.id})">
            <h6>${fav.name}</h6>
            <small>Added: ${new Date(fav.added_at).toLocaleDateString()}</small>
            <button class="btn btn-sm btn-outline-danger float-end" 
                    onclick="event.stopPropagation(); removeFavorite(${fav.id}, '${fav.name.replace(/'/g, "\\'")}')">
                Remove
            </button>
        </div>
    `).join('');
}

function removeFavorite(barId, barName) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav.id !== barId);
    saveFavorites(favorites);
    showAlert(`${barName} removed from favorites!`, 'info');
    displayBarsOnMap();
}

function clearFavorites() {
    if (confirm('Are you sure you want to clear all favorites?')) {
        localStorage.removeItem(FAVORITES_KEY);
        updateFavoritesDisplay();
        displayBarsOnMap();
        showAlert('All favorites cleared!', 'info');
    }
}

function focusOnBar(barId) {
    const bar = allBars.find(b => b.id === barId);
    if (bar) {
        map.setView([bar.latitude, bar.longitude], 16);
        
        // Find and open the marker popup
        const marker = currentMarkers.find(m => 
            m.getLatLng().lat === bar.latitude && m.getLatLng().lng === bar.longitude
        );
        if (marker) {
            marker.openPopup();
        }
    }
}

function showFavorites() {
    updateFavoritesModalDisplay();
    const favoritesModal = new bootstrap.Modal(document.getElementById('favoritesModal'));
    favoritesModal.show();
}

function updateFavoritesModalDisplay() {
    const favorites = getFavorites();
    const modalList = document.getElementById('favorites-modal-list');
    
    if (favorites.length === 0) {
        modalList.innerHTML = '<p class="text-muted text-center">No favorites yet!</p>';
        return;
    }
    
    modalList.innerHTML = favorites.map(fav => {
        const bar = allBars.find(b => b.id === fav.id);
        const barInfo = bar ? `
            <small class="text-muted d-block">Rating: ${bar.avg_rating}⭐ | Tags: ${bar.tags.join(', ')}</small>
            <small class="text-muted d-block">${bar.address}</small>
        ` : '';
        
        return `
            <div class="card mb-2">
                <div class="card-body">
                    <h6 class="card-title">${fav.name}</h6>
                    ${barInfo}
                    <small class="text-muted">Added: ${new Date(fav.added_at).toLocaleDateString()}</small>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-primary" onclick="focusOnBar(${fav.id}); bootstrap.Modal.getInstance(document.getElementById('favoritesModal')).hide();">
                            View on Map
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeFavorite(${fav.id}, '${fav.name.replace(/'/g, "\\'")}')">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Rating functionality
 */
function openRatingModal(barId, barName) {
    currentRatingBarId = barId;
    currentRatingBarName = barName;
    
    document.getElementById('rating-bar-name').textContent = barName;
    document.getElementById('rating-feedback').innerHTML = '';
    
    // Reset stars
    document.querySelectorAll('.modal-stars').forEach(star => {
        star.classList.remove('active');
    });
    
    const ratingModal = new bootstrap.Modal(document.getElementById('ratingModal'));
    ratingModal.show();
}

async function submitRating() {
    const selectedStar = document.querySelector('.modal-stars.active:last-of-type');
    if (!selectedStar) {
        showAlert('Please select a rating!', 'warning');
        return;
    }
    
    const rating = parseInt(selectedStar.dataset.rating);
    
    try {
        const response = await fetch('/api/rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bar_id: currentRatingBarId,
                rating: rating
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('rating-feedback').innerHTML = 
                `<div class="alert alert-success">Rating submitted! New average: ${result.avg_rating}⭐</div>`;
            
            // Refresh the bars to show updated rating
            setTimeout(() => {
                loadBars();
                bootstrap.Modal.getInstance(document.getElementById('ratingModal')).hide();
            }, 1500);
        } else {
            document.getElementById('rating-feedback').innerHTML = 
                `<div class="alert alert-danger">${result.error || 'Error submitting rating'}</div>`;
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        document.getElementById('rating-feedback').innerHTML = 
            '<div class="alert alert-danger">Error submitting rating. Please try again.</div>';
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Star rating interaction
    document.querySelectorAll('.modal-stars').forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            
            // Remove active class from all stars
            document.querySelectorAll('.modal-stars').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked star and all previous stars
            for (let i = 1; i <= rating; i++) {
                document.querySelector(`[data-rating="${i}"]`).classList.add('active');
            }
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            
            // Highlight stars on hover
            document.querySelectorAll('.modal-stars').forEach(s => s.style.color = '#ddd');
            for (let i = 1; i <= rating; i++) {
                document.querySelector(`[data-rating="${i}"]`).style.color = '#ffc107';
            }
        });
    });
    
    // Reset star colors on mouse leave
    document.getElementById('star-rating').addEventListener('mouseleave', function() {
        document.querySelectorAll('.modal-stars').forEach(star => {
            if (star.classList.contains('active')) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = '#ddd';
            }
        });
    });
    
    console.log('Event listeners setup complete');
}

/**
 * Utility function to show alerts
 */
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// Make functions available globally for onclick handlers
window.toggleFavorite = toggleFavorite;
window.openRatingModal = openRatingModal;
window.submitRating = submitRating;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.refreshMap = refreshMap;
window.showFavorites = showFavorites;
window.clearFavorites = clearFavorites;
window.focusOnBar = focusOnBar;
window.removeFavorite = removeFavorite;
