//  WITH THESE EXPLICIT PATHS:
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 2. Define your configuration object literal
const firebaseConfig = {
  apiKey: "AIzaSyCsWXLc_6ug45IGN4wL0-DoycYnxgx8dag",
  authDomain: "mabel-90f81.firebaseapp.com",
  projectId: "mabel-90f81",
  storageBucket: "mabel-90f81.firebasestorage.app",
  messagingSenderId: "987100459583",
  appId: "1:987100459583:web:75df60626b3eb43be83e8a",
  databaseURL: "https://mabel-90f81-default-rtdb.firebaseio.com" 
};

// 3. INITIALIZE SECURE LIFECYCLE SERVICES
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetForm");
    const resetEmailInput = document.getElementById("resetEmail");
    const resetSubmitBtn = document.getElementById("resetSubmitBtn");
    const alertBox = document.getElementById("alertBox");

    // 🛠️ FIXED: Rewritten helper utility to cleanly sync with your glassmorphism styles
    const renderAlertMessage = (messageText, alertType) => {
        if (!alertBox) return;
        alertBox.textContent = messageText;
        alertBox.style.display = "block"; // Explicitly unhide element container
        
        if (alertType === "success") {
            // Transform color layouts to reflect successful transitions safely
            alertBox.style.background = "rgba(34, 197, 94, 0.1)";
            alertBox.style.borderColor = "rgba(34, 197, 94, 0.3)";
            alertBox.style.color = "#22c55e";
        } else {
            // Restore default stylesheet error metrics
            alertBox.style.background = "rgba(244, 63, 94, 0.1)";
            alertBox.style.borderColor = "rgba(244, 63, 94, 0.2)";
            alertBox.style.color = "var(--error-color)";
        }
    };

    if (resetForm) {
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailValue = resetEmailInput.value.trim();

            // Hide previous alerts when attempting a new transmission
            if (alertBox) alertBox.style.display = "none";

            // Simple Client-Side Input Empty Sanity Check Step
            if (!emailValue) {
                renderAlertMessage("Please type in your registered email account path first.", "error");
                return;
            }

            // Update button layout state to indicate active communication loops
            if (resetSubmitBtn) {
                resetSubmitBtn.disabled = true;
                resetSubmitBtn.innerHTML = '<span>Sending Link...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
            }

            try {
                // Execute Firebase Native Password Recovery Communication Vector
                await sendPasswordResetEmail(auth, emailValue);

                // Success State updates: Inform client of success sequence
                renderAlertMessage("Reset confirmation sent! Check your email inbox and spam filters for instructions.", "success");
                resetForm.reset();

            } catch (firebaseError) {
                console.error("Firebase Password Reset Communication Failure Exception:", firebaseError);
                
                // Human-readable fallback interface translations
                let userFriendlyError = "Failed to dispatch recovery link. Verify connection lines or system access setups.";
                
                switch (firebaseError.code) {
                    case "auth/invalid-email":
                        userFriendlyError = "The structured format of that email string appears invalid.";
                        break;
                    case "auth/user-not-found":
                        userFriendlyError = "There is no registered account linked to that email path address.";
                        break;
                    case "auth/too-many-requests":
                        userFriendlyError = "Access loop blocked due to traffic spikes. Wait 180 seconds before testing again.";
                        break;
                }

                renderAlertMessage(userFriendlyError, "error");

            } finally {
                // Standard structural rollback: Restore submit interaction state values cleanly
                if (resetSubmitBtn) {
                    resetSubmitBtn.disabled = false;
                    resetSubmitBtn.innerHTML = '<span>Send Reset Link</span> <i class="fa-solid fa-paper-plane" style="font-size: 0.85rem;"></i>';
                }
            }
        });
    }
});