import React from "react";
import ChatWidget from "./components/ChatWidget";
import "./index.css";

function App() {
  return (
    <div>
      <h2 style={{ padding: "16px", fontFamily: "Inter, sans-serif" }}>
        Chatbot Vista Verdurão 🌿
      </h2>
      <ChatWidget />
    </div>
  );
}

export default App;
