// ==========================================
// 1. FIREBASE INTERFACE INJECTIONS
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const settingsForm = document.getElementById("settingsForm");
const themeSelect = document.getElementById("themeSelect");
const emailNotif = document.getElementById("emailNotif");
const settingsStatusMsg = document.getElementById("settingsStatusMsg");

let userId = null;

// ==========================================
// 2. CHECK SECURITY SESSION & INITIALIZE SYSTEM VALUE STATES
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        console.log("Settings connected for user ID:", userId);

        try {
            // Fetch configuration maps from the user's dedicated document record path
            const userDocRef = doc(db, "users", userId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                
                // If the user has saved settings preferences previously, inject them into the controls
                if (data.settings) {
                    if (themeSelect) themeSelect.value = data.settings.theme || "light";
                    if (emailNotif) emailNotif.checked = data.settings.emailNotifications ?? false;
                }
            }
        } catch (error) {
            console.error("Error retrieving settings configuration datasets:", error);
        }
    } else {
        console.warn("Unauthorized visitor session. Redirecting to login gate...");
        window.location.href = "login.html";
    }
});

// ==========================================
// 3. PERSIST SETTINGS MODIFICATIONS
// ==========================================
if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!userId) {
            if (settingsStatusMsg) {
                settingsStatusMsg.style.color = "#f87171";
                settingsStatusMsg.textContent = "Error: Session timed out. Please log in again.";
            }
            return;
        }

        // Bundle configurations together neatly under a nested 'settings' scope
        const userSettingsData = {
            settings: {
                theme: themeSelect ? themeSelect.value : "light",
                emailNotifications: emailNotif ? emailNotif.checked : false,
                lastSavedAt: new Date().toISOString()
            }
        };

        try {
            const userDocRef = doc(db, "users", userId);
            
            // Using merge: true guarantees we preserve existing fields like name, bio, and profileImage
            await setDoc(userDocRef, userSettingsData, { merge: true });

            if (settingsStatusMsg) {
                settingsStatusMsg.style.color = "#4ade80";
                settingsStatusMsg.textContent = "🎉 Application adjustments updated securely!";
                
                setTimeout(() => {
                    settingsStatusMsg.textContent = "";
                }, 4000);
            }
            console.log("Configuration parameters successfully merged into Firestore profile tracking document.");
        } catch (error) {
            console.error("Error saving user configurations:", error);
            if (settingsStatusMsg) {
                settingsStatusMsg.style.color = "#f87171";
                settingsStatusMsg.textContent = "Error saving changes. Verify your database connection.";
            }
        }
    });
}