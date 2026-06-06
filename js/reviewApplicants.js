import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// ✅ FIXED: Added getDoc to imports to read candidate profiles directly
import { getFirestore, collection, onSnapshot, query, where, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
let currentUserId = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        syncActiveApplicants();
    } else {
        window.location.href = "login.html";
    }
});

function syncActiveApplicants() {
    if (!applicantsContainer) return;

    // STEP 1: Find all jobs posted by the current user
    const myJobsQuery = query(collection(db, "jobs"), where("postedBy", "==", currentUserId));
    
    onSnapshot(myJobsQuery, (jobSnapshot) => {
        const myJobIds = [];
        jobSnapshot.forEach((jobDoc) => {
            myJobIds.push(jobDoc.id);
        });

        // If this user hasn't posted any jobs, immediately clear screen and leave it blank
        if (myJobIds.length === 0) {
            applicantsContainer.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">No active candidate profiles to review.</p>`;
            return;
        }

        // STEP 2: Stream applications, but completely ignore them if they don't belong to the user's jobs
        onSnapshot(collection(db, "applications"), async (snapshot) => {
            applicantsContainer.innerHTML = "";
            let visibleCount = 0;

            // Using for...of loop to handle asynchronous profile fetching sequentially
            for (const applicationDoc of snapshot.docs) {
                const application = applicationDoc.data();
                const applicationId = applicationDoc.id;

                // 🔒 BLANK PRIVACY PROTECTION GATE: If this application belongs to someone else's job, completely ignore it
                if (!myJobIds.includes(application.jobId)) {
                    continue; 
                }

                // ✅ UPDATED: Added "ArchivedByApplicant" so withdrawn jobs disappear instantly from here
                if (application.status === "Revoked" || application.status === "Withdrawn" || application.status === "ArchivedByApplicant") {
                    continue;
                }

                // 🔍 LIVE LOOKUP: Get live profile data straight from the candidate's profile document
                let liveName = "Anonymous Applicant";
                let liveProfession = "Not Specified";
                let livePhone = "Not Provided";

                if (application.applicantId) {
                    try {
                        const profileSnap = await getDoc(doc(db, "users", application.applicantId));
                        if (profileSnap.exists()) {
                            const profileData = profileSnap.data();
                            liveName = profileData.name || profileData.fullName || liveName;
                            liveProfession = profileData.profession || liveProfession;
                            livePhone = profileData.phone || profileData.phoneNumber || livePhone;
                        }
                    } catch (err) {
                        console.error("Error fetching live candidate info:", err);
                    }
                }

                let badgeClass = "status-pending";
                if (application.status === "Granted") badgeClass = "status-granted";

                // ✅ UPDATED DESIGN: Displays only Job Title, Name, Profession, Phone, and Email
                const cardMarkup = `
                    <div class="candidate-card" data-id="${applicationId}" data-job-id="${application.jobId}" style="margin-bottom: 1rem; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="candidate-meta">
                            <h4 style="margin: 0 0 6px 0; font-size: 1.15rem; color: var(--text-main);"><strong style="color: #6366f1;">Position Applied:</strong> ${escapeHtml(application.jobTitle || "Specified Position")}</h4>
                            
                            <div class="profile-details-block" style="display: flex; flex-direction: column; gap: 3px; font-size: 0.9rem; margin-top: 8px;">
                                <span><strong>Name:</strong> ${escapeHtml(liveName)}</span>
                                <span><strong>Profession:</strong> ${escapeHtml(liveProfession)}</span>
                                <span><strong>Phone:</strong> ${escapeHtml(livePhone)}</span>
                                <span><strong>Email:</strong> ${escapeHtml(application.applicantEmail || "N/A")}</span>
                            </div>
                        </div>
                        <div class="candidate-actions" style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                            <span class="status-badge ${badgeClass}">${application.status || "Pending"}</span>
                            <div class="action-btn-group" style="display: flex; gap: 6px;">
                                <button class="btn-grant action-grant-trigger"><i class="fa-solid fa-circle-check"></i> Grant</button>
                                <button class="btn-revoke action-revoke-trigger"><i class="fa-solid fa-circle-xmark"></i> Revoke</button>
                            </div>
                        </div>
                    </div>
                `;
                
                applicantsContainer.insertAdjacentHTML("beforeend", cardMarkup);
                visibleCount++;
            }

            if (visibleCount === 0) {
                applicantsContainer.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">No active candidate profiles to review.</p>`;
            }
        });
    });
}

if (applicantsContainer) {
    applicantsContainer.addEventListener("click", async (e) => {
        const targetRow = e.target.closest(".candidate-card");
        if (!targetRow) return;

        const applicationId = targetRow.getAttribute("data-id");
        
        // Target specifically the name node inside the new profile layout block
        const candidateNameElement = targetRow.querySelector(".profile-details-block span");
        const candidateName = candidateNameElement ? candidateNameElement.textContent.replace("Name: ", "") : "this applicant";

        const isGrantClicked = e.target.closest(".action-grant-trigger");
        const isRevokeClicked = e.target.closest(".action-revoke-trigger");

        if (!isGrantClicked && !isRevokeClicked) return;

        const newStatus = isGrantClicked ? "Granted" : "Revoked";
        const confirmMessage = isGrantClicked 
            ? `Grant application approval parameters for ${candidateName}?`
            : `Are you sure you want to revoke and hide ${candidateName}?`;

        if (confirm(confirmMessage)) {
            try {
                await updateDoc(doc(db, "applications", applicationId), { status: newStatus });
            } catch (error) {
                console.error("State change failed:", error);
                alert(`Action Failed: ${error.message}`);
            }
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}