from fastapi import FastAPI
from app.api.api import api_router  # full absolute import

app = FastAPI(title="Boom-Blog", version="1.0.0")

app.include_router(api_router)

@app.get("/")
def root():
    return {"msg": "Welcome to CMS API"}
