// Ensure the DOM is fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");
    const chatbox = document.querySelector(".chatbox");
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const chatbotCloseBtn = document.querySelector(".close-btn");

    let userMessage;
    const API_KEY = "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";
    const inputInitHeight = chatInput.scrollHeight;

    // Create <li> element to display messages
    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" ? `<p></p>` : '<span class="material-symbols-outlined">smart_toy</span><p>Thinking...</p>';
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    }

    // Send API request to OpenAI and receive response
    const generateResponse = (incomingChatLi) => {
        const API_URL = "https://api.groq.com/openai/v1/chat/completions";  // Correct URL for gpt-3.5-turbo
        const messageElement = incomingChatLi.querySelector("p");

        // Check if userMessage is valid
        if (!userMessage || userMessage.trim() === "") {
            console.error("userMessage is empty or invalid.");
            messageElement.textContent = "Empty message. Please try again.";
            return;
        }

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: userMessage }],
                max_tokens: 700,
                temperature: 0.7
            })
        };

        // Log requestOptions for debugging
        console.log("Sending request with options:", requestOptions);

        fetch(API_URL, requestOptions)
            .then(res => {
                console.log("Response status:", res.status);  // Log response status

                if (!res.ok) {
                    return res.json().then(errorData => {
                        console.error('Error details from API:', errorData);  // Log error details
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    });
                }
                return res.json();
            })
            .then(data => {
                console.log("Response data:", data);  // Log full API response

                if (data && data.choices && data.choices.length > 0) {
                    messageElement.textContent = data.choices[0].message.content.trim();  // Correct field for GPT-3.5-turbo
                } else {
                    messageElement.textContent = "No response received. Please try again.";
                }
            })
            .catch((error) => {
                console.error('Error fetching data from API:', error);
                messageElement.classList.add("error");
                if (error.message.includes("429")) {
                    messageElement.textContent = "You have exceeded the request limit. Please try again later.";
                } else if (error.message.includes("401")) {
                    messageElement.textContent = "API Key authentication error. Please check your API Key.";
                } else {
                    messageElement.textContent = "Sorry! An error occurred. Please try again.";
                }
            }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }

    // Handle the event when the user sends a message
    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) {
            console.error("User input is empty.");  // Log when user input is empty
            return;
        }
        chatInput.style.height = `${inputInitHeight}px`;
        // Add user's message to the chatbox
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        // Add "Thinking..." message after 600ms
        setTimeout(() => {
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);  // Call function to send API request
        }, 600);

        chatInput.value = "";  // Reset input after sending message
    }

    chatInput.addEventListener("input", () => {
        // Adjust the height of the input textarea based on its content
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        // If Enter key is pressed without Shift key and the window width is greater than 800px, handle the chat
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    // Add click event for the send message button
    sendChatBtn.addEventListener("click", handleChat);
    chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
});
