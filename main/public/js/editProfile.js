document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    const form = document.querySelector('.profile-form');

    if (form) {
        console.log("Form found, attaching event listener");
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission behavior

            // Collect data from the form by accessing each field by its ID
            const formData = {
                id: document.querySelector('#userId').value,
                name: document.querySelector('#name').value,
                // Add other fields here if needed
            };

            console.log('Form data:', formData); // Log to check the data before sending

            try {
                const response = await fetch('/edit-profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                } else {
                    alert(result.message || 'Something went wrong');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        });
    } else {
        console.error('Form element not found');
    }
});

