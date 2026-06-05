// =========================================================================
// 1. FIREBASE SDK IMPORTS (✅ FIXED: AUTHSTATECHANGED MOVED TO THE CORRECT BUNDLE)
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Ensure onAuthStateChanged is pulled from the auth library right here:
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Removed from the firestore line below:
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

const manageContainer = document.getElementById("manageJobsContainer");

let currentUserId = null;
let allApplications = []; 

// Validate active recruiter authentication session
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Recruiter profile validated. Syncing custom postings grid...");
        startManagerDataSync();
    } else {
        console.warn("No active session found. Redirection loop to login...");
        window.location.href = "login.html";
    }
});

/**
 * Streams data dynamically from cloud Firestore clusters
 */
function startManagerDataSync() {
    // 1. Keep a running track of application tables in active memory
    onSnapshot(collection(db, "applications"), (appSnapshot) => {
        allApplications = [];
        appSnapshot.forEach(doc => {
            allApplications.push({ id: doc.id, ...doc.data() });
        });
        
        // 2. Query and stream ONLY jobs created by the logged-in user profile (postedBy)
        if (!manageContainer) return;
        const myJobsQuery = query(collection(db, "jobs"), where("postedBy", "==", currentUserId));
        
        onSnapshot(myJobsQuery, (jobSnapshot) => {
            manageContainer.innerHTML = "";

            if (jobSnapshot.empty) {
                manageContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-muted); width: 100%;">
                        <p>You have not published any job openings yet.</p>
                    </div>`;
                return;
            }

            jobSnapshot.forEach((jobDoc) => {
                const job = jobDoc.data();
                const jobId = jobDoc.id;

                // Match candidates specifically tied to this job document identifier
                const candidates = allApplications.filter(app => app.jobId === jobId);

                const componentMarkup = `
                    <div class="manage-item" data-id="${jobId}">
                        <div class="manage-info">
                            <h4>${escapeHtml(job.title)}</h4>
                            <p>${escapeHtml(job.company)} &bull; ${escapeHtml(job.location)} &bull; <span style="color: #a855f7; font-weight:600;">${escapeHtml(job.type || "Full-Time")}</span></p>
                        </div>
                        <div class="manage-actions">
                            <button class="review-btn"><i class="fa-solid fa-users"></i> Applicants (${candidates.length})</button>
                            <button class="delete-btn"><i class="fa-solid fa-trash-can"></i> Delete</button>
                        </div>
                    </div>
                `;
                manageContainer.insertAdjacentHTML("beforeend", componentMarkup);
            });
        });
    });
}

// FIXED: Moved event listener setup into a wrapper initialization to guarantee safe DOM matching execution loops
function initEventListeners() {
    if (manageContainer) {
        manageContainer.addEventListener("click", async (e) => {
            const itemRow = e.target.closest(".manage-item");
            if (!itemRow) return;
            
            const jobId = itemRow.getAttribute("data-id");
            const jobTitle = itemRow.querySelector("h4").textContent;

            // Action A: Delete job listing item from database completely
            if (e.target.closest(".delete-btn")) {
                if (confirm(`Are you sure you want to delete the "${jobTitle}" listing? This action cannot be undone.`)) {
                    try {
                        console.log("Attempting document purge for target ID reference:", jobId);
                        
                        // Executing delete targeting your active database instance node explicitly
                        await deleteDoc(doc(db, "jobs", jobId));
                        
                        showCustomAlert("Listing Purged 🗑️", "The position was successfully removed from the live platform feed.");
                    } catch (error) {
                        console.error("Deletion failure details:", error);
                        alert(`Failed to delete record: ${error.message}\nVerify your Firestore Console Rules permissions configurations.`);
                    }
                }
            }

            // Action B: View submissions in overlay modal module
            if (e.target.closest(".review-btn")) {
                const candidates = allApplications.filter(app => app.jobId === jobId);
                showCandidateOverlay(jobTitle, candidates);
            }
        });
    }
}

// Fire element attachment routines instantly
initEventListeners();

function showCandidateOverlay(title, applicants) {
    const existing = document.getElementById("modalOverlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "modalOverlay";
    overlay.className = "alert-overlay";

    let itemsHtml = "";
    if (applicants.length === 0) {
        itemsHtml = `<li><p style="color: var(--text-muted); text-align: center; padding: 1.5rem 0;">No submissions logged for this open position.</p></li>`;
    } else {
        applicants.forEach(app => {
            itemsHtml += `
                <li class="candidate-row">
                    <div>
                        <strong>Applicant Profile</strong>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Reference ID: ${app.id}</p>
                    </div>
                    <span class="status-badge status-pending">${app.status || "Pending"}</span>
                </li>`;
        });
    }

    overlay.innerHTML = `
        <div class="alert-box applicants-modal">
            <h2 style="font-size: 1.4rem;">Submissions List</h2>
            <p style="margin-bottom: 1.25rem; font-weight: 600; color: #6366f1;">${title}</p>
            <ul class="candidate-list-wrapper">
                ${itemsHtml}
            </ul>
            <button class="alert-btn close-modal-btn" style="margin-top: 1.25rem;">Close Records</button>
        </div>`;

    document.body.appendChild(overlay);
    overlay.querySelector(".close-modal-btn").addEventListener("click", () => overlay.remove());
}

function showCustomAlert(title, text) {
    const existing = document.getElementById("alertOverlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "alertOverlay";
    overlay.className = "alert-overlay";

    overlay.innerHTML = `
        <div class="alert-box">
            <h2>${title}</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size:0.95rem; line-height:1.5;">${text}</p>
            <button class="alert-btn dismiss-alert-btn">Dismiss</button>
        </div>`;

    document.body.appendChild(overlay);
    overlay.querySelector(".dismiss-alert-btn").addEventListener("click", () => overlay.remove());
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// =========================================================================
// 3. ADDED GLOBAL NAVIGATION INTERACTIVITY HANDLERS
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initializeNavigationUI();
});

// Run execution immediately in module context as well
initializeNavigationUI();

function initializeNavigationUI() {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const profileBtn = document.getElementById("profileBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    // A. SIDEBAR INTERACTIVE DRAWER TOGGLE
    if (menuBtn && sidebar) {
        menuBtn.removeEventListener("click", toggleSidebar);
        menuBtn.addEventListener("click", toggleSidebar);
        
        document.addEventListener("click", (e) => {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target) && sidebar.classList.contains("active")) {
                sidebar.classList.remove("active");
            }
        });
    }

    // B. PROFILE AVATAR DROPDOWN INTERACTIVE TOGGLE
    if (profileBtn && dropdownMenu) {
        profileBtn.removeEventListener("click", toggleDropdown);
        profileBtn.addEventListener("click", toggleDropdown);

        document.addEventListener("click", (e) => {
            if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove("show");
            }
        });
    }

    // C. SECURE USER SESSION SIGN OUT DESTROYER
    if (logoutBtn) {
        logoutBtn.removeEventListener("click", handleUserLogout);
        logoutBtn.addEventListener("click", handleUserLogout);
    }
}

function toggleSidebar(e) {
    e.stopPropagation();
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.toggle("active");
        console.log("Navigation UI: Sidebar toggle toggled.");
    }
}

function toggleDropdown(e) {
    e.stopPropagation();
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownMenu) {
        dropdownMenu.classList.toggle("show");
        console.log("Navigation UI: Profile dropdown toggled.");
    }
}

async function handleUserLogout() {
    if (confirm("Are you sure you want to log out of your session?")) {
        try {
            await auth.signOut();
            console.log("Auth session killed successfully.");
            window.location.href = "login.html";
        } catch (err) {
            console.error("Sign-out operations failed:", err);
            alert("Could not terminate secure tracking token safely.");
        }
    }
}