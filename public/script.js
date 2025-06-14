document.addEventListener("DOMContentLoaded", function () {
    setOnClick();
    setupFormHandlers();
    updateLoginModalTrigger();
    window.addEventListener("resize", updateLoginModalTrigger);
});

function setOnClick() {
    document.getElementById('start-home').addEventListener('click', () => toggleForms('signup'))
    document.getElementById('belowLogin').addEventListener('click', () => toggleForms('signup'))
    document.getElementById('belowSign').addEventListener('click', () => toggleForms('login'))
    document.getElementById('modalBL').addEventListener('click', () => toggleForms('signup', true))
    document.getElementById('modalBS').addEventListener('click', () => toggleForms('login', true))
    for (let button of document.getElementsByClassName('read-more')) {
        button.addEventListener('click', () => {
            Swal.fire({
                icon: 'info',
                title: 'Login Required',
                text: 'Please log in to read the full post.',
            });
        });
    }


}
// Function to setup event handlers for login and signup forms
function setupFormHandlers() {
    const loginForm = document.getElementById("login-form");
    const loginFormBt = document.getElementById("login-form-bt");

    const signupForm = document.getElementById("signup-form");
    const signupFormBt = document.getElementById("signup-form-bt");

    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (loginFormBt) loginFormBt.addEventListener("submit", handleLogin);

    if (signupForm) signupForm.addEventListener("submit", handleSignup);
    if (signupFormBt) signupFormBt.addEventListener("submit", handleSignup);
}

// Function to toggle between login and signup forms
function toggleForms(form, isModal = false) {
    const loginForm = isModal ? document.querySelector('.login-bt') : document.querySelector('.login');
    const signupForm = isModal ? document.querySelector('.signup-bt') : document.querySelector('.signup');

    if (form === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    } else {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}

// Function to handle login submission
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const usernameInput = form.querySelector("input[name='username']");
    const passwordInput = form.querySelector("input[name='password']");
    const errorMessage = form.querySelector("span[id^='login-auth-failed']"); // Works for both main and modal

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                username: usernameInput.value,
                password: passwordInput.value
            })
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = result.redirectUrl; // Redirect on success
        } else {
            errorMessage.textContent = "*Invalid username or password!";
        }
    } catch (error) {
        alert("Something went wrong! Try again later.");
        console.error(error);
    }
}

// Function to handle signup submission
async function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector("input[name='name']").value.trim();
    const email = form.querySelector("input[name='username']").value.trim();
    const password = form.querySelector("input[name='password']").value.trim();
    const confirmPassword = form.querySelector("input[name='confirm-password']").value.trim();
    const errorMessage = form.querySelector("span[id^='error-message']"); // Works for both main and modal

    if (!validateEmail(email)) {
        errorMessage.textContent = "Invalid email";
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match";
        return;
    }
    // Clear previous error messages
    errorMessage.textContent = '';

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

    try {
        const response = await fetch("/signUp", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ name, username: email, password })
        });

        const result = await response.json();
        if (response.status === 400) {
            alert(result.message);
        } else if (result.success) {
            alert("Your account has been successfully created. Please log in.");
            window.location.href = "/";
        } else {
            alert("Something went wrong! Try again later.");
        }
    } catch (error) {
        alert("Something went wrong! Try again later.");
        console.error(error);
    }
}

// Function to validate email format
function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

// Function to setup modal login/register click behavior
function updateLoginModalTrigger() {
    console.log("in");

    const loginRegisterLink = document.getElementById("login-register");
    const registerLink = document.getElementById('start-home')
    loginRegisterLink.removeEventListener("click", toggleForms);
    registerLink.removeEventListener("click", toggleForms);


    if (window.innerWidth < 880) {
        loginRegisterLink.setAttribute("data-bs-toggle", "modal");
        loginRegisterLink.setAttribute("data-bs-target", "#loginModal");
        loginRegisterLink.addEventListener("click", () => toggleForms('login', true));
        registerLink.setAttribute("data-bs-toggle", "modal");
        registerLink.setAttribute("data-bs-target", "#loginModal");
        registerLink.addEventListener("click", () => toggleForms('signup', true));
    } else {
        loginRegisterLink.removeAttribute("data-bs-toggle");
        loginRegisterLink.removeAttribute("data-bs-target");
        loginRegisterLink.addEventListener("click", () => toggleForms('login', false));
        registerLink.removeAttribute("data-bs-toggle");
        registerLink.removeAttribute("data-bs-target");
        registerLink.addEventListener("click", () => toggleForms('signup', false));
    }
}

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
// Toggle password visibility for the correct input field
function togglePasswordVisibility(eyeIcon) {
    // Find the nearest password input field
    const parentDiv = eyeIcon.closest("div");
    const passwordInput = parentDiv.querySelector("input[type='password'], input[type='text']");
    const eyeOpen = parentDiv.querySelector(".fa-eye");
    const eyeClosed = parentDiv.querySelector(".fa-eye-slash");

    if (passwordInput) {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeOpen.style.display = "inline-block";
            eyeClosed.style.display = "none";
        } else {
            passwordInput.type = "password";
            eyeOpen.style.display = "none";
            eyeClosed.style.display = "inline-block";
        }
    }
}

// Attach event listeners to all eye icons
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".eye").forEach((eyeIcon) => {
        eyeIcon.addEventListener("click", function () {
            togglePasswordVisibility(this);
        });
    });
});

