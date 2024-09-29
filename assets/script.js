const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn");

let userMessage;
const API_KEY = "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";
const inputInitHeight = chatInput.scrollHeight;

// Tạo phần tử <li> để hiển thị tin nhắn
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p></p>` : '<span class="material-symbols-outlined">smart_toy</span><p>Thinking...</p>';
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

// Gửi yêu cầu API tới OpenAI và nhận phản hồi
const generateResponse = (incomingChatLi) => {
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";  // Đúng URL cho gpt-3.5-turbo
    const messageElement = incomingChatLi.querySelector("p");

    // Kiểm tra xem userMessage có hợp lệ không
    if (!userMessage || userMessage.trim() === "") {
        console.error("userMessage is empty or invalid.");
        messageElement.textContent = "Tin nhắn trống. Vui lòng thử lại.";
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
            max_tokens: 450,
            temperature: 0.7
        })
    };

    // Thêm log để kiểm tra requestOptions
    console.log("Sending request with options:", requestOptions);

    fetch(API_URL, requestOptions)
        .then(res => {
            console.log("Response status:", res.status);  // Log trạng thái phản hồi

            if (!res.ok) {
                return res.json().then(errorData => {
                    console.error('Error details from API:', errorData);  // Log chi tiết lỗi
                    throw new Error(`HTTP error! Status: ${res.status}`);
                });
            }
            return res.json();
        })
        .then(data => {
            console.log("Response data:", data);  // Log toàn bộ phản hồi từ API

            if (data && data.choices && data.choices.length > 0) {
                messageElement.textContent = data.choices[0].message.content.trim();  // Đúng trường dữ liệu cho GPT-3.5-turbo
            } else {
                messageElement.textContent = "Không nhận được phản hồi. Vui lòng thử lại.";
            }
        })
        .catch((error) => {
            console.error('Error fetching data from API:', error);
            messageElement.classList.add("error");
            if (error.response) {
                console.log('API response data:', error.response.data);  // Log chi tiết từ phản hồi của API
            }
            if (error.message.includes("429")) {
                messageElement.textContent = "Bạn đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau một lát.";
            } else if (error.message.includes("401")) {
                messageElement.textContent = "Lỗi xác thực API Key. Vui lòng kiểm tra lại API Key của bạn.";
            } else {
                messageElement.textContent = "Xin lỗi! Đã xảy ra lỗi. Vui lòng thử lại.";
            }
        }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

// Xử lý sự kiện khi người dùng gửi tin nhắn
const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) {
        console.error("User input is empty.");  // Log khi người dùng không nhập tin nhắn
        return;
    }
    chatInput.computedStyleMap.height = `${inputInitHeight}px`;
    // Thêm tin nhắn của người dùng vào chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Thêm tin nhắn "Đang suy nghĩ..." sau 600ms
    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);  // Gọi hàm gửi yêu cầu API
    }, 600);

    chatInput.value = "";  // Reset input sau khi gửi tin nhắn
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the inphut textarea based on its content
    chatInput.computedStyleMap.height = `${inputInitHeight}px`;
    chatInput.computedStyleMap.height = `${chatInput.scrollHeight}px`;
})

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window
    // width is the greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800){
        e.preventDefault();
        handleChat();
    }
})

// Thêm sự kiện click cho nút gửi tin nhắn
sendChatBtn.addEventListener("click", handleChat);
chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
