document.addEventListener("DOMContentLoaded", function() {
    const calendarBox = document.querySelector('.calendar-box'); // The entire calendar box or div

    // Add a click event listener to the calendar container
    calendarBox.addEventListener('click', function() {
        // Redirect to the calendar page
        window.location.href = '/calendar';  // Redirect to /calendar route
    });


    const recipeContainer = document.querySelector('.recipe-cards');
    const paginationContainer = document.querySelector('.pagination-container');
    let currentPage = 1;

    // Function to fetch and render recipes
    async function fetchRecipes(page = 1) {
        console.log('Fetching recipes for page:', page);

        const response = await fetch('/homepage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page: page,          // Send current page
            }),
        });

        if (!response.ok) {
            console.error('Error fetching recipes:', response.status, response.statusText);
            return;
        }

        try {
            const { recipes, totalPages, currentPage } = await response.json();
            console.log(recipes);
            renderRecipes(recipes);
            renderPagination(totalPages, currentPage);
            console.log(totalPages, currentPage);
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    }

    // Function to render recipes
    function renderRecipes(recipes) {
        if (!recipes || recipes.length === 0) {
            recipeContainer.innerHTML = '<p>No recipes found</p>';
            return;
        }

        // Clear previous recipes
        recipeContainer.innerHTML = '';

        // Render each recipe as a card
        recipes.forEach(recipe => {
            let allergies = recipe.tags.slice(0, recipe.tags.length - 2);
            const [time, mealType] = recipe.tags.slice(-2);

            const recipeCard = document.createElement('div');

            // Make the card clickable and redirect to the recipe details page
            recipeCard.addEventListener('click', () => {
                console.log("recipe id: ", `${recipe._id}`);
                window.location.href = `/recipe/${recipe._id}`;  // Use the recipe's unique ID to form the URL
                //window.location.href = `/recipe/674fa473ab8a01d079e31175`;
            });

            recipeCard.classList.add('recipe-card');
            recipeCard.innerHTML = `
                <img src="${recipe.image || '../images/default.jpg'}" alt="Recipe Image" class="recipe-banner">
                
                <div class="recipe-body">
                    <h4 class="recipe-name">${recipe.name}</h4>
                    <p class="recipe-basics">${time} | ${mealType}</p>
                    <p class="recipe-description">${allergies.join(', ')}</p>
                </div>
            `;
            recipeContainer.appendChild(recipeCard);
        });
    }

    // Function to render pagination controls
    function renderPagination(totalPages, currentPage) {
        paginationContainer.innerHTML = ''; // Clear previous pagination

        const paginationLimit = 3; // Limit number of pages to display before and after the current page

        // Create the "Previous" button if not on the first page
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.classList.add('pagination-btn');
            prevButton.textContent = 'Prev';
            prevButton.addEventListener('click', () => {
                fetchRecipes(currentPage - 1 );
            });
            paginationContainer.appendChild(prevButton);
        }

        if (totalPages <= paginationLimit * 2) {
            // If total pages are less than or equal to paginationLimit, show all pages
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.classList.add('pagination-btn');
                pageButton.textContent = i;
                if (i === currentPage) {
                    pageButton.classList.add('active');
                }
                pageButton.addEventListener('click', () => {
                    fetchRecipes(i);
                });
                paginationContainer.appendChild(pageButton);
            }
        }
        // Handle small totalPages (display all page numbers)
        else {
            for (let i = 1; i <= paginationLimit; i++) {
                const pageButton = document.createElement('button');
                pageButton.classList.add('pagination-btn');
                pageButton.textContent = i;
                if (i === currentPage) {
                    pageButton.classList.add('active');
                }
                pageButton.addEventListener('click', () => {
                    fetchRecipes(i);
                });
                paginationContainer.appendChild(pageButton);
            }
            if (currentPage > paginationLimit + 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
            for (let i = Math.max(currentPage - 1, paginationLimit + 1); i <= Math.min(currentPage + 1, totalPages - paginationLimit); i++) {
                const pageButton = document.createElement('button');
                pageButton.classList.add('pagination-btn');
                pageButton.textContent = i;
                if (i === currentPage) {
                    pageButton.classList.add('active');
                }
                pageButton.addEventListener('click', () => {
                    fetchRecipes(i);
                });
                paginationContainer.appendChild(pageButton);
            }
            if (currentPage < totalPages - paginationLimit) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
            for (let i = totalPages - paginationLimit + 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.classList.add('pagination-btn');
                pageButton.textContent = i;
                if (i === currentPage) {
                    pageButton.classList.add('active');
                }
                pageButton.addEventListener('click', () => {
                    fetchRecipes(i);
                });
                paginationContainer.appendChild(pageButton);
            }
            


        }
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.classList.add('pagination-btn');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
                fetchRecipes(currentPage + 1);
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    // Initial fetch of recipes on page load (optional or remove if you want no default fetch)
    fetchRecipes(currentPage);

});
