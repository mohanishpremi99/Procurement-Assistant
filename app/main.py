import os
import uvicorn
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app
 
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
AGENT_DIR = os.path.join(BASE_DIR)  # Added /agents to the path
# Set up DB path for sessions
SESSION_DB_URL = f"sqlite:///{os.path.join(BASE_DIR, 'sessions.db')}"
# Create the FastAPI app using ADK's helper
app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    session_service_uri=SESSION_DB_URL,  # Change session_db_url to session_service_uri
    allow_origins=["*"],  # In production, restrict this
    web=True,  # Enable the ADK Web UI
)
# Add custom endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
@app.get("/agent-info")
async def agent_info():
    """Provide agent information"""
    from multi_tool_agent import root_agent
    return {
        "agent_name": root_agent.name,
        "description": root_agent.description,
        "model": root_agent.model,
        "tools": [t.__name__ for t in root_agent.tools]
    }
if __name__ == "__main__":
    print("Starting FastAPI server...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=9999,
        reload=False
    )