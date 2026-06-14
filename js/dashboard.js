// =========================================================================
// 🌐 DEPENDENCY MATRIX & MODULE IMPORT LOGISTICS
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// =========================================================================
// 🔑 CONFIGURATION INTEGRATION MATRIX
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

// Initialize Core Application Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =========================================================================
// 🎯 DOM NODE REGISTRY MAPPING
// =========================================================================
const userInfo = document.getElementById('userInfo');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById("userAvatar"); 

// =========================================================================
// 🖼️ AVATAR INTERFACE UTILITIES & STYLING GUARDRAILS
// =========================================================================
function enforceAvatarStyling(targetElement) {
    if (!targetElement) return;
    targetElement.style.width = "40px";
    targetElement.style.height = "40px";
    targetElement.style.borderRadius = "50%";
    targetElement.style.overflow = "hidden";
    targetElement.style.display = "inline-block";
    targetElement.style.cursor = "pointer";
}

function buildAvatarHtml(srcString) {
    return `<img src="${srcString}" alt="User Avatar" class="avatar-img-element" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
}

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

// =========================================================================
// 📊 REAL-TIME DASHBOARD TELEMETRY COUNTER ENGINE
// =========================================================================
function startDashboardCounters(userId) {
    console.log("Dashboard metric streaming pipelines initialized for:", userId);

    // 1. Live count total system jobs posted ecosystem-wide -> Targets id="jobsCounter"
    const totalJobsQuery = query(collection(db, "jobs"));
    
    onSnapshot(totalJobsQuery, async (snapshot) => {
        const totalJobsCountElement = document.getElementById("jobsCounter") || document.getElementById("totalJobs");
        if (totalJobsCountElement) {
            console.log(`Ecosystem stream sync: Found ${snapshot.size} global platform jobs.`);
            totalJobsCountElement.textContent = snapshot.size;
        }

        // 🎯 FIXED LOCATION FILTER ENGINE: Resolves 'My Jobs' rogue counter reporting
        const myJobsCountElement = document.getElementById("myJobsCounter");
        if (myJobsCountElement) {
            try {
                const userDocRef = doc(db, "users", userId);
                const userDocSnap = await getDoc(userDocRef);
                
                let userLocation = "";
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    userLocation = userData.location ? userData.location.trim().toLowerCase() : "";
                }

                // Guardrail Checklist: If no profile location is set, immediately clamp value to 0
                if (!userLocation) {
                    myJobsCountElement.textContent = "0";
                    return;
                }

                // Evaluate records using native substring validation arrays
                let matchingLocationCount = 0;
                snapshot.forEach((jobDoc) => {
                    const jobData = jobDoc.data();
                    if (jobData.location) {
                        const jobLoc = jobData.location.trim().toLowerCase();
                        if (jobLoc.includes(userLocation) || userLocation.includes(jobLoc)) {
                            matchingLocationCount++;
                        }
                    }
                });

                console.log(`Location match engine processed: Found ${matchingLocationCount} contextual matches.`);
                myJobsCountElement.textContent = matchingLocationCount;

            } catch (locErr) {
                console.error("Failed executing location based calculations:", locErr);
                myJobsCountElement.textContent = "0"; // Strict security error fallback state
            }
        }
    }, (err) => console.error("Error updates counting total jobs:", err));

    // 2. Live count candidate submission interactions -> Targets id="activeApplications"
    const appsSentQuery = query(collection(db, "applications"), where("applicantId", "==", userId));
    onSnapshot(appsSentQuery, (snapshot) => {
        const activeApps = snapshot.docs.filter(doc => doc.data().status !== "ArchivedByApplicant");
        
        // Update Applications Sent Metric Box
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

// =========================================================================
// 🔑 USER IDENTIFICATION & RUNTIME PROFILE SYNCHRONIZER
// =========================================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        
        if (userInfo) userInfo.innerHTML = `Logged in securely as: <strong>${user.email}</strong>`;
        
        enforceAvatarStyling(userAvatar);
        enforceAvatarStyling(profileBtn);

        const defaultImage = user.photoURL ? user.photoURL : "../assets/logo.png";
        const imageMarkup = buildAvatarHtml(defaultImage);

        if (userAvatar) userAvatar.innerHTML = imageMarkup;
        if (profileBtn) profileBtn.innerHTML = imageMarkup;
            
        const triggerFallbackChecks = (element) => {
            if (!element) return;
            const imgElement = element.querySelector('.avatar-img-element');
            if (imgElement) {
                imgElement.onerror = () => applyTextFallback(element, user.email);
            }
        };
        
        triggerFallbackChecks(userAvatar);
        triggerFallbackChecks(profileBtn);

        // Real-Time Document Event Loop Listener
        const userProfileRef = doc(db, "users", userId);
        onSnapshot(userProfileRef, (snapshot) => {
            const placeholder = document.getElementById("adminLinkPlaceholder");
            
            if (snapshot.exists()) {
                const data = snapshot.data();
                
                if (data && data.settings && data.settings.theme) {
                    document.body.setAttribute("data-theme", data.settings.theme);
                }

                // 🛡️ SECURITY ADMINISTRATION GATE VERIFICATION
                if (placeholder) {
                    if (data && data.isAdmin === true) {
                        const isAdminPage = window.location.pathname.includes("admin.html");
                        placeholder.innerHTML = `
                            <a href="admin.html" class="${isAdminPage ? 'active-sidebar-link' : ''}" style="color: #a855f7; border-left: 3px solid #a855f7; background: rgba(168, 85, 247, 0.1); font-weight: 700; display: flex; align-items: center; gap: 8px; padding: 10px 15px; text-decoration: none; border-radius: 0 6px 6px 0; margin: 4px 0;">
                                <i class="fa-solid fa-shield-halved"></i> Admin Center
                            </a>
                        `;
                    } else {
                        placeholder.innerHTML = ""; 
                    }
                }

                // Custom User Uploaded Avatar Override Process
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
            } else {
                if (placeholder) placeholder.innerHTML = "";
                console.log("Profile document does not exist yet. Running baseline defaults.");
            }
        }, (error) => {
            console.error("Live profile snapshot sync failed:", error);
        });

        // Initialize Data Counter Handlers Immediately Following Auth Complete
        startDashboardCounters(userId);

    } else {
        // Unauthenticated User Ejection Strategy
        window.location.href = 'login.html'; 
    }
});

// =========================================================================
// 🚀 INTERACTION LOGIC & UI SIDE-BAR CONTROLLERS
// =========================================================================
if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (sidebar) sidebar.classList.toggle('active');
        if (dropdownMenu) dropdownMenu.classList.remove('active'); 
    });
}

const handleDropdownToggle = (e) => {
    e.stopPropagation(); 
    if (dropdownMenu) dropdownMenu.classList.toggle('active');
    if (sidebar) sidebar.classList.remove('active'); 
};

if (profileBtn) profileBtn.addEventListener('click', handleDropdownToggle);
if (userAvatar) userAvatar.addEventListener('click', handleDropdownToggle);

// Click Outside Logic Canvas Dismissals
document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuBtn) {
        sidebar.classList.remove('active');
    }
    
    const isProfileClick = profileBtn && profileBtn.contains(e.target);
    const isAvatarClick = userAvatar && userAvatar.contains(e.target);
    const isMenuClick = dropdownMenu && dropdownMenu.contains(e.target);

    if (dropdownMenu && dropdownMenu.classList.contains('active') && !isProfileClick && !isAvatarClick && !isMenuClick) {
        dropdownMenu.classList.remove('active');
    }
});

// =========================================================================
// 🔒 SECURE SHUTDOWN LIFECYCLE CONTROLLER
// =========================================================================
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                alert("Logged out successfully from JOBSHUB!");
                window.location.href = 'login.html';
            })
            .catch((error) => {
                console.error("Error signing out from Firebase:", error);
                alert(`Logout Failed: ${error.message}`);
            });
    });
}