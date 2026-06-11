import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore, collection, onSnapshot, query, where, getDoc, getDocs, orderBy, addDoc, serverTimestamp, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =========================================================================
// 1. FIREBASE CONFIGURATION STRINGS
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
const jobsCounter = document.getElementById("jobsCounter");
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById("userAvatar"); 

let currentUserId = null;
let unsubscribeJobsStream = null; 

// =========================================================================
// 2. AUTH STATE TRACKER & USER PROFILE SYNC
// =========================================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        
        if (userAvatar) {
            const defaultImage = user.photoURL ? user.photoURL : "../assets/logo.png";
            userAvatar.innerHTML = `
                <img src="${defaultImage}" alt="User Avatar" id="avatarImg" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">
            `;
            
            const imgElement = document.getElementById('avatarImg');
            if (imgElement) {
                imgElement.onerror = () => {
                    if (user.email) {
                        userAvatar.innerHTML = user.email.charAt(0).toUpperCase();
                        userAvatar.style.fontWeight = '600';
                        userAvatar.style.background = 'linear-gradient(135deg, #6366f1, #a855f7)';
                        userAvatar.style.color = 'white';
                        userAvatar.style.display = 'flex';
                        userAvatar.style.alignItems = 'center';
                        userAvatar.style.justifyContent = 'center';
                    }
                };
            }
        }

        // Real-time user document listener to get region parameters safely
        const userProfileRef = doc(db, "users", currentUserId);
        onSnapshot(userProfileRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data && data.profileImage && userAvatar) {
                    userAvatar.innerHTML = `<img src="${data.profileImage}" alt="User Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
                }

                // Admin dashboard button injector gatekeeper
                const placeholder = document.getElementById("adminLinkPlaceholder");
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

                // Clean the text data input to isolate regional variables safely
                const registeredLocation = data?.location ? data.location.trim() : "";
                
                // Fetch only matching regional opportunities
                setupDynamicJobsRegistry(registeredLocation);
            } else {
                // If user documentation isn't built yet, fail gracefully by rendering everything
                setupDynamicJobsRegistry("");
            }
        });

    } else {
        window.location.href = 'login.html'; 
    }
});

// =========================================================================
// 3. UI SIDEBAR, RESPONSIVE TOGGLES & INTERACTION SYSTEM
// =========================================================================
if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (sidebar) sidebar.classList.toggle('active');
        if (dropdownMenu) dropdownMenu.classList.remove('active'); 
    });
}

if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (dropdownMenu) dropdownMenu.classList.toggle('active');
        if (sidebar) sidebar.classList.remove('active'); 
    });
}

document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuBtn) {
        sidebar.classList.remove('active');
    }
    if (dropdownMenu && dropdownMenu.classList.contains('active')) {
        dropdownMenu.classList.remove('active');
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                window.location.href = 'login.html';
            })
            .catch((error) => {
                console.error("Logout runtime error:", error);
            });
    });
}

// =========================================================================
// 4. REAL-TIME REGIONAL FILTER PIPELINE (CLEANED OF UNSTABLE QUERIES)
// =========================================================================
function setupDynamicJobsRegistry(userLocation) {
  if (!jobsContainer) return;

  if (unsubscribeJobsStream) unsubscribeJobsStream();

  // We query all listings securely and sort them dynamically inside client memory
  // This avoids any "where is not defined" compiler syntax crashes
  let jobsQuery = query(collection(db, "jobs"));

  unsubscribeJobsStream = onSnapshot(jobsQuery, (snapshot) => {
      jobsContainer.innerHTML = ""; 
      let matchedCount = 0;
      
      snapshot.forEach((doc) => {
          const job = doc.data() || {};
          const jobId = doc.id; 
          const rawJobLocation = job.location ? job.location.trim() : "Remote";

          // Smart substring checker. Handles direct match ("Bungoma") and extended formats ("Bungoma (Webuye)")
          if (userLocation && !rawJobLocation.toLowerCase().includes(userLocation.toLowerCase())) {
              return; // Skip rendering out-of-region jobs quietly
          }

          matchedCount++;

          const cardMarkup = `
              <div class="job-listing-card" data-id="${jobId}">
                  <div class="job-card-header">
                      <div class="job-title-block">
                          <h4>${escapeHtml(job.title || 'Untitled Position')}</h4>
                          <p class="company-tag">${escapeHtml(job.company || 'Confidential Recruiter')} • ${escapeHtml(rawJobLocation)}</p>
                      </div>
                      <span class="job-type-tag">${escapeHtml(job.type || 'Full-Time')}</span>
                  </div>
                  
                  <p class="job-snippet-description">${escapeHtml(job.description || 'No job description parameters provided.')}</p>
              
                  <div class="job-card-footer">
                      <span class="salary-tag"><i class="fa-solid fa-wallet"></i> ${escapeHtml(job.salary || 'Competitive')}</span>
                      <button class="apply-action-trigger-btn standard-apply-btn">Apply Now <i class="fa-solid fa-arrow-right"></i></button>
                  </div>
              </div>
          `;
          
          jobsContainer.insertAdjacentHTML("beforeend", cardMarkup); 
      });

      // Update counters and layouts
      if (matchedCount === 0) {
          jobsContainer.innerHTML = `
              <p class='loading-text' style='text-align:center; color:#94a3b8; width:100%; padding:2rem;'>
                  No jobs currently posted in <b>${escapeHtml(userLocation || "your area")}</b>. Check back later!
              </p>`;
          if (jobsCounter) jobsCounter.textContent = "0 Jobs Available";
      } else {
          if (jobsCounter) jobsCounter.textContent = `${matchedCount} Job(s) in ${userLocation || "Global Scope"}`;
      }

  }, (error) => {
      console.error("Firestore System Sync Fault:", error);
  });
}

// =========================================================================
// 5. SECURED APPLICATION ROUTING INTERCEPTOR Engine
// =========================================================================
if (jobsContainer) {
  jobsContainer.addEventListener("click", async (e) => {
      const targetBtn = e.target.closest(".standard-apply-btn");
      if (!targetBtn) return;

      if (!currentUserId) {
          alert("🔒 Authentication Required: Please log in to apply for positions instantly.");
          window.location.href = "login.html";
          return;
      }

      const jobCard = targetBtn.closest(".job-listing-card");
      if (!jobCard) return;

      const jobId = jobCard.getAttribute("data-id");
      const title = jobCard.querySelector("h4") ? jobCard.querySelector("h4").textContent : "Specified Position";
      const companyTagText = jobCard.querySelector(".company-tag") ? jobCard.querySelector(".company-tag").textContent : "Confidential Recruiter";
      const company = companyTagText.split("•")[0].trim();

      targetBtn.disabled = true;
      targetBtn.style.background = "#94a3b8";
      targetBtn.innerHTML = "Processing...";

      try {
          const jobDocRef = doc(db, "jobs", jobId);
          const jobSnapshot = await getDoc(jobDocRef);

          if (!jobSnapshot.exists()) {
              alert("❌ Error: This job posting no longer exists inside the live matrix.");
              resetApplyButton(targetBtn);
              return;
          }

          const jobData = jobSnapshot.data() || {};

          if (jobData.postedBy && jobData.postedBy === currentUserId) {
              alert("🛑 Action Blocked: You cannot apply to a job position that you posted yourself!");
              resetApplyButton(targetBtn);
              return;
          }

          // Duplicate protection checking
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
              alert("👋 Notice: You have already submitted an application for this position! Duplicate requests are blocked.");
              targetBtn.style.background = "#6366f1";
              targetBtn.style.color = "#ffffff";
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
          alert(`🎉 Success! Application transmitted to ${company} securely.`);

      } catch (error) {
          console.error("Application processing crash handler sequence:", error);
          alert(`Transmission Break: ${error.message}`);
          resetApplyButton(targetBtn);
      }
  });
}

function resetApplyButton(btn) {
    btn.disabled = false;
    btn.style.background = ""; 
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