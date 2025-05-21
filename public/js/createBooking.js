document.addEventListener('DOMContentLoaded', function() {
    console.log('Create Booking script loaded');
    document.getElementById('bookingForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            campsiteId: document.getElementById('campsiteId').value,
            userId: document.getElementById('userId').value,
            firstName: document.getElementById('firstName').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            dateCreated: new Date().toISOString(),
            tentSpots: document.getElementById('tentSpots').value,
            contactInfo: document.getElementById('contactInfo').value,
            summary: document.getElementById('summary').value
        };
        console.log(formData.userId);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });



            if (response.ok) {
                const data = await response.json();
                


                alert('Booking created successfully!');

                window.location.href = `/campsite-info/${data.campsiteId}`;
            } else {
                alert('Error creating booking. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});