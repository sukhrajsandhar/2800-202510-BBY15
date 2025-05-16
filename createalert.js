function handleCategoryChange() {
    const categorySelect = document.getElementById('alertCategory');
    const customDiv = document.getElementById('customCategoryDiv');
    if (categorySelect.value === 'Other') {
        customDiv.classList.remove('d-none');
    } else {
        customDiv.classList.add('d-none');
    }
}

async function loadMapData() {
    try {
        // Load campsites
        const campsitesResponse = await fetch('/api/campsites');
        if (!campsitesResponse.ok) {
            throw new Error(`HTTP error! status: ${campsitesResponse.status}`);
        }
        const campsitesData = await campsitesResponse.json();
        if (Array.isArray(campsitesData.features)) {
            campsitesData.features.forEach(campsite => {
                addCampsiteToMap(campsite);
            });
        } else if (Array.isArray(campsitesData)) {
            campsitesData.forEach(campsite => {
                addCampsiteToMap(campsite);
            });
        } else {
            console.error('Campsites data is not an array:', campsitesData);
        }
    }
    catch (error) {
        console.error('Error loading campsites:', error);
    }
}