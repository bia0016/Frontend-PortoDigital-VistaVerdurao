from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
import os

# Configura cliente para HuggingFace API
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ.get("HF_TOKEN", ""),  # define HF_TOKEN nas variáveis de ambiente
)

# Cria app
app = FastAPI()

# Libera CORS (importante pro frontend acessar o backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve os arquivos estáticos (frontend HTML/CSS/JS)
app.mount(
    "/",
    StaticFiles(directory="../../../html-version", html=True),
    name="static",
)

# Modelo para entrada do chat
class ChatRequest(BaseModel):
    message: str

# Endpoint do chatbot
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="moonshotai/Kimi-K2-Instruct",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um atendente da loja Vista Verdurão, que ajuda clientes a escolher roupas."
                },
                {
                    "role": "user",
                    "content": req.message
                }
            ],
        )
        bot_reply = response.choices[0].message.content
    except Exception as e:
        print("Erro no chatbot:", e)
        bot_reply = "Peço perdão, ocorreu um erro ao processar sua solicitação."
    return {"reply": bot_reply}

# Serve o index.html ao acessar a raiz
@app.get("/")
async def serve_index():
    return FileResponse("../../../../html-version/index.html")
