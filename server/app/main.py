from fastapi import FastAPI, Depends
from app.routes.stream import router as stream_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.projects import router as projects_router

from app.routes.stream import verify_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stream_router)
app.include_router(projects_router, dependencies=[Depends(verify_token)])

@app.get("/")
async def home():
    return {"message": "AI Website Builder Backend Running"}