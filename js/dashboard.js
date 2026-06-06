//  WITH THESE EXPLICIT PATHS:
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
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

// Combined DOM element selections matching dashboard.html
const userInfo = document.getElementById('userInfo');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById("userAvatar"); 

// Helper function to lock sizing attributes cleanly onto profile containers
function enforceAvatarStyling(targetElement) {
    if (!targetElement) return;
    targetElement.style.width = "40px";
    targetElement.style.height = "40px";
    targetElement.style.borderRadius = "50%";
    targetElement.style.overflow = "hidden";
    targetElement.style.display = "inline-block";
    targetElement.style.cursor = "pointer";
}

// Helper function to assemble image tags correctly
function buildAvatarHtml(srcString) {
    return `<img src="${srcString}" alt="User Avatar" class="avatar-img-element" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
}

// Helper function to manage letter fallback profiles if images break
function applyTextFallback(targetElement, email) {
    if (!targetElement || !email) return;
    targetElement.innerHTML = email.charAt(0).toUpperCase();
    targetElement.style.fontWeight = '600';
    targetElement.style.background = 'linear-gradient(135deg, #6366f1, #a855f7)';
    targetElement.style.color = 'white';
    targetElement.style.display = 'flex';
    targetElement.style.alignItems = 'center';
    targetElement.style.justifyContent = 'center';
    targetElement.style.fontSize = '14px';
}

// ==========================================
// 📊 REAL-TIME DASHBOARD STATS ENGINE
// ==========================================
function startDashboardCounters(userId) {
    console.log("Dashboard metric streaming pipelines initialized for:", userId);

    // 1. Live count total system jobs posted ecosystem-wide -> Targets id="totalJobs"
    const totalJobsQuery = query(collection(db, "jobs"), where("status", "==", "Active"));
    onSnapshot(totalJobsQuery, (snapshot) => {
        const totalJobsCountElement = document.getElementById("totalJobs");
        if (totalJobsCountElement) {
            totalJobsCountElement.textContent = snapshot.size;
        }
    }, (err) => console.error("Error updates counting total jobs:", err));

    // 2. Live count candidate submission interactions -> Targets id="activeApplications" and id="savedJobs"
    const appsSentQuery = query(collection(db, "applications"), where("applicantId", "==", userId));
    onSnapshot(appsSentQuery, (snapshot) => {
        const activeApps = snapshot.docs.filter(doc => doc.data().status !== "ArchivedByApplicant");
        
        // Update Applications Sent Metric Display Box
        const appsSentElement = document.getElementById("activeApplications");
        if (appsSentElement) {
            appsSentElement.textContent = activeApps.length;
        }

        // 3. Extract items matching Pending evaluation status -> Targets id="savedJobs"
        const pendingApps = activeApps.filter(doc => doc.data().status === "Pending" || !doc.data().status);
        const pendingReviewElement = document.getElementById("savedJobs");
        if (pendingReviewElement) {
            pendingReviewElement.textContent = pendingApps.length;
        }
    }, (err) => console.error("Error processing candidate tracking loops:", err));
}

// ==========================================
// 4. Manage User Session Status & Live Profile Updates (Firebase Auth)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        
        // Display user email inside the main welcome card
        if (userInfo) userInfo.innerHTML = `Logged in securely as: <strong>${user.email}</strong>`;
        
        // Enforce hard layout bounds on targets to isolate sizing distortion
        enforceAvatarStyling(userAvatar);
        enforceAvatarStyling(profileBtn);

        // 1. Establish initial avatar fallback image settings
        const defaultImage = user.photoURL ? user.photoURL : "../assets/logo.png";
        const imageMarkup = buildAvatarHtml(defaultImage);

        if (userAvatar) userAvatar.innerHTML = imageMarkup;
        if (profileBtn) profileBtn.innerHTML = imageMarkup;
            
        // Safe image monitoring loop across injected targets
        const triggerFallbackChecks = (element) => {
            if (!element) return;
            const imgElement = element.querySelector('.avatar-img-element');
            if (imgElement) {
                imgElement.onerror = () => applyTextFallback(element, user.email);
            }
        };
        
        triggerFallbackChecks(userAvatar);
        triggerFallbackChecks(profileBtn);

        // 2. Continuous real-time listener targeting your precise Firestore profile parameters
        const userProfileRef = doc(db, "users", userId);
        
        onSnapshot(userProfileRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                
                // Read global dynamic UI configurations if defined in profile scope
                if (data && data.settings && data.settings.theme) {
                    document.body.setAttribute("data-theme", data.settings.theme);
                }

                // If a distinct custom profile image path string is returned from your collections, override and show it
                if (data && data.profileImage) {
                    const dynamicMarkup = buildAvatarHtml(data.profileImage);
                    if (userAvatar) {
                        userAvatar.innerHTML = dynamicMarkup;
                        triggerFallbackChecks(userAvatar);
                    }
                    if (profileBtn) {
                        profileBtn.innerHTML = dynamicMarkup;
                        triggerFallbackChecks(profileBtn);
                    }
                }
            }
        }, (error) => {
            console.error("Live profile snapshot sync failed:", error);
        });

        // Start dynamic metrics counters engine calculations using your exact HTML target structure
        startDashboardCounters(userId);

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

// Shared execution block routing target actions to handle layout triggers correctly
const handleDropdownToggle = (e) => {
    e.stopPropagation(); 
    if (dropdownMenu) dropdownMenu.classList.toggle('active');
    if (sidebar) sidebar.classList.remove('active'); 
};

// ==========================================
// 6. Right Side Profile Button (Avatar Dropdown Toggle)
// ==========================================
if (profileBtn) {
    profileBtn.addEventListener('click', handleDropdownToggle);
}
if (userAvatar) {
    userAvatar.addEventListener('click', handleDropdownToggle);
}

// ==========================================
// 7. Click Outside to Close Active Menus
// ==========================================
document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuBtn) {
        sidebar.classList.remove('active');
    }
    
    // Check elements so dropdown menu collapses safely when clicking content canvas fields
    const isProfileClick = profileBtn && profileBtn.contains(e.target);
    const isAvatarClick = userAvatar && userAvatar.contains(e.target);
    const isMenuClick = dropdownMenu && dropdownMenu.contains(e.target);

    if (dropdownMenu && dropdownMenu.classList.contains('active') && !isProfileClick && !isAvatarClick && !isMenuClick) {
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