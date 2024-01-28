window.onload = () => {
    if(getAuthToken()){
        const button = document.getElementById("button");
        button.addEventListener("click", sendMessage);
        displayMessages()
    } else {
        window.location.href = '/login';
    }
}

function getAuthToken() {
    return localStorage.getItem('token');
}


function validateText() {
    console.log("Now in function validateText()")
    const text = document.getElementById("textBox").value;
    console.log("text", text.length)

    if (text.length > 0 && text.length <= 140) {
        document.getElementById("hide").style.display = "none";
        sendMessage();
    } else {
        document.getElementById("hide").style.display = "block";
    }
}

function hideButton(display) {
    console.log("Now in function hideButton()", display)
    document.getElementById("hide").style.display = display;
}

async function sendMessage() {
    console.log("Now in function sendMessage()")

    const date = new Date();
    const formatted = date.toISOString().split("T").join(" ").split("Z").join(" ")
    console.log("time", formatted)

    const textBox = document.getElementById('textBox')

    const message = textBox.value;

    const token = getAuthToken(); // Retrieve the JWT token

    if (!token) {
        // Handle the case where the user is not logged in
        console.error('User is not logged in');
        return;
    }

    let success = false;
    fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the JWT token in the headers
        },
        body: JSON.stringify({ message: message, time: formatted })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log("new message", data.message);
            hideButton("none");
            console.log("Success");
            textBox.value = '';
            createMessage(data.message);
        } 
        if (data.status === 'failure') {
            hideButton("block");
            console.log("Failure")
        }
    })
    .catch(error => {
        console.log(error.status);
    })
}

    
async function displayMessages() {

    const token = getAuthToken(); // Retrieve the JWT token

    if (!token) {
        // Handle the case where the user is not logged in
        console.error('User is not logged in');
        return;
    }

    fetch("http://localhost:3000/messages", {
        method: 'GET',
        headers : {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the JWT token in the headers
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Bad response')
            } else { 
                
                response.text().then(function(result) {
                    data = JSON.parse(result);
                    console.log("Data :", data.messages)

                    data.messages.forEach(element => {
                        createMessage(element)
                    });
                
                })  
            }
        })
}

function createMessage(messages) {
    const div = document.createElement("div");
    const text = document.createElement("p");
    const name = document.createElement("p");
    const timeStamp = document.createElement("p");
    const checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");

    div.classList = ["border border-5 bg-light border-secondary p-2 mb-2"];
    checkBox.classList.add("check");
    name.classList.add("fs-6");
    text.classList.add("fs-3");
    timeStamp.classList.add("fs-6");

    name.innerText = messages.sender;
    text.innerText = messages["message"];
    timeStamp.innerText = messages["time"];
    div.appendChild(name);
    div.appendChild(text);
    div.appendChild(timeStamp);
    div.appendChild(checkBox);

    checkBox.addEventListener("click", () => read(checkBox, messages));

    // Get the parent container element
    const parent = document.getElementById("parent");

    // Insert the new message at the beginning of the parent container
    parent.insertBefore(div, parent.firstChild);
}


function read(clickedBox, message) {
    let parent = clickedBox.parentNode;
    if (clickedBox.checked) {
        parent.classList.add("read");
        message.read = true;
    } else {
        parent.classList.remove("read");
        message.read = false;
    }
    patchMessage(message);
}

function patchMessage(message) {
    console.log("State: ", message.read)
    console.log("id: ", message._id)

    const token = getAuthToken(); // Retrieve the JWT token

    if (!token) {
        // Handle the case where the user is not logged in
        console.error('User is not logged in');
        return;
    }

    fetch('http://localhost:3000/messages/' + message._id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({status : message.read})
    })
        .then((response) => {
            if (!response.ok){
                throw new Error('Bad response');
            }
        })
        .catch(err => {
            console.error('Problem with FETCH: ', err);
        })
}