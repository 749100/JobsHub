//  WITH THESE EXPLICIT PATHS:
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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

// 3. INITIALIZE APPS AND UTILITIES CLEANLY
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Combined DOM element selections
const userInfo = document.getElementById('userInfo');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById("userAvatar"); 

// ==========================================
// 4. Manage User Session Status & Live Profile Updates (Firebase Auth)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        
        // Display user email inside the main welcome card
        if (userInfo) userInfo.innerHTML = `Logged in securely as: <strong>${user.email}</strong>`;
        
        // Set up the base initials as a fallback initially
        if (user.email && userAvatar) {
            userAvatar.innerHTML = user.email.charAt(0).toUpperCase();
            userAvatar.style.fontWeight = '600';
            userAvatar.style.background = 'linear-gradient(135deg, #6366f1, #a855f7)';
            userAvatar.style.color = 'white';
        }

        // ✅ FIXED: Live listener pointing to the precise Firestore document reference signature
        const userProfileRef = doc(db, "users", userId);
        
        onSnapshot(userProfileRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                // If a profile image exists, gracefully swap out the fallback initials
                if (data && data.profileImage && userAvatar) {
                    userAvatar.innerHTML = `<img src="${data.profileImage}" alt="User Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
                }
            }
        }, (error) => {
            console.error("Live profile snapshot sync failed:", error);
        });

    } else {
        // Secure Route: Force unauthenticated visitors back to the login screen
        window.location.href = 'login.html'; 
    }
});

// ==========================================
// 5. Left Side Menu Button (Sidebar Toggle)
// ==========================================
if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (sidebar) sidebar.classList.toggle('active');
        if (dropdownMenu) dropdownMenu.classList.remove('active'); 
    });
}

// ==========================================
// 6. Right Side Profile Button (Avatar Dropdown Toggle)
// ==========================================
if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (dropdownMenu) dropdownMenu.classList.toggle('active');
        if (sidebar) sidebar.classList.remove('active'); 
    });
}

// ==========================================
// 7. Click Outside to Close Active Menus
// ==========================================
document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuBtn) {
        sidebar.classList.remove('active');
    }
    if (dropdownMenu && dropdownMenu.classList.contains('active')) {
        dropdownMenu.classList.remove('active');
    }
});

// ==========================================
// 8. Handle Application Log Out
// ==========================================
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                alert("Logged out successfully from JOSHIPRO!");
                window.location.href = 'login.html';
            })
            .catch((error) => {
                console.error("Error signing out from Firebase:", error);
                alert(`Logout Failed: ${error.message}`);
            });
    });
}