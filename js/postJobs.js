// ==========================================
// 1. FIREBASE SDK IMPORTS
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Force long-polling to prevent network drop disconnects
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});

const auth = getAuth(app);

// Base DOM Elements
const jobStatusMsg = document.getElementById("jobStatusMsg");
let currentUserId = null;

// ==========================================
// 2. CHECK VALID AUTHENTICATION SESSION
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Job posting portal secured for recruiter ID:", currentUserId);
    } else {
        console.warn("No active session found. Routing back to entry point...");
        window.location.href = "login.html";
    }
});

// ==========================================
// 3. SUBMIT NEW JOB TO CLOUD FIRESTORE
// ==========================================
const activeForm = document.getElementById("jobForm") || document.querySelector("form");

if (activeForm) {
    console.log("Form hook successfully established!");

    activeForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Stop page from refreshing automatically

        if (!currentUserId) {
            alert("Error: You must be authenticated to list new positions.");
            return;
        }

        try {
            // 1. Capture the form elements cleanly
            const titleInput = activeForm.querySelector('[id*="title" i], [name*="title" i]');
            const companyInput = activeForm.querySelector('[id*="company" i], [name*="company" i]');
            const locationInput = activeForm.querySelector('[id*="location" i], [name*="location" i]');
            const descInput = activeForm.querySelector('[id*="description" i], [name*="description" i], textarea');

            // 2. Safely extract trimmed text values
            const titleVal = titleInput ? titleInput.value.trim() : "";
            const companyVal = companyInput ? companyInput.value.trim() : "";
            const locationVal = locationInput ? locationInput.value.trim() : "";
            const descVal = descInput ? descInput.value.trim() : "";

            console.log("Extracted Payload Data:", { titleVal, companyVal, locationVal, descVal });

            // 3. Ensure validation matches the trimmed values
            if (!titleVal || !companyVal) {
                alert("Please fill out at least the Job Title and Company name fields.");
                return;
            }

            // Build out the structured parameters object
            const jobData = {
                title: titleVal,
                company: companyVal,
                location: locationVal || "Remote",
                description: descVal || "No description provided.",
                salary: "Competitive", 
                type: "Full-Time",     
                postedBy: currentUserId,
                createdAt: serverTimestamp() 
            };

            console.log("Attempting to write document directly to Firestore...");
            await addDoc(collection(db, "jobs"), jobData);
            console.log("Firestore write succeeded!");

            // Display success UI responses
            if (jobStatusMsg) {
                jobStatusMsg.style.color = "#4ade80";
                jobStatusMsg.style.fontWeight = "bold";
                jobStatusMsg.textContent = "🎉 Job listing posted successfully!";
                setTimeout(() => { jobStatusMsg.textContent = ""; }, 5000);
            } else {
                alert("🎉 Job listing posted successfully!");
            }

            activeForm.reset(); 

        } catch (error) {
            console.error("Critical Firestore write failure:", error);
            alert(`Failed to submit job listing: ${error.message}`);
        }
    });
} else {
    console.error("Critical Error: No HTML <form> element could be found on this page!");
}

// ==========================================
// 4. UTILITY HELPERS (Prevents the 'escapeHtml' Uncaught ReferenceError)
// ==========================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "'");
}
