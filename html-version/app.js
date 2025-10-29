// CONFIG
const API_URL = "https://SEU_BACKEND_AQUI/api/chat"; // depois tem q trocar
let useSimulation = true; // se true -> usa respostas automáticas locais; se false -> tenta chamar API

const OPEN_BTN = document.getElementById("chat-toggle");
const CLOSE_BTN = document.getElementById("chat-close");
const WIDGET = document.getElementById("chat-widget");
const FORM = document.getElementById("chat-form");
const INPUT = document.getElementById("chat-input");
const MSGS = document.getElementById("messages");

// abrir/fechar
OPEN_BTN.addEventListener("click", () => {
    WIDGET.classList.remove("closed");
    OPEN_BTN.style.display = "none";
    if (!WIDGET.dataset.welcomed) {
        botMessage("Bem-vindo à Vista Verdurão! 🌿<br>O que você gostaria de comprar hoje?");
        showQuickReplies(["Camisetas", "Calças", "Acessórios", "Shorts e Bermudas", "Ofertas do dia"]);
        WIDGET.dataset.welcomed = "1";
    }
});
CLOSE_BTN.addEventListener("click", () => {
    WIDGET.classList.add("closed");
    OPEN_BTN.style.display = "block";
});

FORM.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = INPUT.value.trim();
    if (!text) return;
    handleUserMessage(text);
    INPUT.value = "";
});

function appendMessage(text, who = "bot") {
    const el = document.createElement("div");
    el.className = `msg ${who}`;
    el.innerHTML = text;
    MSGS.appendChild(el);
    MSGS.scrollTop = MSGS.scrollHeight;
}

function botMessage(txt) { appendMessage(txt, "bot"); }
function userMessage(txt) { appendMessage(txt, "user"); }

function showQuickReplies(options = []) {
    const container = document.createElement("div");
    container.className = "quick-replies";
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "quick-btn";
        btn.textContent = opt;
        btn.onclick = () => handleUserMessage(opt);
        container.appendChild(btn);
    });
    MSGS.appendChild(container);
    MSGS.scrollTop = MSGS.scrollHeight;
}

/* UTIL: simula atraso */
function wait(ms = 600) { return new Promise(res => setTimeout(res, ms)); }

/* LÓGICA: handleUserMessage - tenta API se useSimulation === false, senão responde localmente */
async function handleUserMessage(text) {
    userMessage(text);

    const typing = document.createElement("div");
    typing.className = "msg bot";
    typing.textContent = "...";
    MSGS.appendChild(typing);
    MSGS.scrollTop = MSGS.scrollHeight;

    if (useSimulation) {
        await wait(800);
        typing.remove();
        simulateResponse(text);
        return;
    }

    // TENTAR CHAMAR API
    try {
        const payload = { message: text, session_id: "demo-session" };
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Erro na API: " + res.status);
        const data = await res.json();
        typing.remove();

        if (data.reply) botMessage(data.reply);
        if (Array.isArray(data.quick_replies)) showQuickReplies(data.quick_replies);
        if (Array.isArray(data.products)) data.products.forEach(p => showProduct(p));
    } catch (err) {
        typing.remove();
        botMessage("Desculpe, houve um problema ao se conectar com o servidor. 😔 (modo demo ativado)");
        console.error(err);
        // fallback para demo
        simulateResponse(text);
    }
}

/* Mostra card simulado */
function showProduct(prod) {
    const card = document.createElement("div");
    card.className = "produto-card";
    card.innerHTML = `
    <img src="${prod.image}" alt="${prod.title}">
    <div><strong>${prod.title}</strong></div>
    <div>${prod.price ? prod.price : ""}</div>
    <a href="${prod.url || '#'}" target="_blank">Ver produto</a>
  `;
    MSGS.appendChild(card);
    MSGS.scrollTop = MSGS.scrollHeight;
}

/* SIMULAÇÕES: fluxo de respostas automáticas com imagens ilustrativas */
function simulateResponse(text) {
    const t = text.toLowerCase();
    // fluxos básicos
    if (t.includes("camiseta") || t === "camisetas") {
        botMessage("Perfeito! Alguma preferência de cor?");
        showQuickReplies(["Cor Branca", "Cor Preta", "Cor Azul", "Cor Vermelha", "Estampada"]);
        return;
    }
    if (t.includes("calça") || t === "calças") {
        botMessage("Ótimo — quer ver jeans ou moletom?");
        showQuickReplies(["Jeans", "Moletom"]);
        return;
    }
    if (t.includes("acessório") || t === "acessórios") {
        botMessage("Temos bonés, bolsas e bijuterias. Quer ver bonés ou bolsas?");
        showQuickReplies(["Bonés", "Bolsas", "Bijuterias"]);
        return;
    }
    if (t.includes("oferta") || t.includes("promoção") || t === "ofertas do dia") {
        botMessage("Aqui estão as ofertas do dia:");
        showProduct({
            image: "./img/camiseta-branca.jpg",
            title: "Camiseta Básica - R$49,90",
            price: "R$49,90",
            url: "#"
        });
        showProduct({
            image: "./img/calca-jeans.jpg",
            title: "Calça Jeans - R$119,90",
            price: "R$119,90",
            url: "#"
        });
        showProduct({
            image: "./img/acessorio.jpg",
            title: "Boné Verde - R$39,90",
            price: "R$39,90",
            url: "#"
        });
        return;
    }

    // cores
    if (t.includes("cor branca") || t.includes("branca")) {
        botMessage("Ótimo! Veja algumas camisetas brancas que combinam com tudo:");
        showProduct({
            image: "./img/camiseta-branca.jpg",
            title: "Camiseta Branca Clássica - R$49,90",
            price: "R$49,90",
            url: "#"
        });
        return;
    }
    if (t.includes("jeans")) {
        botMessage("Jeans — estilo e conforto. Veja essas opções:");
        showProduct({
            image: "./img/calca-jeans.jpg",
            title: "Jeans Reto - R$129,90",
            price: "R$129,90",
            url: "#"
        });
        return;
    }
    if (t.includes("boné") || t.includes("bones")) {
        botMessage("Bonés disponíveis:");
        showProduct({
            image: "./img/acessorio.jpg",
            title: "Boné Vista - R$39,90",
            price: "R$39,90",
            url: "#"
        });
        return;
    }

    // perguntas de estilo/clima
    if (t.includes("dia quente") || t.includes("quente")) {
        botMessage("Para dia quente recomendamos tecidos leves e cores claras. Quer ver camisetas leves?");
        showQuickReplies(["Sim, mostrar camisetas leves", "Não, outras opções"]);
        return;
    }
    if (t.includes("noite") || t.includes("fria")) {
        botMessage("Para noite fria, temos jaquetas e moletons aconchegantes. Quer ver moletons?");
        showQuickReplies(["Sim, mostrar moletons", "Não, obrigado"]);
        return;
    }

    // fallback genérico
    botMessage("Entendi! Que tipo de produto você procura? (Camisetas, Calças, Acessórios, Ofertas)");
    showQuickReplies(["Camisetas", "Calças", "Acessórios", "Ofertas do dia"]);
}
