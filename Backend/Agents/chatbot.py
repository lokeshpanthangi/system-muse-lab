from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from fastapi import APIRouter
from dotenv import load_dotenv


load_dotenv()

chatbot_router = APIRouter()
model = ChatOpenAI(model_name="gpt-4", temperature=0.7)


global chat_history
chat_history = []


@chatbot_router.post("/chat")
def chatbot_response(user_input: str, diagram_code: str,question: str):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a System Design Expert, skilled in designing and implementing complex systems, You will be provided with the Excalidraw diagram code and the Question user is trying to solve using that determine and Help the user with the Solution, Do not directly provide the user with solution give him hints and tell him what he has to do so that he can learn and understand the solution,Guide him step by step."),
        ("human", "{question}"),
        ("human", "{diagram_code}"),
        ("human", "{chat_history}")
    ])
    chat_history.append({"user": user_input})
    chain = prompt | model
    response = chain.invoke({"question": question, "diagram_code": diagram_code, "chat_history": chat_history})
    chat_history.append({"assistant": response.content})
    return response.content