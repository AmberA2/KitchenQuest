document.addEventListener('DOMContentLoaded', () => {
    const favoriteBtn = document.getElementById('favorite-btn');
    const calendarBtn = document.getElementById('calendar-btn');
    const calendarPopup = document.getElementById('calendar-popup');
    const closePopupBtn = document.getElementById('close-popup-btn');
    const saveEventBtn = document.getElementById('save-event-btn');
    const eventDateInput = document.getElementById('event-date');

    const recipeId = favoriteBtn.dataset.recipeId;
    const userId = favoriteBtn.dataset.userId;


    // Debug: Check if elements are loaded
    console.log('Calendar Button:', calendarBtn);
    console.log('Calendar Popup:', calendarPopup);

    // Favorite button functionality
    favoriteBtn.addEventListener('click', () => {
        //alert('Recipe added to favorites!');
        addFavorite(userId, recipeId);
    });

    // Open calendar popup
    calendarBtn.addEventListener('click', () => {
        console.log('Opening calendar popup');
        calendarPopup.style.display = 'flex';
    });

    // Close calendar popup
    closePopupBtn.addEventListener('click', () => {
        console.log('Closing calendar popup');
        calendarPopup.style.display = 'none';
    });

    saveEventBtn.addEventListener('click', () => {
        const selectedDate = eventDateInput.value;
        if (selectedDate) {
            addToCalendar(userId, recipeId, selectedDate);
            calendarPopup.style.display = 'none';  // Close the popup
        } else {
            alert('Please select a date.');
        }
    });

    // calendar stuff
    async function addToCalendar(userId, recipeId, selectedDate) {
        try {
            // Check if userId, recipeId, and selectedDate are valid
            if (!userId || !recipeId || !selectedDate) {
                alert("Missing data. Please make sure everything is filled out.");
                return;
            }

            // Send the POST request to the server
            const response = await fetch(`/calendar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    recipeId,
                    date: selectedDate
                })
            });

            const result = await response.json();

            if (response.ok) {
                //alert("Recipe added to your calendar!");
            } else {
                alert(result.message || "Something went wrong!");
            }
        } catch (error) {
            console.error("Error adding to calendar:", error);
            alert("An error occurred while adding to the calendar.");
        }
    }
    // Save event
    saveEventBtn.addEventListener('click', () => {
        const selectedDate = eventDateInput.value;
        if (selectedDate) {
            //alert(`Event saved for ${selectedDate}`);
            calendarPopup.style.display = 'none';
        } else {
            alert('Please select a date.');
        }
    });

    async function addFavorite(userId, recipeId) {
        try {
            // Get the userId (assume this is available from session data or a global JS variable)
            //const userId = userId; // Replace with how you pass the user ID to the template
            
            // Check if userId and recipeId are valid
            if (!userId || !recipeId) {
                alert("User or recipe ID is missing!");
                return;
            }

            // Send the POST request to the server
            const response = await fetch(`/addFavorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    recipeId: recipeId
                })
            });

            const result = await response.json();

            // Handle the response, success or failure
            if (response.ok) {
                //alert("Recipe added to favorites!");
            } else {
                alert(result.message || "Something went wrong!");
            }
        } catch (error) {
            console.error("Error adding favorite:", error);
            alert("An error occurred while adding the favorite.");
        }
    }


});
