const loginForm = document.getElementById("login-form");

function toggleForms(form) {
    const loginForm = document.querySelector('.login');
    const signupForm = document.querySelector('.signup');

    if (form === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    } else {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}
// password visibility
function eye() {
    if (document.getElementById('loginPassword').type == "password") {
        document.getElementById('loginPassword').type = "text";
        document.querySelectorAll('.eye')[0].style.visibility = "visible";
        document.querySelectorAll('.eye')[1].style.visibility = "hidden";
    } else {
        document.getElementById('loginPassword').type = "password";
        document.querySelectorAll('.eye')[0].style.visibility = "hidden";
        document.querySelectorAll('.eye')[1].style.visibility = "visible";
    }
}
function signEye() {
    if (document.getElementById('confirm-password').type == "password") {
        document.getElementById('confirm-password').type = "text";
        document.querySelectorAll('.eye')[0].style.visibility = "visible";
        document.querySelectorAll('.eye')[1].style.visibility = "hidden";
    } else {
        document.getElementById('confirm-password').type = "password";
        document.querySelectorAll('.eye')[0].style.visibility = "hidden";
        document.querySelectorAll('.eye')[1].style.visibility = "visible";
    }
}

// Variables for signup
const signupForm = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const errorMessage = document.getElementById('error-message');

// creating new user
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Clear previous error messages
    errorMessage.textContent = '';

    // Validate email format
    if (!validateEmail(email)) {
        errorMessage.textContent = 'Invalid email';
        return; // Stop further execution
    }

    // Collect password validation errors
    const passwordErrors = validatePassword(password);

    // Check if there are any password errors
    if (passwordErrors.length > 0) {
        errorMessage.textContent = passwordErrors.join(' ');
        return; // Stop further execution
    }

    // Validate password match
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match';
        return; // Stop further execution
    }

    // If all validation passes, proceed to create user
    try {
        const response = await fetch('/signUp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                username: email,
                password: password
            })
        });
        const result = await response.json(); // Parse response as JSON
        if (response.status === 400) {
            // This means the email is already in use
            alert(result.message); // Show the alert with the message from the backend
        }
        else if (result.success) {
            alert("Your account has been successfully created. Please log in to continue.");
            window.location.href = '/'; // Redirect to the desired page
        } else {
            alert("Something went wrong! Try again later.");
        }
    } catch (error) {
        alert("Something went wrong! Try again later.");
        console.error('Error submitting form:', error);
    }
});

function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const errors = [];
    const lengthRequirement = password.length >= 8;
    const uppercaseRequirement = /[A-Z]/.test(password);
    const lowercaseRequirement = /[a-z]/.test(password);
    const numberRequirement = /\d/.test(password);
    const specialCharacterRequirement = /[@$!%*?&]/.test(password);

    if (!lengthRequirement) {
        errors.push('Password must be at least 8 characters long.');
    }
    if (!uppercaseRequirement) {
        errors.push('Password must contain at least one uppercase letter.');
    }
    if (!lowercaseRequirement) {
        errors.push('Password must contain at least one lowercase letter.');
    }
    if (!numberRequirement) {
        errors.push('Password must contain at least one number.');
    }
    if (!specialCharacterRequirement) {
        errors.push('Password must contain at least one special character.');
    }

    return errors;
}

// Initially display the login form
document.addEventListener("DOMContentLoaded", function() {
    toggleForms('login'); // Show the login form by default
});

// Login form error message
loginForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // prevent default form submission
    try {
        const usernameInput = document.querySelector('#loginEmail');
        const passwordInput = document.querySelector('#loginPassword');
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value
            })
        });
        const result = await response.json(); // parse response as JSON
        if (!result.success) {
            document.getElementById('login-auth-failed').innerHTML = "*Invalid username or password!";
        }
        if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
        }
    } catch (error) {
        popUp("Something went wrong! try again later.");
        console.error('Error submitting form:', error);
    }
});