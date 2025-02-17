document.addEventListener('DOMContentLoaded', () => {
    const searchSection = document.querySelector('.search-section'); // Layout search section

    if (window.location.pathname === '/finder') {
        // Hide the layout search section
        if (searchSection) {
            searchSection.style.display = 'none';
        }
    }

    const searchButton = document.getElementById('search-btn');
    const clearButton = document.getElementById('clear-btn');

    const recipeContainer = document.querySelector('.recipe-cards');
    const paginationContainer = document.querySelector('.pagination-container');

    let currentSearch = '';
    let currentTags = [];
    let currentPage = 1;

    // Function to fetch and render recipes
    async function fetchRecipes(page = 1, search = '', tags = []) {
        console.log('Fetching recipes for page:', page);

        const response = await fetch('/finder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                searchTerm: search,  // Send search term
                page: page,          // Send current page
                tags: tags,          // Send selected tags
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
                fetchRecipes(currentPage - 1, currentSearch, currentTags);
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
                    fetchRecipes(i, currentSearch, currentTags);
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
                    fetchRecipes(i, currentSearch, currentTags);
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
                    fetchRecipes(i, currentSearch, currentTags);
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
                    fetchRecipes(i, currentSearch, currentTags);
                });
                paginationContainer.appendChild(pageButton);
            }
            


        }
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.classList.add('pagination-btn');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
                fetchRecipes(currentPage + 1, currentSearch, currentTags);
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    // Search button click handler
    searchButton.addEventListener('click', async (event) => {
        event.preventDefault();
        currentSearch = document.getElementById('search-term').value;
        currentTags = [];
        const checkboxes = document.querySelectorAll('input[name="allergies"]:checked');
        checkboxes.forEach(checkbox => currentTags.push(checkbox.value));

        const meals = document.querySelector('input[name="meals"]:checked');
        if (meals) currentTags.push(meals.value);

        const cooktime = document.querySelector('input[name="cooktime"]:checked');
        if (cooktime) currentTags.push(cooktime.value);

        // Reset current page to 1 for new search
        currentPage = 1;

        fetchRecipes(currentPage, currentSearch, currentTags);
    });

    clearButton.addEventListener('click', () => {
        console.log('Clear button clicked');
        document.getElementById('search-term').value = '';
        const checkboxes = document.querySelectorAll('input[name="allergies"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        const radioButtons = document.querySelectorAll('input[name="meals"], input[name="cooktime"]');
        radioButtons.forEach(radio => radio.checked = false);
        fetchRecipes(1, '', []);
    });

    // Initial fetch of recipes on page load (optional or remove if you want no default fetch)
    fetchRecipes(currentPage, currentSearch, currentTags);
});
