/** Variables **/
document.addEventListener('DOMContentLoaded', () => {// Select DOM elements
    const calendarHeader = document.querySelector(".display-header");
    const daysContainer = document.querySelector(".days");
    const previous = document.querySelector(".left");
    const next = document.querySelector(".right");
    const selectedDisplay = document.querySelector(".selected");
    const mealsContainer = document.querySelector(".meals");
    const viewSelect = document.getElementById('view-select');
    const resetBtn = document.getElementById('reset-btn');

    // Initialize Date variables
    const today = new Date(); // current date
    let selectedDay = new Date(today); // date selected by user on calendar
    let currentView = "Monthly"; // default view
    let year = today.getFullYear();
    let month = today.getMonth();

    const calendarDataStr = document.getElementById('calendar-data').value;
    console.log('calendarData string:', calendarDataStr);  // Log the raw JSON string

    let calendarData = [];
    if (calendarDataStr) {
        try {
            // Clean up the string to ensure it's valid JSON
            const sanitizedStr = calendarDataStr
                .trim()  // Remove leading/trailing spaces
                .replace(/\n|\r/g, '')  // Remove newlines and carriage returns
                .replace(/"\s*(_id|userId|recipe|date)\s*"/g, '"$1"');  // Remove spaces around keys

            // Parse the sanitized string into an array
            calendarData = JSON.parse(sanitizedStr);
            console.log('Parsed calendar data:', calendarData);  // Log the parsed data
        } catch (e) {
            console.error('Error parsing calendar data:', e);
        }
    } else {
        console.error('calendarData is empty or invalid');
    }




    /** Functions **/
    // Update the calendar header with the current month and year
    function updateHeader() {
        calendarHeader.innerHTML = selectedDay.toLocaleString("en-US", { month: "long", year: "numeric" });
    }

    // Render the calendar days based on the current view
    function renderCalendar() {
        daysContainer.innerHTML = ""; // Clear calendar days
        selectedDisplay.innerHTML = ""; // Clear selected meals display
        updateHeader();

        if (currentView === "Monthly") {
            renderMonthlyView();
        } else if (currentView === "Weekly") {
            renderWeeklyView();
        } else if (currentView === "Daily") {
            renderDailyView();
        }
    }

    // Render the monthly calendar view
    function renderMonthlyView() {
        const firstDay = new Date(year, month, 1); // first day of current month
        const firstDayIndex = firstDay.getDay(); // use firstDay to get index (0 to 6) of first day of the week
        const lastDay = new Date(year, month + 1, 0); // last day of current month
        const numberOfDays = lastDay.getDate(); // use lastDay to get number of days in a month

        // Place empty divs/days until the first day of the month to even out layout
        for (let i = 0; i < firstDayIndex; i++) {
            daysContainer.appendChild(document.createElement("div")); // Empty slots
        }

        // Call function to display the days of the month
        for (let j = 1; j <= numberOfDays; j++) {
            let currentDate = new Date(year, month, j);
            const dayDiv = createDayElement(currentDate);
            daysContainer.appendChild(dayDiv);
        }
        displayMealsForDay(selectedDay.toISOString().split('T')[0]);
    }

    // Render the weekly calendar view
    function renderWeeklyView() {
        const startOfWeek = new Date(selectedDay);
        startOfWeek.setDate(selectedDay.getDate() - selectedDay.getDay()); // Set to Sunday

        for (let i = 0; i < 7; i++) {
            const dayDiv = createDayElement(new Date(startOfWeek));
            daysContainer.appendChild(dayDiv);
            startOfWeek.setDate(startOfWeek.getDate() + 1);
        }
        displayMealsForDay(selectedDay.toDateString());
    }

    // Render the daily calendar view and expand the side panel
    function renderDailyView() {
        daysContainer.innerHTML = `<div>${selectedDay.toDateString()}</div>`;
        mealsContainer.parentElement.style.flex = "2"; // Expand side panel
        displayMealsForDay(selectedDay.toDateString());
    }

    // Create a calendar day element
    function createDayElement(date) {
        const div = document.createElement("div");
        const dateStr = date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
        div.dataset.date = dateStr;
        div.textContent = date.getDate();

        // Check if there is calendar data for this date
        const hasMealForDay = calendarData.some(meal => {
            const mealDate = new Date(meal.date);
            return mealDate.toISOString().split('T')[0] === dateStr; // Compare the date
        });

        console.log(`Checking date: ${dateStr}, Has meal data: ${hasMealForDay}`); // Log the check for each date

        // If there is a meal for this date, add a dot to the day
        if (hasMealForDay) {
            const dot = document.createElement("span");
            dot.classList.add("meal-dot"); // Add a CSS class for styling the dot
            div.appendChild(dot);
        }

        div.addEventListener("click", () => {
            selectedDay = date;
            renderCalendar();
        });
        return div;
    }

    // Display meals for the selected day
    function displayMealsForDay(dateStr) {
        mealsContainer.innerHTML = "";
        selectedDisplay.innerHTML = `Meals For: ${dateStr}`;

        // Compare the date in the calendar with the date in the calendar data
        const mealForDay = calendarData.find(meal => {
            // Convert both dateStr and meal.date to 'YYYY-MM-DD' format for comparison
            const mealDate = new Date(meal.date);
            const selectedDate = new Date(dateStr);
            return mealDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
        });

        if (mealForDay) {
            mealForDay.meals.forEach((meal, index) => {
                const mealCard = document.createElement("div");
                mealCard.classList.add("meal-card");

                mealCard.innerHTML = `
                <img src="tacos.jpg" alt="${meal} Image">
                <div class="meal-card-content">
                    <div>${meal}</div>
                    <textarea placeholder="Add your notes here..."></textarea>
                    <button onclick="deleteMeal('${mealForDay.date}', ${index})">Delete</button>
                </div>
            `;
                mealsContainer.appendChild(mealCard);
            });
        } else {
            mealsContainer.innerHTML = `<h3>No Meals Today!</h3>`;
        }
    }

    // Delete a specific meal for a day
    function deleteMeal(dateStr, mealIndex) {
        const mealForDay = calendarData.find(meal => meal.date === dateStr);
        if (mealForDay) {
            mealForDay.meals.splice(mealIndex, 1);
            displayMealsForDay(dateStr);
        }
    }

    /** Event Listeners **/
    // Change view
    viewSelect.addEventListener("change", () => {
        currentView = viewSelect.value;
        renderCalendar();
    });

    // Navigate to the previous month/week/day
    previous.addEventListener("click", () => {
        if (currentView === "Monthly") {
            month--;
            if (month < 0) {
                month = 11;
                year--;
                selectedDay.setYear(year);
            }
            selectedDay.setMonth(month);
        } else if (currentView === "Weekly" || currentView === "Daily") {
            selectedDay.setDate(selectedDay.getDate() - 7);
        }
        renderCalendar();
    });

    // Navigate to the next month/week/day
    next.addEventListener("click", () => {
        if (currentView === "Monthly") {
            month++;
            if (month > 11) {
                month = 0;
                year++;
                selectedDay.setYear(year);
            }
            selectedDay.setMonth(month);
        } else if (currentView === "Weekly" || currentView === "Daily") {
            selectedDay.setDate(selectedDay.getDate() + 7);
        }
        renderCalendar();
    });

    // Reset to today
    resetBtn.addEventListener("click", () => {
        selectedDay = new Date(today);
        currentView = "Monthly";
        year = today.getFullYear();
        month = today.getMonth();
        renderCalendar();
    });

    // Initialize the calendar
    renderCalendar();
});