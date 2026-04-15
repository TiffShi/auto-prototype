from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React to fetch data from this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For testing purposes only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Sandbox Backend is Alive!"}

@app.get("/api/test")
def test_endpoint():
    return {"status": "Success", "data": "Hello from the Sandbox API!"}