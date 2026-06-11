/* ==========================================================================
   JOSHIPRO CHATBOT MODULE LOGIC ENGINE - OFFICIAL GOOGLE SDK ROUTING
   ========================================================================== */
import { db } from "./config.js"; 
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ THE FIX: Import Google's official generative AI browser client distribution module
import { GoogleGenAI } from "https://esm.run/@google/genai";

// Your active developer platform tracking token
const GEMINI_API_KEY = "AQ_YOUR_API_KEY_HERE"; 

// ✅ INITIALIZE CORE CLIENT: This library wrapper correctly handles the AQ token encryption signature
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

document.addEventListener('DOMContentLoaded', () => {
    // Structural Node Mappings targeting help.html definitions
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotForm = document.getElementById('chatbotForm');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotMessages = document.getElementById('chatbotMessages');

    // Context injector prompt keeping response parameters scoped
    const systemPrompt = "You are the friendly, professional AI Assistant for JOSHIPRO, an advanced job portal platform in Kenya. Help users with resumes, applications, tracking jobs, and navigating the dashboard. Keep answers clear and under 3 sentences.";

    // 1. Structural Panel Overlay Toggle Handling Engine
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            chatbotWindow.classList.toggle('active');
            if (chatbotWindow.classList.contains('active') && chatbotInput) {
                chatbotInput.focus();
            }
        });
    }

    if (chatbotClose) {
        chatbotClose.addEventListener('click', (e) => {
            e.stopPropagation();
            chatbotWindow.classList.remove('active');
        });
    }

    if (chatbotWindow) {
        chatbotWindow.onclick = (e) => { e.stopPropagation(); };
    }

    document.addEventListener("click", () => {
        if (chatbotWindow && chatbotWindow.classList.contains("active")) {
            chatbotWindow.classList.remove("active");
        }
    });

    // Helper: Generate and append structural dynamic text elements
    function createMessageBubble(text, senderType) {
        if (!chatbotMessages) return;
        const bubble = document.createElement('div');
        bubble.classList.add('chat-message', senderType);
        
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, "<br>");

        bubble.innerHTML = formattedText;
        chatbotMessages.appendChild(bubble);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return bubble;
    }

    // Helper: Manage state indicator modules cleanly
    function createTypingIndicator() {
        if (!chatbotMessages) return;
        const indicator = document.createElement('div');
        indicator.classList.add('chat-message', 'bot');
        indicator.id = 'chatbotTyping';
        indicator.innerHTML = '<i>JOSHIPRO Bot is looking up ecosystem variables...</i>';
        chatbotMessages.appendChild(indicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('chatbotTyping');
        if (indicator) indicator.remove();
    }

    // 2. Transaction Stream Submission Management Loop
    if (chatbotForm) {
        chatbotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userPrompt = chatbotInput.value.trim();
            if (!userPrompt) return;

            createMessageBubble(userPrompt, 'user');
            chatbotInput.value = '';
            createTypingIndicator();

            let aiResponseText = "";

            // 3. SDK Generation Hook: Processing requests through native channels
            try {
                // This replaces the old raw fetch call completely to support your AQ token signature
                const response = await ai.models.generateContent({
                    model: 'gemini-1.5-flash',
                    contents: `${systemPrompt}\n\nUser Question: ${userPrompt}`,
                });

                if (response && response.text) {
                    aiResponseText = response.text;
                } else {
                    throw new Error("Empty or unexpected structural return matrix from SDK pipeline.");
                }
                
            } catch (error) {
                console.error("AI Communication Failure Context:", error);
                aiResponseText = "I'm having trouble connecting to my system core right now. Please try your question again in a brief moment!";
            } finally {
                removeTypingIndicator();
                createMessageBubble(aiResponseText, 'bot');
            }

            // 4. Cloud Ledger Backup Sync
            try {
                await addDoc(collection(db, "support_tickets"), {
                    query: userPrompt,
                    reply: aiResponseText,
                    timestamp: new Date(),
                    origin: "help_center_bot"
                });
                console.log("Firestore backup logged successfully.");
            } catch (dbError) {
                console.error("Firestore tracking loop failed:", dbError);
            }
        });
    }
});