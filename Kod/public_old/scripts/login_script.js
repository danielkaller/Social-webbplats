window.onload = () => {
    const loginButton = document.getElementById("loginButton");
    loginButton.addEventListener("click", loginUser);
}

function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Perform AJAX request to login endpoint
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // Login successful
            localStorage.setItem('token', data.token);
            window.location.href = '/'; // Redirect to dashboard or another page
        } else {
            // Login failed
            console.error('Login failed');
            // Display an error message to the user on the login page
        }
    })
    .catch(error => {
        console.error(error);
        // Handle other errors here
    });
}