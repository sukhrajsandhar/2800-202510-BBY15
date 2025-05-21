// This script handles the creation of alerts in the campsite management system.
// It includes a form submission handler that collects data from the form,
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        userId: document.getElementById('userId').value,
        firstName: document.getElementById('firstName').value,
        campsiteId: document.getElementById('campsiteId').value,
        overallRating: document.getElementById('overallRating').value,
        dateVisited: document.getElementById('dateVisited').value,
        electricityWaterHookups: document.getElementById('electricityWaterHookups').value,
        dogFriendly: document.getElementById('dogFriendly').value,
        picnicTables: document.getElementById('picnicTables').value,
        firePitsGrills: document.getElementById('firePitsGrills').value,
        cellService: document.getElementById('cellService').value,
        trashRecycleBins: document.getElementById('trashRecycleBins').value,
        washrooms: document.getElementById('washrooms').value,
        additionalComments: document.getElementById('additionalComments').value
    };

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json();
            alert('Review submitted successfully!');
            window.location.href = `/campsite-info/${data.campsiteId}`;
        } else {
            alert('Error submitting review. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});