from fastapi import FastAPI
from app.routes.generate import router as generate_router
from app.routes.stream import router as stream_router

app = FastAPI()

app.include_router(generate_router)
app.include_router(stream_router)

@app.get("/")
async def home():
    return {"message": "AI Website Builder Backend Running"}