// ✅ FIXED LINE 1-4: Changed root paths to explicit, fully-versioned endpoints to resolve CORS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Select DOM Nodes
const profileForm = document.getElementById("profileForm");
const imageUpload = document.getElementById("imageUpload");
const avatarPreview = document.getElementById("avatarPreview");
const userNameInput = document.getElementById("userName"); 
const userBioInput = document.getElementById("userBio");   
const statusMsg = document.getElementById("statusMsg");

let userId = null; 
let base64ImageString = ""; 

// ==========================================
// A. AUTH STATE LISTENER & DATA RETRIEVAL
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid; 
        console.log("Authenticated User ID:", userId);

        try {
            const userDocRef = doc(db, "users", userId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                if (userNameInput) userNameInput.value = data.name || "";
                if (userBioInput) userBioInput.value = data.bio || "";
                
                if (data.profileImage && avatarPreview) {
                    base64ImageString = data.profileImage;
                    avatarPreview.innerHTML = `<img src="${data.profileImage}" alt="User Profile Image" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                }
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    } else {
        console.warn("No user session active.");
    }
});

// ==========================================
// B. IMAGE TO TEXT CONVERSION (FileReader)
// ==========================================
if (imageUpload) {
    imageUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 500000) {
            alert("Image file is too large! Please upload a photo smaller than 500KB.");
            imageUpload.value = ""; 
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            base64ImageString = reader.result; 
            if (avatarPreview) {
                avatarPreview.innerHTML = `<img src="${base64ImageString}" alt="Preview Image" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            }
        };
        reader.readAsDataURL(file); 
    });
}

// ==========================================
// C. PROFILE SAVE OPERATIONS
// ==========================================
if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (!userId) {
            if (statusMsg) {
                statusMsg.style.color = "#f87171";
                statusMsg.textContent = "Error: You must be logged in to save modifications.";
            }
            return;
        }

        const updatedProfileData = {
          name: userNameInput ? userNameInput.value : "",
          bio: userBioInput ? userBioInput.value : "",
          profileImage: base64ImageString, 
          updatedAt: new Date().toLocaleDateString()
        };

        try {
          await setDoc(doc(db, "users", userId), updatedProfileData, { merge: true }); 
          
          if (statusMsg) {
              statusMsg.style.color = "#4ade80"; 
              statusMsg.textContent = "🎉 Profile modifications saved successfully!";
              setTimeout(() => { statusMsg.textContent = ""; }, 4000);
          }
        } catch (error) {
          console.error("Error saving profile:", error);
          if (statusMsg) {
              statusMsg.style.color = "#f87171";
              statusMsg.textContent = "Error saving profile details.";
          }
        }
    });
}