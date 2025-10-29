import React, { useState, useEffect, useRef } from "react";

const USE_SIMULATION = true;
const API_URL = "https://SEU_BACKEND_AQUI/api/chat"; // substitua quando tiver o back

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (open && messages.length === 0) {
            addBot("Bem-vindo à Vista Verdurão! 🌿<br/>O que você gostaria de comprar hoje?");
            addBotQuickReplies(["Camisetas", "Calças", "Acessórios", "Shorts e Bermudas"]);
        }
    }, [open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function addBot(text) {
        setMessages((prev) => [...prev, { from: "bot", text }]);
    }
    function addUser(text) {
        setMessages((prev) => [...prev, { from: "user", text }]);
    }
    function addBotQuickReplies(options) {
        setMessages((prev) => [...prev, { from: "bot", quick_replies: options }]);
    }

    async function handleSend(text) {
        if (!text.trim()) return;
        addUser(text);
        setInput("");
        addBot("..."); // efeito de digitação

        if (USE_SIMULATION) {
            setTimeout(() => simulateResponse(text), 800);
        } else {
            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text }),
                });
                const data = await res.json();
                setMessages((prev) => prev.filter((m) => m.text !== "..."));
                if (data.reply) addBot(data.reply);
                if (data.quick_replies) addBotQuickReplies(data.quick_replies);
            } catch {
                addBot("Desculpe, houve um problema ao se conectar com o servidor 😔");
            }
        }
    }

    function simulateResponse(text) {
        setMessages((prev) => prev.filter((m) => m.text !== "..."));
        const t = text.toLowerCase();

        if (t.includes("camiseta")) {
            addBot("Perfeito! Alguma preferência de cor?");
            addBotQuickReplies(["Branca", "Preta", "Azul", "Vermelha"]);
            return;
        }

        if (t.includes("branca")) {
            addBot("Perfeito! Clique abaixo para ver as camisetas brancas!");
            addBotQuickReplies(["Ver camisetas"]);
            return;
        }

        if (t.includes("calça")) {
            addBot("Temos calças jeans e de moletom 😎");
            return;
        }

        addBot("Entendi! Que tipo de produto você procura?");
        addBotQuickReplies(["Camisetas", "Calças", "Acessórios"]);
    }

    return (
        <>
            <button id="chat-toggle" onClick={() => setOpen(!open)}>
                💬
            </button>

            {open && (
                <div id="chat-widget" role="dialog" aria-label="Chatbot Vista Verdurão">
                    <header className="chat-header">
                        <div className="brand">
                            <div className="avatar">A</div>
                            <div className="title">
                                <strong>Alê</strong>
                                <small>Assistente de Looks</small>
                            </div>
                        </div>
                        <button id="chat-close" onClick={() => setOpen(false)}>
                            ✕
                        </button>
                    </header>

                    <main className="chat-body">
                        {messages.map((msg, i) => (
                            <div key={i}>
                                {msg.text && (
                                    <div
                                        className={`msg ${msg.from}`}
                                        dangerouslySetInnerHTML={{ __html: msg.text }}
                                    ></div>
                                )}
                                {msg.quick_replies && (
                                    <div className="quick-replies">
                                        {msg.quick_replies.map((q) => (
                                            <button key={q} className="quick-btn" onClick={() => handleSend(q)}>
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef}></div>
                    </main>

                    <footer className="chat-footer">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend(input);
                            }}
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escreva uma mensagem..."
                            />
                            <button type="submit">Enviar</button>
                        </form>
                    </footer>
                </div>
            )}
        </>
    );
}
