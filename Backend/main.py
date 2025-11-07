from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from routes.user_routes import user_router
from routes.problem_routes import problem_router


app = FastAPI(title="SystemDesign-io API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(problem_router)



@app.get("/")
async def root():
    return {"message": "Welcome to the CodeMentor API"}