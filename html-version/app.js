// Seleciona elementos
const chatToggle = document.getElementById("chat-toggle");
const chatWidget = document.getElementById("chat-widget");
const chatClose = document.getElementById("chat-close");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const messagesContainer = document.getElementById("messages");

// URL da API FastAPI
const API_URL = "http://127.0.0.1:8000/chat";

// Alterna o widget de chat
chatToggle.addEventListener("click", () => {
  chatWidget.classList.toggle("closed");
});

chatClose.addEventListener("click", () => {
  chatWidget.classList.add("closed");
});

// Adiciona mensagens ao chat
function addMessage(text, sender = "user") {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Evento de envio
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  // Mostra a mensagem do usuário
  addMessage(message, "user");
  chatInput.value = "";

  // Mostra indicador de carregamento
  const loading = document.createElement("div");
  loading.classList.add("message", "bot");
  loading.textContent = "Digitando...";
  messagesContainer.appendChild(loading);

  try {
    // Faz requisição para o backend
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    // Remove o "Digitando..."
    loading.remove();

    // Mostra resposta do bot
    addMessage(data.reply || "Desculpe, não entendi.", "bot");

  } catch (err) {
    loading.remove();
    addMessage("Erro ao conectar com o servidor.", "bot");
    console.error(err);
  }
});
