from fastapi import FastAPI

app = FastAPI(title="Boom-Blog", version="1.0.0")

@app.get("/")
def root():
    return {"msg": "Welcome to CMS API"}
