function redirect() {
    window.location.href = "/signUp"; // Redirects to the route handled by Express
}

//might remove this since we have the required fields set on the ejs file
function validate(event) {
    // Get the form input values
    const email = document.getElementById('logInEmail').value;
    const password = document.getElementById('loginPassword').value;
    let isValid = true;

    // Validate the input fields
    if (email === "") {
        alert("Username must not be empty");
        event.preventDefault();
        isValid = false;
    }
    if (password === "") {
        alert("Password must not be empty");
        event.preventDefault();
        isValid = false;
    }
    app.post('/login', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) return res.status(500).send({ message: 'An unexpected error occurred.' });
            if (!user) return res.status(401).send(info);
            req.login(user, (err) => {
                if (err) return res.status(500).send({ message: 'Login failed.' });
                return res.status(200).send({ message: 'Login successful', user });
            });
        })(req, res, next);
    });

    // If form is invalid, prevent form submission
    if (!isValid) {
        event.preventDefault();  // Prevent form submission
    }

    return isValid;  // Return whether the form is valid
}

// Attach to the form submission
const loginForm = document.querySelector('form');
loginForm.addEventListener('submit', function(event) {
    if (!validate(event)) {
        event.preventDefault();  // Prevent form submission if validation fails
    }
});

