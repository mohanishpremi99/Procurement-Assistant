from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn
import argparse

# Constants
API_BASE_URL = "http://localhost:8000"  # ADK api_server base URL

# FastAPI app
app = FastAPI(
    title="ADK CORS Proxy",
    description="A CORS-enabled proxy to communicate with ADK api_server",
    version="1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with ["http://localhost:8501"] for Streamlit or specific domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# Proxy: create session
@app.post("/apps/{agent_name}/users/{user_id}/sessions/{session_id}")
async def proxy_create_session(agent_name: str, user_id: str, session_id: str, request: Request):
    payload = await request.json()
    url = f"{API_BASE_URL}/apps/{agent_name}/users/{user_id}/sessions/{session_id}"
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload)
    return resp.json()

# Proxy: run agent
@app.post("/run")
async def proxy_run(request: Request):
    payload = await request.json()
    url = f"{API_BASE_URL}/run"
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload)
    return resp.json()

# Health check
@app.get("/healthz")
async def health_check():
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{API_BASE_URL}/openapi.json")
        if resp.status_code == 200:
            return {"status": "ok", "adk_server": "healthy"}
        else:
            return {"status": "degraded", "adk_server_status": resp.status_code}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# CLI entry point
def main():
    parser = argparse.ArgumentParser(description="Start ADK CORS Proxy")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind (default 0.0.0.0)")
    parser.add_argument("--port", type=int, default=9000, help="Port to bind (default 9000)")
    args = parser.parse_args()

    uvicorn.run("app.adk_cors_proxy:app", host=args.host, port=args.port, reload=True)

if __name__ == "__main__":
    main()
