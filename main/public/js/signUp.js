
// Sign Up Form Validation
function validate(event) {
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    // Flag to track whether the form is valid
    let isValid = true;

    // Validate name
    if (name === "") {
        alert("Name must not be empty");
        isValid = false;

    }

    // Validate email
    if (email === "") {
        alert("Email must not be empty");
        isValid = false;
    } else if (!email.match(/.+@.+\..+/)) {
        alert("Email must fit the email format (example@domain.edu)");
        isValid = false;
    }

    // Validate password
    if (password === "") {
        alert("Password must not be empty");
        isValid = false;
    }

    // If form is invalid, prevent form submission
    if (!isValid) {
        event.preventDefault();  // Prevent form submission
    }

    return isValid;  // Return whether the form is valid
}

// Attach to the form submission
const signUpForm = document.querySelector('form');
signUpForm.addEventListener('submit', function(event) {
    if (!validate(event)) {
        event.preventDefault();  // Prevent form submission if validation fails
    }
});


setTimeout(() => {
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        message.style.display = 'none';
    });
}, 5000); // Adjust time as needed (5000ms = 5 seconds)