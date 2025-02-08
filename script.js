const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const loader = document.getElementById("loader");
const loaderText = document.getElementById("loader-text");
const container = document.querySelector(".chat-container");

const API_KEY = "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"; // 🔴 Usa tu API Key de TogetherAI aquí
const CHAT_STORAGE_KEY = "chat_history"; // Guardar historial en el navegador

// Loader con efecto de máquina de escribir
const text = "</bondar> chat IA";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        loaderText.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeWriter, 150);
    } else {
        setTimeout(() => {
            loader.style.display = "none";
            container.classList.remove("hidden");
        }, 500);
    }
}

typeWriter();

// Cargar historial al iniciar
document.addEventListener("DOMContentLoaded", loadChatHistory);

async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === "") return;

    // Mostrar el mensaje del usuario
    appendMessage("Usuario", userMessage);
    saveToHistory("Usuario", userMessage);

    // Enviar a TogetherAI y obtener la respuesta
    const botResponse = await fetchGPT(userMessage);
    appendMessage("Chat IA", botResponse);
    saveToHistory("Chat IA", botResponse);

    userInput.value = "";
}

// Obtener respuesta de TogetherAI
async function fetchGPT(message) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-4-turbo", // Puedes cambiarlo a "anthropic/claude-3-opus"
                messages: [{ role: "user", content: message }],
                max_tokens: 200
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error API:", errorData);
            return `⚠️ Error ${response.status}: ${errorData.error?.message || "Error desconocido"}`;
        }

        const data = await response.json();
        return data.choices[0].message.content.trim() || "⚠️ No recibí una respuesta válida.";
    } catch (error) {
        console.error("Error:", error);
        return "⚠️ Error al conectar con la API.";
    }
}

// Mostrar mensajes en el chat
function appendMessage(sender, text) {
    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messageDiv.style.margin = "10px 0";
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Guardar mensajes en localStorage
function saveToHistory(sender, message) {
    let chatHistory = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
    chatHistory.push({ sender, message });
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
}

// Cargar historial del chat
function loadChatHistory() {
    let chatHistory = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
    chatHistory.forEach(msg => appendMessage(msg.sender, msg.message));
}

// (Opcional) Borrar historial del chat
function clearChatHistory() {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    chatBox.innerHTML = "";
}
// Función para mostrar los mensajes en el chat y hacer scroll automático
function appendMessage(sender, text) {
    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messageDiv.style.margin = "10px 0";
    chatBox.appendChild(messageDiv);

    // 🔥 Auto scroll hacia abajo cuando llega un nuevo mensaje
    chatBox.scrollTop = chatBox.scrollHeight;
}
