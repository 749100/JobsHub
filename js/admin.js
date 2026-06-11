import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore, collection, onSnapshot, doc, getDoc, deleteDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// 🧠 MULTI-SESSION ISOLATION ENGINE: Creates an independent pipeline to register accounts 
// without auto-logging you out of your Master Control profile session.
const secondaryApp = initializeApp(firebaseConfig, "SecondaryAuthEcosystem");
const secondaryAuth = getAuth(secondaryApp);

const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');

// =========================================================================
// 🛡️ DIAGNOSTIC SECURITY GATEKEEPER MONITOR
// =========================================================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.warn("🔐 No active session found. Routing back to entry point...");
        window.location.href = "login.html";
        return;
    }

    console.log("Analyzing platform authentication nodes for UID:", user.uid);

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            console.error("❌ Critical: Profile document missing from 'users' collection.");
            alert(`Configuration Halt:\nCould not find a matching profile document in your 'users' collection for UID:\n${user.uid}\n\nPlease check your Firestore registration nodes.`);
            return;
        }

        const userData = userDocSnap.data();
        console.log("Payload data verified successfully from root collection:", userData);

        if (userData && userData.isAdmin === true) {
            console.log("🛡️ Access Verified: Master Command capabilities enabled.");
            renderAdminSidebarLink();
            startGlobalSystemPipelines();
            setupFormInterceptors(); 
        } else {
            console.error("🛑 Access Blocked: Account permissions unauthorized.");
            const detectedValue = userData ? userData.isAdmin : 'undefined';
            
            alert(`Security Alert: Access Unauthorized\n\nYour account does not possess the required administrator access keys.\n\nDetected 'isAdmin' property: ${detectedValue} (Type: ${typeof detectedValue})\n\nExpected target condition: true (Boolean)`);
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        console.error("Critical role validation crash inside authentication gate:", err);
        alert(`Firestore Communication Fault:\n${err.message}\n\nVerify that your Cloud Firestore Security Rules permit reading entire collections.`);
        window.location.href = "dashboard.html";
    }
});

// =========================================================================
// REAL-TIME MODERATION & COUNTER PIPELINES
// =========================================================================
function startGlobalSystemPipelines() {
    console.log("📈 Initiating live global ecosystem telemetry streams...");
    
    // 1. Telemetry Counters Loops
    onSnapshot(collection(db, "users"), (snap) => {
        if(document.getElementById("adminUsersTotal")) document.getElementById("adminUsersTotal").textContent = snap.size;
    }, (err) => console.error("Realtime counter user stream fault:", err));

    onSnapshot(collection(db, "jobs"), (snap) => {
        if(document.getElementById("adminJobsTotal")) document.getElementById("adminJobsTotal").textContent = snap.size;
    }, (err) => console.error("Realtime counter jobs stream fault:", err));

    onSnapshot(collection(db, "applications"), (snap) => {
        if(document.getElementById("adminAppsTotal")) document.getElementById("adminAppsTotal").textContent = snap.size;
    }, (err) => console.error("Realtime counter application stream fault:", err));

    // 2. Live Account Moderation Table Stream
    const usersTableBody = document.getElementById("usersTableBody");
    onSnapshot(collection(db, "users"), (snapshot) => {
        if (!usersTableBody) return;
        usersTableBody.innerHTML = "";

        if (snapshot.empty) {
            usersTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No active profiles mapped in database.</td></tr>`;
            return;
        }

        snapshot.forEach((userDoc) => {
            const uData = userDoc.data();
            const uId = userDoc.id;

            const isSelf = uId === auth.currentUser?.uid;
            const actionButtonMarkup = isSelf 
                ? `<span class="active-session-tag"><i class="fa-solid fa-user-crown"></i> Your Active Session</span>`
                : `<button class="admin-action-btn btn-delete-user" data-uid="${uId}"><i class="fa-solid fa-user-slash"></i> Terminate</button>`;

            const row = `
                <tr>
                    <td>
                        <div class="primary-table-text">${escapeHtml(uData.fullName || 'Anonymous User')}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(uData.email || 'Hidden Contact')}</div>
                        <div class="secondary-table-id">${uId}</div>
                    </td>
                    <td><span class="role-badge">${escapeHtml(uData.role || 'Job Seeker')}</span></td>
                    <td>${escapeHtml(uData.location || 'Not Specified')}</td>
                    <td style="text-align: right;">${actionButtonMarkup}</td>
                </tr>
            `;
            usersTableBody.insertAdjacentHTML("beforeend", row);
        });
    }, (err) => {
        console.error("Moderation table profile synchronization failure:", err);
        if (usersTableBody) {
            usersTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Sync Error: ${escapeHtml(err.message)}</td></tr>`;
        }
    });

    // 3. Live Application Transmission Interceptor Stream Pipeline
    const appsTableBody = document.getElementById("appsTableBody");
    if (appsTableBody) {
        onSnapshot(collection(db, "applications"), (snapshot) => {
            appsTableBody.innerHTML = "";

            if (snapshot.empty) {
                appsTableBody.innerHTML = `<tr><td colspan="4" class="table-empty">No cross-platform application routes processing.</td></tr>`;
                return;
            }

            snapshot.forEach((appDoc) => {
                const aData = appDoc.data();
                const aId = appDoc.id;

                const row = `
                    <tr>
                        <td>
                            <div class="primary-table-text">${escapeHtml(aData.applicantEmail || 'Anonymous Applicant')}</div>
                            <div class="secondary-table-id">UID: ${escapeHtml(aData.applicantUid || 'N/A')}</div>
                        </td>
                        <td>
                            <div class="primary-table-text">${escapeHtml(aData.jobTitle || 'Unknown Job Title')}</div>
                            <div class="secondary-table-id">Job ID: ${escapeHtml(aData.jobId || 'N/A')}</div>
                        </td>
                        <td><span class="status-badge status-pending">In Transmission</span></td>
                        <td style="text-align: right;">
                            <button class="admin-action-btn btn-delete-app" data-aid="${aId}"><i class="fa-solid fa-folder-minus"></i> Sever Route</button>
                        </td>
                    </tr>
                `;
                appsTableBody.insertAdjacentHTML("beforeend", row);
            });
        }, (err) => {
            console.error("Interceptor application stream sync break:", err);
            appsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Intercept Failure: ${escapeHtml(err.message)}</td></tr>`;
        });
    }

    // 4. Live Job Listing Compliance Table Stream
    const jobsTableBody = document.getElementById("jobsTableBody");
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        if (!jobsTableBody) return;
        jobsTableBody.innerHTML = "";

        if (snapshot.empty) {
            jobsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No platform jobs currently deployed.</td></tr>`;
            return;
        }

        snapshot.forEach((jobDoc) => {
            const jData = jobDoc.data();
            const jId = jobDoc.id;

            const row = `
                <tr>
                    <td>
                        <div class="primary-table-text">${escapeHtml(jData.title || 'Untitled Listing')}</div>
                        <div style="font-size:0.8rem; color:#6366f1; font-weight: 500;">${escapeHtml(jData.company || 'Unverified Employer')}</div>
                    </td>
                    <td><i class="fa-solid fa-location-dot" style="color:var(--text-muted); font-size:0.85rem;"></i> ${escapeHtml(jData.location || 'Remote')}</td>
                    <td class="secondary-table-id">${jId}</td>
                    <td style="text-align: right;">
                        <button class="admin-action-btn btn-delete-job" data-jid="${jId}" data-title="${escapeHtml(jData.title)}"><i class="fa-solid fa-trash-can"></i> Purge Listing</button>
                    </td>
                </tr>
            `;
            jobsTableBody.insertAdjacentHTML("beforeend", row);
        });
    }, (err) => {
        console.error("Compliance table listing synchronization failure:", err);
        if (jobsTableBody) {
            jobsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Sync Error: ${escapeHtml(err.message)}</td></tr>`;
        }
    });
}

// =========================================================================
// 🛠️ ISOLATED DIRECT LIVE SIGN-IN USER PROVISIONING INTERCEPTOR
// =========================================================================
function setupFormInterceptors() {
    const addUserForm = document.getElementById("addUserForm");
    if (!addUserForm) {
        console.warn("⚠️ Execution Notice: Form with tracking ID 'addUserForm' was not detected on view layer.");
        return;
    }

    addUserForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("⚡ Secure Isolated Account Provisioning sequence initialization triggered...");

        // Direct DOM value capturing mapping your custom registration layout
        const nameVal = document.getElementById("newName").value.trim();
        const emailVal = document.getElementById("newEmail").value.trim();
        const phoneVal = document.getElementById("newPhone").value.trim();
        const locationVal = document.getElementById("newLocation").value;
        const passwordVal = document.getElementById("newPassword").value;
        const confirmPasswordVal = document.getElementById("confirmPassword").value;

        // Validation gate checking
        if (passwordVal !== confirmPasswordVal) {
            alert("❌ Entry Rejection: Passwords do not match!");
            return;
        }

        if (passwordVal.length < 6) {
            alert("❌ Entry Rejection: Passwords must be at least 6 characters long.");
            return;
        }

        try {
            console.log("Provisioning authentication parameters via independent secondary ecosystem routing...");
            
            // Step 1: Force authenticatable login credentials inside Firebase Authentication Engine
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailVal, passwordVal);
            const dynamicUid = userCredential.user.uid;
            
            console.log(`Auth node registration verified. Generated System ID Reference Key: ${dynamicUid}`);

            // Step 2: Push database metadata configurations to user collection using the exact generated UID
            await setDoc(doc(db, "users", dynamicUid), {
                uid: dynamicUid,
                fullName: nameVal,
                email: emailVal,
                phone: phoneVal,
                location: locationVal || "Not Specified",
                role: "Job Seeker", // Standardizing created accounts without role field clutter
                isAdmin: false, 
                createdAt: serverTimestamp(),
                accountStatus: "active",
                profileCompleted: true
            });

            console.log("Firestore profile synchronized successfully under tracking UID.");

            // Step 3: Evict user session cache token from secondary scope immediately
            await secondaryAuth.signOut();

            alert(`🎉 Success!\n\nAccount for "${nameVal}" has been registered successfully. They can now immediately log into the platform with their email.`);
            addUserForm.reset();

        } catch (err) {
            console.error("❌ Isolated Account Creation Pipeline failure sequence triggered:", err);
            alert(`Profile Allocation Fault:\n${err.message}`);
        }
    });
}

// =========================================================================
// ADMINISTRATIVE ACTION ROUTERS (DELETION MANAGEMENT PROTOCOLS)
// =========================================================================
document.addEventListener("click", async (e) => {
    
    // Privilege A: Terminate Account Node
    const userBtn = e.target.closest(".btn-delete-user");
    if (userBtn) {
        const targetUid = userBtn.getAttribute("data-uid");
        if (confirm(`⚠️ CRITICAL COMMAND OPERATION:\nAre you sure you want to permanently delete account object [${targetUid}] from Cloud Firestore? This cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, "users", targetUid));
                alert("Account document purged from node storage registry successfully.");
            } catch (err) {
                alert(`Operation failure: ${err.message}`);
            }
        }
    }

    // Privilege B: Purge Compliance Job Listing
    const jobBtn = e.target.closest(".btn-delete-job");
    if (jobBtn) {
        const targetJid = jobBtn.getAttribute("data-jid");
        const jobTitle = jobBtn.getAttribute("data-title");
        if (confirm(`⚖️ COMPLIANCE PURGE NOTICE:\nRemove listing "${jobTitle}" permanently? Choose this path if the payload metrics violate platform safety terms.`)) {
            try {
                await deleteDoc(doc(db, "jobs", targetJid));
                alert("Listing deleted completely system-wide.");
            } catch (err) {
                alert(`Operation failure: ${err.message}`);
            }
        }
    }

    // Privilege C: Severe Transmission Routing Node (Application Deletion)
    const appBtn = e.target.closest(".btn-delete-app");
    if (appBtn) {
        const targetAid = appBtn.getAttribute("data-aid");
        if (confirm(`⚠️ TRANSMISSION BLOCK PROTOCOL:\nPermanently destroy application instance pointer [${targetAid}] from the infrastructure routing pool?`)) {
            try {
                await deleteDoc(doc(db, "applications", targetAid));
                alert("Application telemetry tracking node severed successfully.");
            } catch (err) {
                alert(`Operation failure: ${err.message}`);
            }
        }
    }
});

function renderAdminSidebarLink() {
    const placeholder = document.getElementById("adminLinkPlaceholder");
    if (placeholder) {
        placeholder.innerHTML = `
            <a href="admin.html" class="active-sidebar-link" style="color: #a855f7; border-left: 3px solid #a855f7; background: rgba(168, 85, 247, 0.15); font-weight: 700; display: flex; align-items: center; gap: 8px; padding: 10px 15px; text-decoration: none; border-radius: 0 6px 6px 0; margin: 4px 0;">
                <i class="fa-solid fa-shield-halved"></i> Admin Center
            </a>
        `;
    }
}

if (menuBtn) {
    menuBtn.onclick = (e) => { e.stopPropagation(); sidebar.classList.toggle('active'); };
}
document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuBtn) {
        sidebar.classList.remove('active');
    }
});
if (logoutBtn) {
    logoutBtn.onclick = async () => { if (confirm("Exit session?")) { await signOut(auth); window.location.href = 'login.html'; } };
}
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}