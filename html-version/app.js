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
        showQuickReplies(["Camisetas", "Vestidos", "Coleções", "Acessórios", "Ofertas do dia"]);
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
        botMessage("Perfeito! Masculino ou Feminino?");
        showQuickReplies(["Masculino", "Feminino"]);
        return;
    }
    
    if (t.includes("Masculino") || t === "masculino") {
        botMessage("Perfeito! Alguma preferência de cor?");
        showQuickReplies(["Cor Branca", "Cor Preta", "Cor Azul", "Cor Vermelha", "Estampada"]);
        return;
    }

     if (t.includes("Feminino") || t === "feminino") {
        botMessage("Perfeito! Alguma preferência de cor?");
        showQuickReplies(["Cor Branca", "Cor Preta", "Cor Azul", "Cor Vermelha", "Estampada"]);
        return;
    }

    if (t.includes("coleções") || t === "coleções") {
        botMessage("Ótimo — Gostaria de ver qual coleção?");
        showQuickReplies(["Gurulino", "Brixx", "Flona", "Clássicos de BSB"]);
        return;
    }
    if (t.includes("acessório") || t === "acessórios") {
        botMessage("Temos Bonés & Buckets, Bolsas & Ecobags, Meias, Chinelos & Sandálias. O que gostaria de ver?");
        showQuickReplies(["Bonés & Buckets", "Bolsas & Ecobags", "Meias", "Chinelos & Sandálias"]);
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
    if (t.includes("vestidos") || t.includes("vestido")) {
        botMessage("Ótimo! Veja algumas opções de vestidos:");
        showProduct({
            image: "./img/vestidos.png",
            title: "Vestidos Verdurão - A partir R$389,90",
            price: "R$389,90",
            url: "https://vistaverdurao.com.br/collections/colecao-vestidos"
        });
        return;
    }

    // cores
    if (t.includes("cor branca") || t.includes("branca")) {
        botMessage("Ótimo! Veja algumas camisetas brancas que combinam com tudo:");
        showProduct({
            image: "./img/camiseta_branca.png",
            title: "Camiseta Branca Clássica - R$169,90",
            price: "R$169,90",
            url: "https://vistaverdurao.com.br/collections/camisetas-verdurao/products/camiseta-nascido-e-criado-no-df"
        });
        return;
    }
    
    if (t.includes("cor preta") || t.includes("preta")) {
        botMessage("Ótimo! Veja algumas camisetas pretas que combinam com tudo:");
        showProduct({
            image: "./img/camisa_preta.png",
            title: "Camiseta Preta Clássica - R$159,90",
            price: "R$159,90",
            url: "https://vistaverdurao.com.br/collections/camisetas-verdurao/products/camiseta-lobo-saltando"
        });
        return;
    }
    if (t.includes("cor azul") || t.includes("azul")) {
        botMessage("Ótimo! Veja algumas camisetas azuis que você pode gostar:");
        showProduct({
            image: "./img/camisa_azul.png",
            title: "Camiseta Azul Clássica - R$159,90",
            price: "R$159,90",
            url: "https://vistaverdurao.com.br/collections/camisetas-verdurao/products/camiseta-homem-boiando"
        });
        return;
    }
    if (t.includes("cor vermelha") || t.includes("vermelha")) {
        botMessage("Ótimo! Veja algumas camisetas vermelhas que você pode gostar:");
        showProduct({
            image: "./img/camisa_vermelha.png",
            title: "Camiseta Vermelha Clássica - R$189,90",
            price: "R$189,90",
            url: "https://vistaverdurao.com.br/collections/camisetas-verdurao/products/camiseta-quadra"
        });
        return;
    }

    if (t.includes("estampada") || t.includes("estampa")) {
        botMessage("Ótimo! Veja algumas camisetas estampadas que você pode gostar:");
        showProduct({
            image: "./img/camiseta_estampada.png",
            title: "Camisetas Estampadas Clássicas - A partir de: R$119,90",
            price: "R$119,90",
            url: "https://vistaverdurao.com.br/collections/camisetas-verdurao"
        });
        return;
    }
        
    if (t.includes("gurulino")) {
        botMessage("Ótima escolha! Coleção Gurulino disponível:");
        showProduct({
            image: "./img/gurulino.png",
            title: "Coleção GURULINO - A Partir de: R$199,90",
            price: "R$199,90",
            url: "https://vistaverdurao.com.br/collections/t-shirts-gurulino"
        });
        return;
    }

    if (t.includes("brixx")) {
        botMessage("Ótima escolha! Coleção Brixx disponível:");
        showProduct({
            image: "./img/brixx.png",
            title: "Coleção BRIXX - A Partir de: R$189,90",
            price: "R$189,90",
            url: "https://vistaverdurao.com.br/collections/brixx"
        });
        return;
    }

    if (t.includes("flona")) {
        botMessage("Ótima escolha! Coleção Flona disponível:");
        showProduct({
            image: "./img/flona.png",
            title: "Coleção FLONA - A partir de: R$149,95",
            price: "R$149,95",
            url: "https://vistaverdurao.com.br/collections/flona"
        });
        return;
    }

    if (t.includes("clássicos de bsb") || t.includes("classicos")) {
        botMessage("Ótima escolha! Coleção Clássicos de BSB disponível:");
        showProduct({
            image: "./img/classicos.png",
            title: "Clássicos de BSB - A partir de: R$119,90",
            price: "R$119,90",
            url: "https://vistaverdurao.com.br/collections/classicos-de-bsb"
        });
        return;
    }
    
    if (t.includes("boné") || t.includes("boné")) {
        botMessage("Bonés & Buckets disponíveis:");
        showProduct({
            image: "./img/bones.png",
            title: "Boné Vista - R$159,90",
            price: "R$159,90",
            url: "https://vistaverdurao.com.br/collections/bones-e-buckets"
        });
        return;
    }

    if (t.includes("meias") || t.includes("meias")) {
        botMessage("Ótima escolha! Meias disponíveis:");
        showProduct({
            image: "./img/meias.png",
            title: "Meia Vista - R$79,90",
            price: "R$79,90",
            url: "https://vistaverdurao.com.br/collections/meias"
        });
        return;
    }

    if (t.includes("chinelos e sandálias") || t.includes("chinelos") || t.includes("sandálias")) {
        botMessage("Ótima escolha! Chinelos e Sandálias disponíveis:");
        showProduct({
            image: "./img/chinelo.png",
            title: "Sandálias Vista - R$169,90 - 89,90",
            price: "R$169,90 - 89,90",
            url: "https://vistaverdurao.com.br/collections/chinelos-e-sandalias"
        });
        return;
    }

    if (t.includes("Ecobags e bolsas") || t.includes("ecobags") || t.includes("bolsas")) {
        botMessage("Ótima escolha! Ecobags e Bolsas disponíveis:");
        showProduct({
            image: "./img/bolsas.png",
            title: "Bolsas e Ecobags Vista - A partir de R$189,90",
            price: "R$189,90",
            url: "https://vistaverdurao.com.br/collections/bolsas"
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

     // perguntas de eventos/clima
    if (t.includes("praia") || t.includes("quente")) {
        botMessage("Para praia recomendamos roupas de banho. Deseja ver?");
        showQuickReplies(["Sim, mostrar camisetas leves", "Não, outras opções"]);
        return;
    }
    if (t.includes("festa") || t.includes("fria")) {
        botMessage("Para festa, temos vestidos. Deseja ver?");
        showQuickReplies(["Sim, mostrar vestidos", "Não, obrigado"]);
        return;
    }
    //
    if (t.includes("trabalho") || t.includes("formal")) {
        botMessage("Para trabalho recomendamos roupa formal. Deseja ver?");
        showQuickReplies(["Sim, mostrar roupas formais", "Não, outras opções"]);
        return;
    }
    if (t.includes("passeio") || t.includes("casual")) {
        botMessage("Para passeio, temos roupa casual. Quer ver?");
        showQuickReplies(["Sim, mostrar roupa casual", "Não, obrigado"]);
        return;
    }

    // fallback genérico
    botMessage("Entendi! Que tipo de produto você procura? (Camisetas, Coleções, Acessórios, Ofertas)");
    showQuickReplies(["Camisetas", "Vestidos", "Coleções", "Acessórios", "Ofertas do dia"]);
}
