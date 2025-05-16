// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing campsite functionality...');

    // Initialize the modal
    const addCampsiteModal = new bootstrap.Modal(document.getElementById('addCampsiteModal'));
    window.selectedCoordinates = null;
    let locationSearch = null;
    let geocoderInitialized = false;

    // Add event listeners
    const addCampsiteBtn = document.getElementById('addCampsiteBtn');
    if (addCampsiteBtn) {
        console.log('Found addCampsiteBtn, adding click listener');
        addCampsiteBtn.addEventListener('click', () => {
            addCampsiteModal.show();
        });
    } else {
        console.warn('addCampsiteBtn not found in the DOM');
    }

    // Initialize geocoder for the modal
    function initializeModalGeocoder() {
        if (geocoderInitialized) return;
        geocoderInitialized = true;
        console.log('Initializing modal geocoder...');
        
        if (!window.mapboxgl.accessToken) {
            console.error('Mapbox access token is missing!');
            return;
        }
        if (!window.map) {
            console.error('Map is not initialized!');
            return;
        }

        const geocoder = new MapboxGeocoder({
            accessToken: window.mapboxgl.accessToken,
            mapboxgl: window.mapboxgl,
            placeholder: 'Search for location...',
            marker: false,
            flyTo: false,
            countries: 'ca'
        });

        const geocoderContainer = document.getElementById('campsite-geocoder');
        if (geocoderContainer) {
            // Clear any existing content
            geocoderContainer.innerHTML = '';
            geocoder.addTo('#campsite-geocoder');

            geocoder.on('result', (event) => {
                window.selectedCoordinates = event.result.center;
                console.log('Geocoder selected coordinates:', window.selectedCoordinates);
                // Update the hidden input with the selected location details
                const locationObj = {
                    lng: event.result.center[0],
                    lat: event.result.center[1],
                    place_name: event.result.place_name
                };
                const locationInput = document.getElementById('campsiteLocation');
                if (locationInput) {
                    locationInput.value = JSON.stringify(locationObj);
                    console.log('Updated hidden input with:', locationInput.value);
                } else {
                    console.warn('Hidden input #campsiteLocation not found!');
                }
            });

            // Save a reference to the geocoder input for later
            window.geocoderInput = document.querySelector('#campsite-geocoder input[type="text"]');
        } else {
            console.warn('Geocoder container not found');
        }
    }

    // Initialize geocoder when the modal is shown
    const modal = document.getElementById('addCampsiteModal');
    if (modal) {
        console.log('Found modal, adding shown.bs.modal listener');
        modal.addEventListener('shown.bs.modal', initializeModalGeocoder);
    } else {
        console.warn('Modal not found in the DOM');
    }

    // Handle form submission
    const saveButton = document.getElementById('saveCampsite');
    if (saveButton) {
        console.log('Found save button, adding click listener');
        saveButton.addEventListener('click', async () => {
            console.log('Save button clicked');
            console.log('Selected coordinates:', window.selectedCoordinates);
            
            if (!window.selectedCoordinates) {
                alert('Please select a location for the campsite.');
                return;
            }

            const form = document.getElementById('addCampsiteForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Get selected rating
            const ratingInput = document.querySelector('input[name="rating"]:checked');
            if (!ratingInput) {
                alert('Please select a rating for the campsite.');
                return;
            }
            const initialRating = parseInt(ratingInput.value);
            console.log('Selected rating:', initialRating);

            // Get selected amenities
            const amenities = Array.from(document.querySelectorAll('.amenities-checkboxes input:checked'))
                .map(checkbox => checkbox.value);
            console.log('Selected amenities:', amenities);

            // Get location from hidden input (set by geocoder or current location)
            const locationInput = document.getElementById('campsiteLocation');
            if (!locationInput || !locationInput.value) {
                alert('Location information is missing. Please select a location.');
                return;
            }
            
            let location;
            try {
                location = JSON.parse(locationInput.value);
                console.log('Parsed location:', location);
            } catch (error) {
                console.error('Error parsing location:', error);
                alert('Error processing location information. Please try again.');
                return;
            }

            const campsiteData = {
                name: document.getElementById('campsiteName').value,
                description: document.getElementById('campsiteDescription').value,
                type: document.getElementById('campsiteType').value,
                season: document.getElementById('campsiteSeason').value,
                difficulty: document.getElementById('campsiteDifficulty').value,
                fees: {
                    camping: document.getElementById('campsiteFees').value
                },
                amenities: amenities,
                coordinates: [location.lng, location.lat],
                place_name: location.place_name,
                rating: initialRating,
                reviews: 1
            };

            console.log('Sending campsite data:', campsiteData);

            try {
                const response = await fetch('/api/campsites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(campsiteData)
                });

                console.log('Response status:', response.status);
                
                if (response.ok) {
                    const newCampsite = await response.json();
                    console.log('Received new campsite:', newCampsite);
                    addCampsiteToMap(newCampsite);
                    addCampsiteModal.hide();
                    form.reset();
                    window.selectedCoordinates = null;
                    alert('Campsite added successfully!');
                } else {
                    const errorData = await response.json();
                    console.error('Server error:', errorData);
                    throw new Error(errorData.message || 'Failed to save campsite');
                }
            } catch (error) {
                console.error('Error saving campsite:', error);
                alert('Failed to save campsite: ' + error.message);
            }
        });
    } else {
        console.warn('Save button not found in the DOM');
    }
});

// Function to add a new campsite to the map
function addCampsiteToMap(campsite) {
    if (!window.map) {
        console.error('Map is not initialized!');
        return;
    }

    const el = document.createElement('div');
    el.className = 'camping-marker';
    el.innerHTML = `
        <div class="marker-container">
            <div class="marker-icon">
                <i class="fas fa-campground"></i>
            </div>
            <div class="marker-pulse"></div>
        </div>
    `;
    el.style.cursor = 'pointer';

    // Get properties from GeoJSON feature or direct object
    const properties = campsite.properties || campsite;
    const geometry = campsite.geometry || { coordinates: campsite.coordinates };

    // Robust property access
    const name = properties.name || 'Unknown';
    const rating = properties.rating || 0;
    const totalRatings = properties.reviews || 0;
    const description = properties.description || '';
    const type = properties.type || '';
    const season = properties.season || '';
    const difficulty = properties.difficulty || '';
    const fees = (properties.fees && properties.fees.camping) || 'N/A';
    const amenities = properties.amenities || [];
    const coordinates = geometry.coordinates;

    if (!coordinates || coordinates.length !== 2) {
        console.warn('Campsite missing coordinates:', campsite);
        return;
    }

    console.log('Campsite properties for popup:', properties);
    let id = properties._id;
    if (id && typeof id === 'object' && id.$oid) {
        id = id.$oid;
    }
    if (!id || id === 'undefined') {
        id = null;
    }
    const moreInfoButton = id
      ? `<button onclick=\"window.location.href='/campsite-info/${id}'\" class=\"more-info-btn\">More Info</button>`
      : `<button class=\"more-info-btn\" disabled>No Info</button>`;
    const popupContent = `
        <div class="camping-popup">
            <h4>${name}</h4>
            <div class="popup-rating">
                <span class="stars">${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5-Math.floor(rating))}</span>
                <span class="rating">${rating.toFixed(1)} (${totalRatings} reviews)</span>
            </div>
            <p class="description">${description}</p>
            <div class="popup-details">
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Season:</strong> ${season}</p>
                <p><strong>Difficulty:</strong> ${difficulty}</p>
                <p><strong>Fees:</strong> ${fees}</p>
            </div>
            <div class="popup-amenities">
                <h5>Amenities:</h5>
                <ul>
                    ${Array.isArray(amenities) ? amenities.map(amenity => `<li>${amenity}</li>`).join('') : ''}
                </ul>
            </div>
            <div class="popup-actions">
                ${moreInfoButton}
            </div>
        </div>
    `;

    // Create a new marker
    const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(popupContent))
        .addTo(window.map);

    // Add click event listener to the marker
    marker.on('click', () => {
        marker.togglePopup();
    });
}