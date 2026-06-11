import { auth, db } from "./config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationSelect = document.getElementById('location'); // Added location reference
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

    // Toggle main password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Toggle confirm password visibility
    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        toggleConfirmPassword.classList.toggle('fa-eye');
        toggleConfirmPassword.classList.toggle('fa-eye-slash');
    });

    // Form submission validation
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;

        // Name validation
        if (fullnameInput.value.trim() === '') {
            fullnameInput.parentElement.classList.add('invalid');
            isValid = false;
        } else {
            fullnameInput.parentElement.classList.remove('invalid');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            emailInput.parentElement.classList.add('invalid');
            isValid = false;
        } else {
            emailInput.parentElement.classList.remove('invalid');
        }

        // Phone validation (Basic empty or format check)
        if (phoneInput.value.trim() === '') {
            phoneInput.parentElement.classList.add('invalid');
            isValid = false;
        } else {
            phoneInput.parentElement.classList.remove('invalid');
        }

        // Location Dropdown validation
        if (locationSelect.value === '') {
            locationSelect.parentElement.classList.add('invalid');
            isValid = false;
        } else {
            locationSelect.parentElement.classList.remove('invalid');
        }

        // Password validation (min 6 characters)
        if (passwordInput.value.length < 6) {
            passwordInput.parentElement.classList.add('invalid');
            isValid = false;
        } else {
            passwordInput.parentElement.classList.remove('invalid');
        }

        // Confirm Password validation
        if (confirmPasswordInput.value !== passwordInput.value || confirmPasswordInput.value === '') {
            confirmPasswordInput.parentElement.classList.add('invalid');
            isValid = false;
        } else {
            confirmPasswordInput.parentElement.classList.remove('invalid');
        }

        // Terms Checkbox validation
        if (!termsCheckbox.checked) {
            alert('You must accept the terms and conditions to register.');
            isValid = false;
        }

        // If frontend validation passes, connect to Firebase
        if (isValid) {
            const name = fullnameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const location = locationSelect.value;
            const password = passwordInput.value;

            try {
                // 1. Create the user authentication account
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Write the user's name, phone, and location into your Firestore database
                await setDoc(doc(db, "users", user.uid), {
                    fullName: name,
                    email: email,
                    phone: phone,
                    location: location,
                    createdAt: new Date()
                });

                alert('Registration successful for JOSHIPRO!');
                window.location.href = 'login.html'; // Redirect to sign in page
                
            } catch (error) {
                // Catches errors like "email already in use" directly from Firebase
                alert(`Registration Failed: ${error.message}`);
            }
        }
    });

    // Event listeners to instantly clear invalid visual styling as the user changes inputs
    [fullnameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.parentElement.classList.contains('invalid')) {
                input.parentElement.classList.remove('invalid');
            }
        });
    });

    // Handle change tracking separately for the location select dropdown
    locationSelect.addEventListener('change', () => {
        if (locationSelect.parentElement.classList.contains('invalid')) {
            locationSelect.parentElement.classList.remove('invalid');
        }
    });
});
