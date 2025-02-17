document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const calendarHeader = document.querySelector(".display-header");
    const daysContainer = document.querySelector(".days");
    const previous = document.querySelector(".left");
    const next = document.querySelector(".right");
    const selectedDisplay = document.querySelector(".selected");
    const mealsContainer = document.querySelector(".meals");
    const viewSelect = document.getElementById('view-select');
    const resetBtn = document.getElementById('reset-btn');

    const initialView = document.getElementById('initial-view').value;

    // Initialize Date variables
    const today = new Date();
    let selectedDay = new Date(today);
    let currentView = initialView || "Monthly";  // Default to Monthly if no view set    
    let year = today.getFullYear();
    let month = today.getMonth();

    const calendarData = document.getElementById('calendar-data').value;
    let mealDates = [];
    try {
        mealDates = JSON.parse(calendarData);
    } catch (error) {
        console.error("Invalid JSON:", error);
    }

    /** Helper Functions **/

    // Format date to 'YYYY-MM-DD'
    function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Convert date to 'YYYY-MM-DD' for database use
    function convertToDatabaseFormat(date) {
        return formatDateToYYYYMMDD(new Date(date));
    }

    /** Calendar Functions **/

    function updateHeader() {
        calendarHeader.innerHTML = selectedDay.toLocaleString("en-US", { month: "long", year: "numeric" });
    }

    function renderCalendar() {
        daysContainer.innerHTML = "";
        selectedDisplay.innerHTML = "";
        updateHeader();

        if (currentView === "Monthly") {
            renderMonthlyView();
        } else if (currentView === "Weekly") {
            renderWeeklyView();
        }
    }

    function renderMonthlyView() {
        const firstDay = new Date(year, month, 1);
        const firstDayIndex = firstDay.getDay();
        const lastDay = new Date(year, month + 1, 0);
        const numberOfDays = lastDay.getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            daysContainer.appendChild(document.createElement("div"));
        }

        for (let j = 1; j <= numberOfDays; j++) {
            const currentDate = new Date(year, month, j);
            const dayDiv = createDayElement(currentDate);
            daysContainer.appendChild(dayDiv);
        }
        displayMealsForDay(selectedDay.toDateString());
    }

    function renderWeeklyView() {
        const startOfWeek = new Date(selectedDay);
        startOfWeek.setDate(selectedDay.getDate() - selectedDay.getDay());

        for (let i = 0; i < 7; i++) {
            const dayDiv = createDayElement(new Date(startOfWeek));
            daysContainer.appendChild(dayDiv);
            startOfWeek.setDate(startOfWeek.getDate() + 1);
        }
        displayMealsForDay(selectedDay.toDateString());
    }

    function createDayElement(date) {
        const div = document.createElement("div");
        const formattedDate = formatDateToYYYYMMDD(date);
        div.dataset.date = formattedDate;
        div.textContent = date.getDate();

        const dayWithMeals = mealDates.find(meal => meal.date === formattedDate);
        if (dayWithMeals) {
            const dot = document.createElement("span");
            dot.classList.add("meal-dot");
            div.appendChild(dot);
        }

        div.addEventListener("click", () => {
            selectedDay = date;
            if (dayWithMeals) {
                fetchRecipesForDay(dayWithMeals.recipes);
            } else {
                displayMealsForDay([]);
            }
        });

        return div;
    }

    /** Meal Functions **/

    async function fetchRecipesForDay(recipeIds) {
        try {
            const dbDate = convertToDatabaseFormat(selectedDay);
            const response = await fetch('/get-recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeIds, date: dbDate })
            });

            const data = await response.json();
            if (response.ok) {
                displayMealsForDay(data.recipes);
            } else {
                console.error("Error fetching recipes:", data.message);
            }
        } catch (err) {
            console.error("Request failed:", err);
        }
    }

    function displayMealsForDay(recipesData) {
        mealsContainer.innerHTML = "";
        selectedDisplay.innerHTML = `Meals For: ${selectedDay.toDateString()}`;

        if (Array.isArray(recipesData) && recipesData.length > 0) {
            recipesData.forEach(([recipeId, recipeName]) => {
                const mealCard = document.createElement("div");
                mealCard.classList.add("meal-card");
                mealCard.dataset.recipeId = recipeId;  // Add the recipeId as a data attribute

                mealCard.innerHTML = `
                    <img src="/images/meal-card-temp.jpg" alt="${recipeName} Image">
                    <div class="meal-card-content">
                        <div>${recipeName}</div>
                        <button class="delete-button" data-recipe-id="${recipeId}">Delete</button>
                    </div>`;

                mealsContainer.appendChild(mealCard);
            });

            // Add event listener to delete buttons
            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    // Prevent the card click event from triggering
                    e.stopPropagation();

                    const recipeId = e.target.dataset.recipeId;
                    const dbDate = convertToDatabaseFormat(selectedDay);
                    deleteMeal(recipeId, dbDate);
                });
            });

            // Add event listener to meal cards (for navigating to recipe page)
            document.querySelectorAll('.meal-card').forEach(card => {
                card.addEventListener('click', () => {
                    const recipeId = card.dataset.recipeId;
                    window.location.href = `/recipe/${recipeId}`; // Navigate to recipe page
                });
            });
        } else {
            mealsContainer.innerHTML = `<h3>No Meals Today!</h3>`;
        }
    }

    async function deleteMeal(recipeId, dateStr) {
        try {
            const response = await fetch('/remove-calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeId, date: dateStr })
            });

            const data = await response.json();
            if (response.ok) {
                console.log("Meal deleted successfully!");

                // Update `mealDates` to remove the date if no recipes remain
                const dateIndex = mealDates.findIndex(meal => meal.date === dateStr);
                if (dateIndex !== -1) {
                    const updatedRecipes = mealDates[dateIndex].recipes.filter(id => id !== recipeId);
                    if (updatedRecipes.length > 0) {
                        mealDates[dateIndex].recipes = updatedRecipes;
                    } else {
                        mealDates.splice(dateIndex, 1); // Remove the entire date if no recipes remain
                    }
                }

                // Re-render the calendar to reflect changes
                renderCalendar();
            } else {
                console.error("Error deleting meal:", data.message);
            }
        } catch (err) {
            console.error("Request failed:", err);
        }
    }

    /** Event Listeners **/

    viewSelect.addEventListener("change", () => {
        currentView = viewSelect.value;
        renderCalendar();
    });

    previous.addEventListener("click", () => {
        if (currentView === "Monthly") {
            month--;
            if (month < 0) {
                month = 11;
                year--;
                selectedDay.setYear(year);
            }
            selectedDay.setMonth(month);
        } else {
            selectedDay.setDate(selectedDay.getDate() - 7);
        }
        renderCalendar();
    });

    next.addEventListener("click", () => {
        if (currentView === "Monthly") {
            month++;
            if (month > 11) {
                month = 0;
                year++;
                selectedDay.setYear(year);
            }
            selectedDay.setMonth(month);
        } else {
            selectedDay.setDate(selectedDay.getDate() + 7);
        }
        renderCalendar();
    });

    resetBtn.addEventListener("click", () => {
        selectedDay = new Date(today);
        currentView = "Monthly";
        year = today.getFullYear();
        month = today.getMonth();
        renderCalendar();
    });

    // call function to render the calendar
    renderCalendar();
});
