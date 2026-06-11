import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, where, orderBy, doc, updateDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const userAvatar = document.getElementById("userAvatar"); 
const profileBtnEl = document.getElementById("profileBtn"); 

// Helper function to render secure layout avatars uniformly across the application layer
function renderSecureAvatar(targetElement, user, customImageUrl = null) {
    if (!targetElement) return;
    const imageSrc = customImageUrl ? customImageUrl : (user.photoURL ? user.photoURL : "../assets/logo.png");
    
    // Lock dimensions securely to match layout aspect ratios
    targetElement.style.width = "40px";
    targetElement.style.height = "40px";
    targetElement.style.borderRadius = "50%";
    targetElement.style.overflow = "hidden";
    targetElement.style.display = "inline-block"; 
    
    targetElement.innerHTML = `
        <img src="${imageSrc}" alt="User Avatar" class="avatar-img-element" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">
    `;
    
    const imgTag = targetElement.querySelector('.avatar-img-element');
    if (imgTag) {
        imgTag.onerror = () => {
            if (user.email) {
                targetElement.innerHTML = user.email.charAt(0).toUpperCase();
                targetElement.style.fontWeight = '600';
                targetElement.style.background = 'linear-gradient(135deg, #6366f1, #a855f7)';
                targetElement.style.color = 'white';
                targetElement.style.display = 'flex';
                targetElement.style.alignItems = 'center';
                targetElement.style.justifyContent = 'center';
                targetElement.style.borderRadius = '50%';
                targetElement.style.fontSize = '14px';
            }
        };
    }
}

if (myApplicationsContainer) {
    myApplicationsContainer.addEventListener("click", async (e) => {
        const targetBtn = e.target.closest(".action-withdraw-trigger");
        if (!targetBtn) return;

        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const applicationCard = targetBtn.closest(".candidate-card");
        const applicationId = applicationCard.getAttribute("data-id");
        const jobTitle = applicationCard.querySelector("h4").textContent;

        if (confirm(`Are you sure you want to withdraw your application for "${jobTitle}"? This will remove it entirely from the employer's dashboard.`)) {
            targetBtn.disabled = true;
            targetBtn.style.background = "#94a3b8";
            targetBtn.textContent = "Withdrawing...";

            try {
                const appRef = doc(db, "applications", applicationId);
                
                // Update status to Archive token flag
                await updateDoc(appRef, { 
                    status: "ArchivedByApplicant",
                    withdrawnAt: serverTimestamp()
                 });

                // Fluid application layout cleanup animation sequence
                if (applicationCard) {
                    applicationCard.style.transition = "all 0.3s ease";
                    applicationCard.style.opacity = "0";
                    applicationCard.style.transform = "scale(0.95)";
                    setTimeout(() => applicationCard.remove(), 300);
                }

                alert(`Your application for "${jobTitle}" has been successfully withdrawn.`);
            } catch (error) {
                console.error("Error withdrawing application:", error);
                alert("An error occurred while trying to withdraw your application. Please try again.");
                targetBtn.disabled = false;
                targetBtn.style.background = "#ef4444";
                targetBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Withdraw';
            }
        }
    });
}

// Secure routing logic gate tracking
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Sync both avatar targets on load using fallback strategy parameters
        renderSecureAvatar(userAvatar, user);
        renderSecureAvatar(profileBtnEl, user);

        // Read the configurations object path payload to execute global app themes dynamically
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.settings && userData.settings.theme) {
                    document.body.setAttribute("data-theme", userData.settings.theme);
                }
            }
        } catch (themeError) {
            console.error("Global system workspace color theme translation failed:", themeError);
        }

        // Keep both navigational element nodes synchronized live from Firestore streams
        const userProfileRef = doc(db, "users", user.uid);
        onSnapshot(userProfileRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data && data.profileImage) {
                    renderSecureAvatar(userAvatar, user, data.profileImage);
                    renderSecureAvatar(profileBtnEl, user, data.profileImage);
                }
            }
        });

        syncCandidateApplications(user);
    } else {
        window.location.href = "login.html";
    }
});

function syncCandidateApplications(currentUser) {
    if (!myApplicationsContainer) return;

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

        // ✅ FIX 1: Explicitly drop entries that match "Withdrawn", "Revoked", or "ArchivedByApplicant" case-insensitively
        const activeDocs = snapshot.docs.filter(doc => {
            const rawStatus = (doc.data().status || "").trim().toLowerCase();
            return rawStatus !== "archivedbyapplicant" && 
                   rawStatus !== "withdrawn" && 
                   rawStatus !== "revoked";
        });

        if (activeDocs.length === 0) {
            myApplicationsContainer.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">You haven't submitted any job applications yet.</p>`;
            return;
        }

        activeDocs.forEach((applicationDoc) => {
            const application = applicationDoc.data();
            const applicationId = applicationDoc.id;
            
            // Standardize verification status comparison parameters
            const normalizedStatus = (application.status || "Pending").trim().toLowerCase();

            let badgeClass = "status-pending";
            if (normalizedStatus === "granted") badgeClass = "status-granted";
            if (normalizedStatus === "revoked") badgeClass = "status-revoked";

            // ✅ FIX 2: Replaced the spinning loader fallback ("fa-spinner fa-spin") with a safe static clock icon
            let statusIcon = "fa-clock"; 
            if (normalizedStatus === "granted") statusIcon = "fa-circle-check";
            if (normalizedStatus === "revoked") statusIcon = "fa-circle-xmark";
        
            let withdrawButtonMarkup = "";
            if (normalizedStatus === "pending" || normalizedStatus === "granted") {
                withdrawButtonMarkup = `
                    <button class="action-withdraw-trigger" style="background: #ef4444; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: background 0.2s ease; display: inline-flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-ban"></i> Withdraw
                    </button>
                `;
            }

            const cardMarkup = `
                <div class="candidate-card" data-id="${applicationId}" style="margin-bottom: 1rem; padding: 16px; border-radius: 8px; background: var(--card-bg); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <div class="candidate-meta">
                        <h4 style="color: var(--text-main); font-size: 1.2rem; margin: 0 0 6px 0;">${escapeHtml(application.jobTitle || "Position Title")}</h4>
                        <p style="margin: 2px 0; font-size: 0.95rem;"><strong style="color: #6366f1;">Company:</strong> ${escapeHtml(application.company || "JOSHIPRO Ecosystem")}</p>
                        <p style="font-size: 0.8rem; margin: 4px 0 0 0; color: var(--text-muted);"><strong style="color: var(--text-muted);">Registered Email:</strong> ${escapeHtml(application.applicantEmail)}</p>
                    </div>
                    <div class="candidate-actions" style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                        <span class="status-badge ${badgeClass}" style="padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                            <i class="fa-solid ${statusIcon}"></i> ${application.status || "Pending"}
                        </span>
                        ${withdrawButtonMarkup}
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
document.addEventListener("DOMContentLoaded", async () => {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    // 🛡️ STEP 3 INTEGRATION: DYNAMIC ADMIN PORTAL INJECTOR LINK
    try {
        onAuthStateChanged(auth, async (user) => {
            const placeholder = document.getElementById("adminLinkPlaceholder");
            if (!user || !placeholder) return;

            // Fetch the user's account data to check for admin privileges
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().isAdmin === true) {
                const isAdminPage = window.location.pathname.includes("admin.html");
                
                // Inject the Admin Center link safely into your sidebar container
                placeholder.innerHTML = `
                    <a href="admin.html" class="${isAdminPage ? 'active-sidebar-link' : ''}" style="color: #a855f7; border-left: 3px solid #a855f7; background: rgba(168, 85, 247, 0.1); font-weight: 700; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-shield-halved"></i> Admin Center
                    </a>
                `;
            }
        });
    } catch (injectorError) {
        console.error("Admin link fallback initialization failed:", injectorError);
    }

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

    // Shared execution logic to toggle dropdown menu visibility
    const toggleDropdown = (e) => {
        e.stopPropagation();
        if (dropdownMenu) {
            dropdownMenu.classList.toggle("show");
        }
    };

    // Binds the click event handler onto both ID selectors to guarantee interaction execution
    if (profileBtnEl) {
        profileBtnEl.onclick = toggleDropdown;
        profileBtnEl.style.cursor = "pointer";
    }
    if (userAvatar) {
        userAvatar.onclick = toggleDropdown;
        userAvatar.style.cursor = "pointer";
    }

    // Auto-dismiss execution when clicking background canvas wrappers
    document.addEventListener("click", (e) => {
        const clickedInsideProfile = profileBtnEl && profileBtnEl.contains(e.target);
        const clickedInsideAvatar = userAvatar && userAvatar.contains(e.target);
        const clickedInsideMenu = dropdownMenu && dropdownMenu.contains(e.target);

        if (!clickedInsideProfile && !clickedInsideAvatar && !clickedInsideMenu) {
            if (dropdownMenu) {
                dropdownMenu.classList.remove("show");
            }
        }
    });

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