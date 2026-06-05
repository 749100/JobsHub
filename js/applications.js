import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const myApplicationsContainer = document.getElementById("myApplicationsContainer");

// Secure routing logic gate tracking
onAuthStateChanged(auth, (user) => {
    if (user) {
        syncCandidateApplications(user);
    } else {
        window.location.href = "login.html";
    }
});

function syncCandidateApplications(currentUser) {
    if (!myApplicationsContainer) return;

    // Stream entries created ONLY by this specific logged-in user ID
    const userAppsQuery = query(
        collection(db, "applications"),
        where("applicantId", "==", currentUser.uid)
    );

    onSnapshot(userAppsQuery, (snapshot) => {
        myApplicationsContainer.innerHTML = "";

        if (snapshot.empty) {
            myApplicationsContainer.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">You haven't submitted any job applications yet.</p>`;
            return;
        }

        snapshot.forEach((applicationDoc) => {
            const application = applicationDoc.data();
            
            // Assign CSS classes dynamically depending on what the employer selected
            let badgeClass = "status-pending";
            if (application.status === "Granted") badgeClass = "status-granted";
            if (application.status === "Revoked") badgeClass = "status-revoked";

            // Clean icon presentation formatting
            let statusIcon = "fa-spinner fa-spin";
            if (application.status === "Granted") statusIcon = "fa-circle-check";
            if (application.status === "Revoked") statusIcon = "fa-circle-xmark";

            const cardMarkup = `
                <div class="candidate-card" style="margin-bottom: 1rem;">
                    <div class="candidate-meta">
                        <h4 style="color: var(--text-main); font-size: 1.2rem; margin-bottom: 6px;">${escapeHtml(application.jobTitle || "Position Title")}</h4>
                        <p style="margin: 2px 0;"><strong style="color: #6366f1;">Company:</strong> ${escapeHtml(application.company || "JOSHIPRO Ecosystem")}</p>
                        <p style="font-size: 0.8rem; color: var(--text-muted);"><strong style="color: var(--text-muted);">Registered Email:</strong> ${escapeHtml(application.applicantEmail)}</p>
                    </div>
                    <div class="candidate-actions">
                        <span class="status-badge ${badgeClass}">
                            <i class="fa-solid ${statusIcon}"></i> ${application.status || "Pending"}
                        </span>
                    </div>
                </div>
            `;
            
            myApplicationsContainer.insertAdjacentHTML("beforeend", cardMarkup);
        });
    }, (error) => {
        console.error("Error reading candidate applications loop:", error);
    });
}

// Global Layout Navigation System Initialization Operations
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const profileBtn = document.getElementById("profileBtn");
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

    if (profileBtn && dropdownMenu) {
        profileBtn.onclick = (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle("show");
        };
        document.addEventListener("click", (e) => {
            if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}