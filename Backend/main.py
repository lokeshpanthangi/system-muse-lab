from fastapi import FastAPI
from Agents.chatbot import chatbot_router



app = FastAPI()
app.include_router(chatbot_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}


