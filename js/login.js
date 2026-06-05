import { auth } from "./config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // Password visibility toggle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon classes
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Form submission and validation
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            emailInput.parentElement.classList.add('invalid');
            isValid = false;
        } else {
            emailInput.parentElement.classList.remove('invalid');
        }

        // Password validation (min 6 characters)
        if (passwordInput.value.length < 6) {
            passwordInput.parentElement.classList.add('invalid');
            isValid = false;
        } else {
            passwordInput.parentElement.classList.remove('invalid');
        }

        // If everything is correct, execute Firebase login
        if (isValid) {
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                // Request sign-in token from Firebase
                await signInWithEmailAndPassword(auth, email, password);
                alert('Welcome back to JOSHIPRO!');
                window.location.href = 'dashboard.html'; // Redirect to your application dashboard
                
            } catch (error) {
                // Handles invalid password or missing account errors safely
                alert(`Login Failed: ${error.message}`);
            }
        }
    });

    // Clear validation errors on type
    emailInput.addEventListener('input', () => {
        if (emailInput.parentElement.classList.contains('invalid')) {
            emailInput.parentElement.classList.remove('invalid');
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.parentElement.classList.contains('invalid')) {
            passwordInput.parentElement.classList.remove('invalid');
        }
    });
});
