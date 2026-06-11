import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =========================================================================
// CONFIGURATION INTEGRATION MATRIX
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCsWXLc_6ug45IGN4wL0-DoycYnxgx8dag",
  authDomain: "mabel-90f81.firebaseapp.com",
  projectId: "mabel-90f81",
  storageBucket: "mabel-90f81.firebasestorage.app",
  messagingSenderId: "987100459583",
  appId: "1:987100459583:web:75df60626b3eb43be83e8a",
  databaseURL: "https://mabel-90f81-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
const auth = getAuth(app);

// Nodes Registry Mapping
const settingsForm = document.getElementById("settingsForm");
const passwordForm = document.getElementById("passwordForm");
const settingsName = document.getElementById("settingsName");
const settingsImage = document.getElementById("settingsImage");
const settingsLocation = document.getElementById("settingsLocation");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const logoutBtn = document.getElementById("logoutBtn");
const alertBox = document.getElementById("alertBox");

// 🖼️ Profile Avatar Elements Mapping
const avatarPreviewDisplay = document.getElementById("avatarPreviewDisplay");
const avatarFallbackIcon = document.getElementById("avatarFallbackIcon");

let currentUserId = null;

// Clean feedback banner processor
const displayFeedback = (msg, statusType) => {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Pin focus to notification window
    
    if (statusType === "success") {
        alertBox.style.background = "rgba(34, 197, 94, 0.1)";
        alertBox.style.borderColor = "rgba(34, 197, 94, 0.3)";
        alertBox.style.color = "#22c55e";
    } else {
        alertBox.style.background = "rgba(244, 63, 94, 0.1)";
        alertBox.style.borderColor = "rgba(244, 63, 94, 0.2)";
        alertBox.style.color = "var(--error-color)";
    }
};

// 🖼️ Helper utility to safely manage dynamic avatar rendering states
const updateAvatarPreview = (url) => {
    if (!avatarPreviewDisplay || !avatarFallbackIcon) return;
    
    if (url && url.trim() !== "") {
        avatarPreviewDisplay.src = url.trim();
        avatarPreviewDisplay.style.display = "block";
        avatarFallbackIcon.style.display = "none";
        
        // Safety Fallback Check: Revert to icon if the image URL fails or returns 404
        avatarPreviewDisplay.onerror = () => {
            avatarPreviewDisplay.style.display = "none";
            avatarFallbackIcon.style.display = "block";
        };
    } else {
        avatarPreviewDisplay.style.display = "none";
        avatarFallbackIcon.style.display = "block";
    }
};

// =========================================================================
// SESSION VERIFICATION & DATA SYNC
// =========================================================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        try {
            const userDocRef = doc(db, "users", currentUserId);
            const docSnapshot = await getDoc(userDocRef);
            
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                if (userData.displayName) settingsName.value = userData.displayName;
                if (userData.location) settingsLocation.value = userData.location;
                
                if (userData.profileImage) {
                    settingsImage.value = userData.profileImage;
                    updateAvatarPreview(userData.profileImage); // Sync picture frame on data load
                }
            } else if (user.displayName) {
                settingsName.value = user.displayName;
            }
        } catch (error) {
            console.error("Profile sync drop issue:", error);
        }
    } else {
        window.location.href = "login.html";
    }
});

// =========================================================================
// ACTION HANDLER 1: SAVE REGISTRY SETTINGS
// =========================================================================
if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentUserId) return;
        if (alertBox) alertBox.style.display = "none";

        const nameValue = settingsName.value.trim();
        if (!nameValue) {
            displayFeedback("The Name string input area cannot be sent empty.", "error");
            return;
        }

        saveSettingsBtn.disabled = true;
        const baselineText = saveSettingsBtn.innerHTML;
        saveSettingsBtn.innerHTML = '<span>Synchronizing Profile...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            await setDoc(doc(db, "users", currentUserId), {
                displayName: nameValue,
                profileImage: settingsImage.value.trim(),
                location: settingsLocation.value.trim(),
                lastUpdated: new Date()
            }, { merge: true });

            displayFeedback("🎉 Profile registry metrics successfully updated!", "success");
        } catch (err) {
            displayFeedback(`Registry Update Failure: ${err.message}`, "error");
        } finally {
            saveSettingsBtn.disabled = false;
            saveSettingsBtn.innerHTML = baselineText;
        }
    });
}

// 🖼️ Live input observer to catch pasted URLs immediately
if (settingsImage) {
    settingsImage.addEventListener("input", (e) => {
        updateAvatarPreview(e.target.value);
    });
}

// =========================================================================
// ACTION HANDLER 2: SECURE PASSWORD LIVE EXECUTOR
// =========================================================================
if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (alertBox) alertBox.style.display = "none";

        const passValue = newPassword.value;
        const confirmValue = confirmPassword.value;

        if (passValue.length < 6) {
            displayFeedback("Security Protection Error: Password must contain at least 6 characters.", "error");
            return;
        }
        if (passValue !== confirmValue) {
            displayFeedback("String Verification Interrupted: Inputs do not match match precisely.", "error");
            return;
        }

        changePasswordBtn.disabled = true;
        const baselinePassText = changePasswordBtn.innerHTML;
        changePasswordBtn.innerHTML = '<span>Re-keying Token...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const userInstance = auth.currentUser;
            if (userInstance) {
                await updatePassword(userInstance, passValue);
                displayFeedback("🔐 Password token string updated perfectly across active systems!", "success");
                passwordForm.reset();
            }
        } catch (passError) {
            console.error("Password change runtime failure:", passError);
            if (passError.code === "auth/requires-recent-login") {
                displayFeedback("🛑 Security Boundary Blocked: This action requires a fresh authentication verification. Please log out and back in to reset.", "error");
            } else {
                displayFeedback(`Modification Failure: ${passError.message}`, "error");
            }
        } finally {
            changePasswordBtn.disabled = false;
            changePasswordBtn.innerHTML = baselinePassText;
        }
    });
}

// =========================================================================
// PASSWORD TOGGLE VISIBILITY SYSTEM UTILITIES
// =========================================================================
const configureEyeToggle = (triggerId, fieldId) => {
    const trigger = document.getElementById(triggerId);
    const targetField = document.getElementById(fieldId);
    if (trigger && targetField) {
        trigger.addEventListener("click", () => {
            const activeType = targetField.getAttribute("type") === "password" ? "text" : "password";
            targetField.setAttribute("type", activeType);
            trigger.classList.toggle("fa-eye");
            trigger.classList.toggle("fa-eye-slash");
        });
    }
};
configureEyeToggle("toggleNewPassword", "newPassword");
configureEyeToggle("toggleConfirmPassword", "confirmPassword");

// =========================================================================
// SYSTEM LOGOUT LIFECYCLE ROUTE
// =========================================================================
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth)
            .then(() => { window.location.href = "login.html"; })
            .catch((err) => { console.error("Session shutdown trace interrupt:", err); });
    });
}