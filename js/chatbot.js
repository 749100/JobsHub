// ==========================================
// 🤖 JOSHIPRO LOCAL INTERACTIVE HELP DESK BOT ENGINE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const chatbotToggle = document.getElementById("chatbotToggle");
    const chatbotWindow = document.getElementById("chatbotWindow");
    const chatbotClose = document.getElementById("chatbotClose");
    const chatbotMessages = document.getElementById("chatbotMessages");
    const chatbotInput = document.getElementById("chatbotInput");
    const chatbotSend = document.getElementById("chatbotSend");

    // Toggle Chat visibility window flags
    if (chatbotToggle && chatbotWindow) {
        chatbotToggle.onclick = (e) => {
            e.stopPropagation();
            chatbotWindow.classList.toggle("active");
        };
    }

    // Dismiss active UI element via Header controls
    if (chatbotClose && chatbotWindow) {
        chatbotClose.onclick = (e) => {
            e.stopPropagation();
            chatbotWindow.classList.remove("active");
        };
    }

    // Isolate click actions executing inside the target panel bounds
    if (chatbotWindow) {
        chatbotWindow.onclick = (e) => {
            e.stopPropagation();
        };
    }

    // Click outside to hide active window pane safely
    document.addEventListener("click", () => {
        if (chatbotWindow && chatbotWindow.classList.contains("active")) {
            chatbotWindow.classList.remove("active");
        }
    });

    // Helper to generate text dialog cards
    const appendChatMessage = (text, sender) => {
        if (!chatbotMessages) return;
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.textContent = text;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    // Form input submission parsing workflow logic
    const processChatbotInput = () => {
        if (!chatbotInput) return;
        const queryText = chatbotInput.value.trim();
        if (!queryText) return;

        // Injects human bubble tracking element node layout
        appendChatMessage(queryText, "user");
        chatbotInput.value = "";

        // Automated Local Keyword Mapping Response Sequence
        setTimeout(() => {
            const lowerQuery = queryText.toLowerCase();
            let response = "I couldn't quite find an exact match for that. Try asking about 'password resets', 'missing tokens', 'withdrawing applications', or 'theme settings'!";

            if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
                response = "Hi there! 👋 Welcome to JOSHIPRO Help Support. Ask me any question related to our knowledge base system fields!";
            } else if (lowerQuery.includes("password") || lowerQuery.includes("reset") || lowerQuery.includes("credential")) {
                response = "Password controls are found on the main Login dashboard interface under 'Forgot Password'. A secure recovery link path will route instantly straight to your inbound email box.";
            } else if (lowerQuery.includes("token") || lowerQuery.includes("verification") || lowerQuery.includes("code")) {
                response = "Account security tokens drop instantly! If missing from your main view, double-check that your spam filters aren't capturing validation strings, or wait 180 seconds before retrying.";
            } else if (lowerQuery.includes("apply") || lowerQuery.includes("status") || lowerQuery.includes("track")) {
                response = "Successful 'Apply Now' submissions write data records live to the cloud backend layer. You can monitor progress lines anytime from your 'My Applications' hub page.";
            } else if (lowerQuery.includes("withdraw") || lowerQuery.includes("cancel") || lowerQuery.includes("remove")) {
                response = "To clear or cancel active job review listings, head to your 'My Applications' dashboard matrix and use the dedicated 'Withdraw' button actions.";
            } else if (lowerQuery.includes("theme") || lowerQuery.includes("color") || lowerQuery.includes("light") || lowerQuery.includes("dark")) {
                response = "The high-performance dark glassmorphic core theme is integrated directly into JOSHIPRO configuration styling scripts to save battery and protect vision. Light layouts are disabled by design.";
            } else if (lowerQuery.includes("frozen") || lowerQuery.includes("freeze") || lowerQuery.includes("cache")) {
                response = "If views freeze up or content fields misbehave, try dropping cached framework files with a hard refresh: Press Ctrl + F5 (or Cmd + Shift + R on Mac devices).";
            } else if (lowerQuery.includes("human") || lowerQuery.includes("ticket") || lowerQuery.includes("contact")) {
                response = "Still stuck? Click the 'Open Human Support Ticket' path link near the bottom footer elements to loop in a live member of our operations crew.";
            }

            appendChatMessage(response, "bot");
        }, 450);
    };

    // Link triggers to interactive input actions
    if (chatbotSend) chatbotSend.onclick = processChatbotInput;
    if (chatbotInput) {
        chatbotInput.onkeydown = (e) => {
            if (e.key === "Enter") processChatbotInput();
        };
    }
});
