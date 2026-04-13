from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import convert

app = FastAPI(
    title="Temperature Converter API",
    description="A simple API for converting temperatures between Celsius, Fahrenheit, and Kelvin.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}