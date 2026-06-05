// ==========================================
// 1. FIREBASE SDK IMPORTS (✅ FIXED: FULL PATHS SPECIFIED)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// =========================================================================
// 2. FIREBASE CONFIGURATION STRINGS
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

const jobsContainer = document.getElementById("jobsContainer");

if (jobsContainer) {
  const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"));

  // Real-time Firestore streaming listener loop
  onSnapshot(jobsQuery, (snapshot) => {
      jobsContainer.innerHTML = ""; 
      
      if (snapshot.empty) {
          jobsContainer.innerHTML = "<p class='loading-text' style='text-align:center; color:#64748b; width:100%; padding:2rem;'>No active vacancy postings found.</p>";
          return;
      }
      
      snapshot.forEach((doc) => {
          const job = doc.data();
          const jobId = doc.id; 

          const cardMarkup = `
              <article class="welcome-card job-card" data-id="${jobId}" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:16px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                  <div class="job-card-header" style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                      <div>
                          <h3 class="job-title-text" style="margin:0 0 4px 0; color:#1e293b; font-size:20px;">${escapeHtml(job.title || 'Untitled Position')}</h3>
                          <p class="job-company-text" style="margin:0; color:#6366f1; font-weight:500;">${escapeHtml(job.company || 'Confidential Recruiter')}</p>
                      </div>
                      <span class="salary-tag" style="background:#f1f5f9; padding:4px 8px; border-radius:6px; font-size:13px; font-weight:600;">${escapeHtml(job.salary || 'Competitive')}</span>
                  </div>
                  
                  <p class="job-card-desc" style="color:#475569; font-size:14px; line-height:1.6; margin-bottom:16px;">${escapeHtml(job.description || 'No job description parameters provided.')}</p>
              
                  <div class="job-card-footer" style="display:flex; justify-content:space-between; align-items:center;">
                      <div class="job-meta-tags" style="display:flex; gap:12px; color:#64748b; font-size:13px;">
                          <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location || 'Remote / Global')}</span>
                          <span><i class="fa-solid fa-briefcase"></i> ${escapeHtml(job.type || 'Full-Time')}</span>
                      </div>
                      <button class="apply-btn standard-apply-btn" style="background:#6366f1; color:white; border:none; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer;">Apply Now <i class="fa-solid fa-arrow-right"></i></button>
                  </div>
              </article>
          `;
          
          jobsContainer.insertAdjacentHTML("beforeend", cardMarkup); 
      });
  }, (error) => {
      console.error("Firestore Streaming Read Error:", error);
  });

  // 1-Click Interactive Apply Button Handler
  jobsContainer.addEventListener("click", async (e) => {
      const targetBtn = e.target.closest(".standard-apply-btn");
      if (!targetBtn) return;

      const currentUser = auth.currentUser;
      if (!currentUser) {
          alert("🔒 Authentication Required: Please log in to apply for positions instantly.");
          window.location.href = "login.html";
          return;
      }

      const jobCard = targetBtn.closest(".job-card");
      const jobId = jobCard.getAttribute("data-id");
      const title = jobCard.querySelector(".job-title-text").textContent;
      const company = jobCard.querySelector(".job-company-text").textContent;

      targetBtn.disabled = true;
      targetBtn.style.background = "#94a3b8";
      targetBtn.innerHTML = "Processing...";

      try {
          const applicationData = {
              jobId: jobId,
              jobTitle: title,
              company: company,
              applicantId: currentUser.uid,
              applicantEmail: currentUser.email,
              status: "Pending",
              appliedAt: serverTimestamp()
          };

          await addDoc(collection(db, "applications"), applicationData);
          
          targetBtn.style.background = "#22c55e";
          targetBtn.innerHTML = "Applied ✓";
          alert(`🎉 Application sent to ${company} successfully!`);

      } catch (error) {
          console.error("Instant application failure:", error);
          alert(`Failed to apply: ${error.message}`);
          targetBtn.disabled = false;
          targetBtn.style.background = "#6366f1";
          targetBtn.innerHTML = 'Apply Now <i class="fa-solid fa-arrow-right"></i>';
      }
  });
}

// Escapes special text properties safely
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}