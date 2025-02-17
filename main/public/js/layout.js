const SCROLL_THRESHOLD = 50;
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav'); // Select the nav element
    const tabs = document.querySelectorAll('.tabs a');

    if (window.scrollY > SCROLL_THRESHOLD) {  // Adjust scroll threshold as needed
        header.classList.add('header-scrolled');
        nav.classList.add('tabs-scrolled'); // Add class to nav
        tabs.forEach(tab => tab.classList.add('tabs-scrolled')); // Optional: add class to tabs
    } else {
        header.classList.remove('header-scrolled');
        nav.classList.remove('tabs-scrolled'); // Remove class from nav
        tabs.forEach(tab => tab.classList.remove('tabs-scrolled')); // Optional: remove class from tabs
    }
});

// Add event listener for user info dropdown
document.addEventListener('DOMContentLoaded', function() {
    const userInfo = document.querySelector('.user-info');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    // Toggle dropdown visibility
    userInfo.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default link behavior
        dropdownMenu.classList.toggle('show'); // Toggle dropdown visibility
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!userInfo.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
});

function confirmLogout() {
    // Confirm the logout action
    const userConfirmed = confirm('Are you sure you want to logout?');

    if (userConfirmed) {
        // Redirect to the server's logout route if confirmed
        window.location.href = '/logout'; // This triggers the backend route for logging out
    }

    // Return false to prevent the default action of the link (navigation)
    return false;
}

document.querySelectorAll('.dropdown-menu a').forEach((link) => {
    link.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop the event from propagating to the parent
    });
});

// Allow the outer user-info-link to navigate if no dropdown is clicked
document.querySelector('.user-info-link').addEventListener('click', (e) => {
    // Optional: Add logic here to handle navigation or dropdown toggling
    console.log('User info link clicked'); // Debugging log
});
