// ==========================================
// 1. FIREBASE INTERFACE INJECTIONS
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const compactLayout = document.getElementById("compactLayout"); 
const langSelect = document.getElementById("langSelect");       
const emailNotif = document.getElementById("emailNotif");
const settingsStatusMsg = document.getElementById("settingsStatusMsg");

// Navigation Top-Bar Avatar Handles
const userAvatar = document.getElementById("userAvatar"); 
const profileBtn = document.getElementById("profileBtn");

let userId = null;

// ✅ NEW OPERATIONAL FEATURE: Applies the theme directly to the HTML body container
function applyTheme(themeName) {
    document.body.setAttribute("data-theme", themeName);
    console.log(`Workspace theme set to: ${themeName}`);
}

// Helper function to cleanly project circular, non-stretching avatars onto navigation layouts
function renderSecureAvatar(targetElement, user, customImageUrl = null) {
    if (!targetElement) return;
    const imageSrc = customImageUrl ? customImageUrl : (user.photoURL ? user.photoURL : "../assets/logo.png");
    
    targetElement.innerHTML = `
        <img src="${imageSrc}" alt="User Avatar" class="avatar-img-element" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">
    `;
    
    const imgTag = targetElement.querySelector('.avatar-img-element');
    if (imgTag) {
        imgTag.onerror = () => {
            if (user.email) {
                targetElement.innerHTML = user.email.charAt(0).toUpperCase();
                targetElement.style.fontWeight = '600';
                targetElement.style.background = 'linear-gradient(135deg, #6366f1, #a855f7)';
                targetElement.style.color = 'white';
                targetElement.style.display = 'flex';
                targetElement.style.alignItems = 'center';
                targetElement.style.justifyContent = 'center';
                targetElement.style.borderRadius = '50%';
            }
        };
    }
}

// ==========================================
// 2. CHECK SECURITY SESSION & INITIALIZE SYSTEM VALUE STATES
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        console.log("Settings connected for user ID:", userId);

        renderSecureAvatar(userAvatar, user);
        renderSecureAvatar(profileBtn, user);

        onSnapshot(doc(db, "users", userId), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data && data.profileImage) {
                    renderSecureAvatar(userAvatar, user, data.profileImage);
                    renderSecureAvatar(profileBtn, user, data.profileImage);
                }
            }
        });

        try {
            const userDocRef = doc(db, "users", userId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                
                if (data.settings) {
                    const savedTheme = data.settings.theme || "light";
                    if (themeSelect) themeSelect.value = savedTheme;
                    applyTheme(savedTheme); // ✅ LIVE INJECTION: Apply saved theme immediately on load
                    
                    if (compactLayout) compactLayout.checked = data.settings.isCompact ?? false; 
                    if (langSelect) langSelect.value = data.settings.language || "en";           
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

// ✅ LIVE RESPONSIVENESS: Apply the changes immediately when the user alters the select block
if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
        applyTheme(e.target.value);
    });
}

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

        const chosenTheme = themeSelect ? themeSelect.value : "light";
        
        const userSettingsData = {
            settings: {
                theme: chosenTheme,
                isCompact: compactLayout ? compactLayout.checked : false, 
                language: langSelect ? langSelect.value : "en",           
                emailNotifications: emailNotif ? emailNotif.checked : false,
                lastSavedAt: new Date().toISOString()
            }
        };

        try {
            const userDocRef = doc(db, "users", userId);
            await setDoc(userDocRef, userSettingsData, { merge: true });

            applyTheme(chosenTheme); // ✅ Double check color update states match on click submission

            if (settingsStatusMsg) {
                settingsStatusMsg.style.color = "#4ade80";
                settingsStatusMsg.textContent = "🎉 Application adjustments updated securely!";
                
                setTimeout(() => {
                    settingsStatusMsg.textContent = "";
                }, 4000);
            }
        } catch (error) {
            console.error("Error saving user configurations:", error);
            if (settingsStatusMsg) {
                settingsStatusMsg.style.color = "#f87171";
                settingsStatusMsg.textContent = "Error saving changes. Verify your database connection.";
            }
        }
    });
}

// Global Navigation Menu Layout Toggle Event System Handler Execution Operation
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const profileBtnEl = document.getElementById("profileBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    if (menuBtn && sidebar) {
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("active");
        };
        document.addEventListener("click", (e) => {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.remove("active");
            }
        });
    }

    if (profileBtnEl && dropdownMenu) {
        profileBtnEl.onclick = (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle("show");
        };
        document.addEventListener("click", (e) => {
            if (!profileBtnEl.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove("show");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            if (confirm("Sign out of current JOSHIPRO session?")) {
                await auth.signOut();
                window.location.href = "login.html";
            }
        };
    }
});