window.onload = () => {
    const registerButton = document.getElementById("registerButton");
    registerButton.addEventListener("click", registerUser);
}

function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Perform AJAX request to register endpoint
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'User registered successfully') {
            // Registration successful
            console.log('Registration successful');
            // Display a success message to the user on the registration page
        } else {
            // Registration failed
            console.error('Registration failed');
            // Display an error message to the user on the registration page
        }
    })
    .catch(error => {
        console.error(error);
        // Handle other errors here
    });
}