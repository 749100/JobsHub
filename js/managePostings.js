// =========================================================================
// 1. FIREBASE SDK IMPORTS
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
let myApplications = []; // Holds ONLY applications for jobs this recruiter posted

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        startManagerDataSync();
    } else {
        window.location.href = "login.html";
    }
});

/**
 * Streams ONLY the jobs and applications owned by the logged-in recruiter
 */
function startManagerDataSync() {
    if (!manageContainer) return;

    // STEP 1: Query ONLY jobs created by the logged-in recruiter
    const myJobsQuery = query(collection(db, "jobs"), where("postedBy", "==", currentUserId));
    
    onSnapshot(myJobsQuery, (jobSnapshot) => {
        manageContainer.innerHTML = "";

        if (jobSnapshot.empty) {
            manageContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted); width: 100%;">
                    <p>You have not published any job openings yet. Your dashboard is empty.</p>
                </div>`;
            return;
        }

        // Gather all job IDs owned by this user
        const myJobIds = [];
        const jobsList = [];
        
        jobSnapshot.forEach((jobDoc) => {
            myJobIds.push(jobDoc.id);
            jobsList.push({ id: jobDoc.id, ...jobDoc.data() });
        });

        // STEP 2: Stream applications, but strictly filter out any that don't belong to this recruiter's jobs
        onSnapshot(collection(db, "applications"), (appSnapshot) => {
            myApplications = [];
            appSnapshot.forEach(doc => {
                const appData = doc.data();
                // 🔒 EXCLUSIVE GATE: If the application's jobId isn't in our owned jobs array, drop it entirely!
                if (myJobIds.includes(appData.jobId)) {
                    myApplications.push({ id: doc.id, ...appData });
                }
            });

            // Clear container and render only verified owned records
            manageContainer.innerHTML = "";
            
            jobsList.forEach((job) => {
                const candidates = myApplications.filter(app => app.jobId === job.id);

                const componentMarkup = `
                    <div class="manage-item" data-id="${job.id}">
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

function initEventListeners() {
    if (manageContainer) {
        manageContainer.addEventListener("click", async (e) => {
            const itemRow = e.target.closest(".manage-item");
            if (!itemRow) return;
            
            const jobId = itemRow.getAttribute("data-id");
            const jobTitle = itemRow.querySelector("h4").textContent;

            // Action A: Delete job listing item securely
            if (e.target.closest(".delete-btn")) {
                if (confirm(`Are you sure you want to delete the "${jobTitle}" listing? This action cannot be undone.`)) {
                    try {
                        await deleteDoc(doc(db, "jobs", jobId));
                        showCustomAlert("Listing Purged 🗑️", "The position was successfully removed from the live platform feed.");
                    } catch (error) {
                        console.error("Deletion failure:", error);
                        alert(`Failed to delete record: ${error.message}`);
                    }
                }
            }

            // Action B: View submissions in overlay modal module safely
            if (e.target.closest(".review-btn")) {
                const candidates = myApplications.filter(app => app.jobId === jobId);
                showCandidateOverlay(jobTitle, candidates);
            }
        });
    }
}

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