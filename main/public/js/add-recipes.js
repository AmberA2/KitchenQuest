document.addEventListener('DOMContentLoaded', () => {
    // DOM
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const addStepBtn = document.getElementById('add-step-btn');
    //const form = document.getElementById('add-recipe');

    // Monitor default ingredient, step, and note fields
    const ingredientNameInput = document.querySelector('input[name="ingredientName[]"]');
    const stepTextarea = document.querySelector('textarea[name="directions[]"]');

    // Add input event listeners for validation
    ingredientNameInput.addEventListener('input', toggleAddIngredientButton);
    stepTextarea.addEventListener('input', toggleAddStepButton);

    function toggleAddIngredientButton() {
        const ingredientInputs = document.querySelectorAll('input[name="ingredientName[]"]');
        const lastInput = ingredientInputs[ingredientInputs.length - 1];
        addIngredientBtn.disabled = lastInput.value.trim() === ''; // Enable only if last input is filled
    }

    function toggleAddStepButton() {
        const stepInputs = document.querySelectorAll('textarea[name="directions[]"]');
        const lastInput = stepInputs[stepInputs.length - 1];
        addStepBtn.disabled = lastInput.value.trim() === ''; // Enable only if last step is filled
    }

    // Initial toggle state (in case form loads with empty fields)
    toggleAddIngredientButton();
    toggleAddStepButton();

    // Event listeners for adding fields
    addIngredientBtn.addEventListener('click', addIngredient);
    addStepBtn.addEventListener('click', addStep);

    function addIngredient() {
        const ingredientFieldset = document.getElementById('ingredients-fieldset');
        const ingredientRow = document.createElement('div');
        ingredientRow.classList.add('ingredient-row');
        ingredientRow.innerHTML = `
            <input type="text" name="ingredientName[]" placeholder="Ingredient Name" required>
            <button type="button" class="remove-button" onclick="removeField(this)">Remove</button>
        `;
        const input = ingredientRow.querySelector('input');
        input.addEventListener('input', toggleAddIngredientButton); // Add event listener to new input
        ingredientFieldset.insertBefore(ingredientRow, ingredientFieldset.lastElementChild);
        toggleAddIngredientButton(); // Update button state
    }

    function addStep() {
        const directionsFieldset = document.getElementById('addStep-fieldset');
        const directionRow = document.createElement('div');
        directionRow.classList.add('direction-row');
        directionRow.innerHTML = `
            <textarea name="directions[]" placeholder="Next Step..." required></textarea>
            <button type="button" class="remove-button" onclick="removeField(this)">Remove</button>
        `;
        const textarea = directionRow.querySelector('textarea');
        textarea.addEventListener('input', toggleAddStepButton); // Add event listener to new textarea
        directionsFieldset.insertBefore(directionRow, directionsFieldset.lastElementChild);
        toggleAddStepButton(); // Update button state
    }

    // Generic function to remove a dynamically added field
    window.removeField = function (button) {
        button.parentElement.remove();
    };
});

// Validate the form
function validateForm(form) {
    let isValid = true;
    const totalTime = form.totalTime.value.trim();
    const prepTime = form.prepTime.value.trim();
    const cookTime = form.cookTime.value.trim();

    // Check Recipe Details Fields
    if (!totalTime || parseFloat(totalTime) <= 0) {
        alert("Total time must be greater than 0!");
        isValid = false;
    }
    if (!prepTime || parseFloat(prepTime) <= 0) {
        alert("Prep time must be greater than 0!");
        isValid = false;
    }
    if (!cookTime || parseFloat(cookTime) <= 0) {
        alert("Cook time must be greater than 0!");
        isValid = false;
    }

    return isValid; // Return false to prevent form submission if invalid
}
