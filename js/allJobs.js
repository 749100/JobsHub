import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// 🛠️ FIXED: Added 'where' to the direct destructuring import statement list below
import { initializeFirestore, collection, onSnapshot, query, where, getDoc, getDocs, orderBy, addDoc, serverTimestamp, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =========================================================================
// FIREBASE LIVE CONNECTION STRINGS
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
const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }); 
const auth = getAuth(app); 

const allJobsContainer = document.getElementById("allJobsContainer");
const jobsCounter = document.getElementById("jobsCounter");

let currentUserId = null;

// Track the user authorization session state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Active Session Token Confirmed for:", currentUserId);
        streamUnfilteredJobsRegistry();
    } else {
        console.warn("Unauthorized view vector. Redirecting to access screen.");
        window.location.href = 'login.html'; 
    }
});

// =========================================================================
// REAL-TIME FIRESTORE UNFILTERED JOBS REGISTRY STREAM
// =========================================================================
function streamUnfilteredJobsRegistry() {
  if (!allJobsContainer) return;

  // Simple clean root query tracking date parameter exclusively. No indexes needed!
  const unfilteredQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"));

  onSnapshot(unfilteredQuery, (snapshot) => {
      allJobsContainer.innerHTML = ""; 
      
      if (snapshot.empty) {
          allJobsContainer.innerHTML = `
              <div class="loading-state">
                  <i class="fa-solid fa-folder-open" style="color: #475569;"></i>
                  <p>There are no open job vacancies listed anywhere on JOSHIPRO yet.</p>
              </div>`;
          if (jobsCounter) jobsCounter.textContent = "0";
          return;
      }
      
      if (jobsCounter) jobsCounter.textContent = snapshot.size;
      
      snapshot.forEach((doc) => {
          const job = doc.data() || {};
          const jobId = doc.id; 

          const cardMarkup = `
              <div class="job-listing-card" data-id="${jobId}">
                  <div class="job-card-header">
                      <div class="job-title-block">
                          <h4>${escapeHtml(job.title || 'Untitled Position')}</h4>
                          <p class="company-tag">${escapeHtml(job.company || 'Confidential Provider')} • ${escapeHtml(job.location || 'Remote Region')}</p>
                      </div>
                      <span class="job-type-tag">${escapeHtml(job.type || 'Contract')}</span>
                  </div>
                  
                  <p class="job-snippet-description">${escapeHtml(job.description || 'No descriptive criteria outlined.')}</p>
              
                  <div class="job-card-footer">
                      <span class="salary-tag"><i class="fa-solid fa-wallet"></i> ${escapeHtml(job.salary || 'Negotiable')}</span>
                      <button class="standard-apply-btn instant-apply-action-trigger">Apply Now <i class="fa-solid fa-arrow-right"></i></button>
                  </div>
              </div>
          `;
          
          allJobsContainer.insertAdjacentHTML("beforeend", cardMarkup); 
      });
  }, (error) => {
      console.error("Firestore Core Realtime Streaming Fail:", error);
      allJobsContainer.innerHTML = `<p style="color: #f43f5e; text-align: center; width:100%;">Failed to load jobs feed. Please check connectivity matrix.</p>`;
  });
}

// =========================================================================
// 1-CLICK INTERACTIVE APPLICATION EVENT HANDLER
// =========================================================================
if (allJobsContainer) {
    allJobsContainer.addEventListener("click", async (e) => {
      const targetBtn = e.target.closest(".instant-apply-action-trigger");
      if (!targetBtn) return;

      if (!currentUserId) {
          alert("🔒 Authentication Required: Please log back in to verify identity profile mapping data.");
          window.location.href = "login.html";
          return;
      }

      const jobCard = targetBtn.closest(".job-listing-card");
      if (!jobCard) return;

      const jobId = jobCard.getAttribute("data-id");
      const title = jobCard.querySelector("h4") ? jobCard.querySelector("h4").textContent : " vacancy";
      const companyTagText = jobCard.querySelector(".company-tag") ? jobCard.querySelector(".company-tag").textContent : "Company";
      const company = companyTagText.split("•")[0].trim();

      // Set button visual to blocking processing loop
      targetBtn.disabled = true;
      targetBtn.style.background = "#475569";
      targetBtn.style.color = "#94a3b8";
      targetBtn.innerHTML = "Syncing application...";

      try {
          const jobDocRef = doc(db, "jobs", jobId);
          const jobSnapshot = await getDoc(jobDocRef);

          if (!jobSnapshot.exists()) {
              alert("❌ This listing has been closed or removed by the creator.");
              jobCard.remove();
              return;
          }

          const jobData = jobSnapshot.data() || {};

          // Guard block checking ownership logic arrays
          if (jobData.postedBy && jobData.postedBy === currentUserId) {
              alert("🛑 Ownership Block: You cannot submit an applicant parameter card to an opportunity posted by your own user ID.");
              resetApplyButton(targetBtn);
              return;
          }

          // Duplicate tracking loop matching document pairs
          const duplicateQuery = query(
              collection(db, "applications"),
              where("applicantId", "==", currentUserId),
              where("jobId", "==", jobId)
          );
          
          const duplicateSnapshot = await getDocs(duplicateQuery);
          const activeApplications = duplicateSnapshot.docs.filter(doc => {
            const status = doc.data().status;
            return status !== "Revoked" && status !== "Withdrawn";
          });

          if (activeApplications.length > 0) {
              alert("👋 Entry Locked: You already have a dynamic applicant token filed for this vacancy pipeline.");
              targetBtn.innerHTML = "Already Applied";
              targetBtn.disabled = true;
              return;
          }

          const applicationData = {
              jobId: jobId,
              jobTitle: title,
              company: company,
              applicantId: currentUserId,
              applicantEmail: auth.currentUser.email,
              status: "Pending",
              appliedAt: serverTimestamp()
          };

          await addDoc(collection(db, "applications"), applicationData);
          
          targetBtn.style.background = "#22c55e";
          targetBtn.style.color = "#ffffff";
          targetBtn.innerHTML = "Applied ✓";
          alert(`🎉 Instant application for "${title}" successfully delivered to ${company}!`);

      } catch (error) {
          console.error("Pipeline registration dropped:", error);
          alert(`Application fault: ${error.message}`);
          resetApplyButton(targetBtn);
      }
  });
}

function resetApplyButton(btn) {
    btn.disabled = false;
    btn.style.background = ""; 
    btn.style.color = "";
    btn.innerHTML = 'Apply Now <i class="fa-solid fa-arrow-right"></i>';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}