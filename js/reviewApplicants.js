import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const applicantsContainer = document.getElementById("applicantsContainer");

// Secure connection verification hook
onAuthStateChanged(auth, (user) => {
    if (user) {
        syncActiveApplicants();
    } else {
        window.location.href = "login.html";
    }
});

// Real-time applicant pipeline monitoring 
function syncActiveApplicants() {
    if (!applicantsContainer) return;

    onSnapshot(collection(db, "applications"), (snapshot) => {
        applicantsContainer.innerHTML = "";
        let visibleCount = 0;

        snapshot.forEach((applicationDoc) => {
            const application = applicationDoc.data();
            const applicationId = applicationDoc.id;

            // ✅ CRITICAL FIX: If status matches "Revoked", bypass rendering so it disappears from the view
            if (application.status === "Revoked") {
                return;
            }

            let badgeClass = "status-pending";
            if (application.status === "Granted") badgeClass = "status-granted";

            const cardMarkup = `
                <div class="candidate-card" data-id="${applicationId}">
                    <div class="candidate-meta">
                        <h4>${escapeHtml(application.applicantEmail || "Anonymous Candidate")}</h4>
                        <p><strong style="color: #6366f1;">Job:</strong> ${escapeHtml(application.jobTitle || "Specified Position")}</p>
                        <p style="font-size:0.8rem; margin-top:4px;"><strong style="color:var(--text-muted);">Company:</strong> ${escapeHtml(application.company || "JOSHIPRO Ecosystem")}</p>
                    </div>
                    <div class="candidate-actions">
                        <span class="status-badge ${badgeClass}">${application.status || "Pending"}</span>
                        <div class="action-btn-group">
                            <button class="btn-grant action-grant-trigger"><i class="fa-solid fa-circle-check"></i> Grant</button>
                            <button class="btn-revoke action-revoke-trigger"><i class="fa-solid fa-circle-xmark"></i> Revoke</button>
                        </div>
                    </div>
                </div>
            `;
            
            applicantsContainer.insertAdjacentHTML("beforeend", cardMarkup);
            visibleCount++;
        });

        if (visibleCount === 0) {
            applicantsContainer.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">No active candidate profiles to review.</p>`;
        }
    }, (err) => {
        console.error("Pipeline sync failed: ", err);
    });
}

// Global actions proxy delegation listener
if (applicantsContainer) {
    applicantsContainer.addEventListener("click", async (e) => {
        const targetRow = e.target.closest(".candidate-card");
        if (!targetRow) return;

        const applicationId = targetRow.getAttribute("data-id");
        const candidateEmail = targetRow.querySelector("h4").textContent;

        if (e.target.closest(".action-grant-trigger")) {
            if (confirm(`Grant application approval parameters for ${candidateEmail}?`)) {
                await updateDoc(doc(db, "applications", applicationId), { status: "Granted" });
            }
        }

        if (e.target.closest(".action-revoke-trigger")) {
            if (confirm(`Are you sure you want to revoke and hide ${candidateEmail}?`)) {
                // Changing status to "Revoked" instantly triggers the onSnapshot listener to drop it from view
                await updateDoc(doc(db, "applications", applicationId), { status: "Revoked" });
            }
        }
    });
}

// Menu, Dropdown, and Sign Out operations initialization
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