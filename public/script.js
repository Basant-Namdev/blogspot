const loginForm = document.getElementById("login-form");

// login form error message

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
        })
        const result = await response.json(); // parse response as JSON
        if (!result.success) {
            document.getElementById('login-auth-failed').innerHTML = "*Invalid username or password!";
        }
        if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
          }
    } catch (error) {
        popUp("Something went wrong! try again later.")
        console.error('Error submitting form:', error);
    }
})