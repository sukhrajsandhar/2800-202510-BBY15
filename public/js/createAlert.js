function handleCategoryChange() {
    const categorySelect = document.getElementById('alertCategory');
    const customDiv = document.getElementById('customCategoryDiv');
    if (categorySelect.value === 'Other') {
        customDiv.classList.remove('d-none');
    } else {
        customDiv.classList.add('d-none');
    }
}

document.getElementById('alertForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedCategory = document.getElementById('alertCategory').value;
    const customCategory = document.getElementById('customCategory').value;

    const formData = {
        userId: document.getElementById('userId').value,
        campsiteId: document.getElementById('campsiteId').value,
        alertType: document.getElementById('alertCategory').value,
        alertDate: document.getElementById('alertDate').value,
        message: document.getElementById('alertDescription').value
    };

    try {
        const response = await fetch('/api/alerts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json();
            alert('Alert created successfully!');
            window.location.href = `/campsite-info/${data.campsiteId}`;
        } else {
            alert('Error creating alert. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});