"""
Procurement Assistant Chat Application
======================================

This Streamlit application provides a chat interface for interacting with the 
Procurement Assistant Agent using ADK API.

Requirements:
------------
- ADK API Server running on localhost:8000
- Procurement Assistant agents registered and available in the ADK
- Streamlit and related packages installed

Usage:
------
1. Start the ADK API Server
2. Run this Streamlit app: `streamlit run app/procurement.py`
3. Click "Create Session" in the sidebar
4. Start chatting with the Procurement Assistant

Architecture:
------------
- Session Management: Creates and manages ADK sessions for stateful conversations
- Message Handling: Sends user messages to the ADK API and processes responses
"""
import streamlit as st
import requests
import json
import os
import uuid
import time

# Set page config
st.set_page_config(
    page_title="Procurement Assistant",
    page_icon="🛒",
    layout="centered"
)

# Constants
API_BASE_URL = "http://localhost:8000"
AGENT_NAME = "coordinator"  # Main agent that coordinates the procurement process

# Initialize session state variables
if "user_id" not in st.session_state:
    st.session_state.user_id = f"user-{uuid.uuid4()}"
    
if "session_id" not in st.session_state:
    st.session_state.session_id = None
    
if "messages" not in st.session_state:
    st.session_state.messages = []

def create_session():
    """
    Create a new session with the procurement assistant agent.
    
    This function:
    1. Generates a unique session ID based on timestamp
    2. Sends a POST request to the ADK API to create a session
    3. Updates the session state variables if successful
    4. Adds initial welcome message
    
    Returns:
        bool: True if session was created successfully, False otherwise
    """
    session_id = f"session-{int(time.time())}"
    response = requests.post(
        f"{API_BASE_URL}/apps/{AGENT_NAME}/users/{st.session_state.user_id}/sessions/{session_id}",
        headers={"Content-Type": "application/json"},
        data=json.dumps({})
    )
    
    if response.status_code == 200:
        st.session_state.session_id = session_id
        st.session_state.messages = []
        
        # Add welcome message to the conversation
        welcome_message = (
            "👋 Hello! I'm your Procurement Assistant. I can help with:\n\n"
            "- Finding laptops that match your requirements\n"
            "- Selecting suitable vendors\n"
            "- Negotiating prices and delivery terms\n\n"
            "What type of laptop are you searching for today?"
        )
        st.session_state.messages.append({"role": "assistant", "content": welcome_message})
        return True
    else:
        st.error(f"Failed to create session: {response.text}")
        return False

def send_message(message):
    """
    Send a message to the procurement assistant agent and process the response.
    
    Args:
        message (str): The user's message to send to the agent
        
    Returns:
        bool: True if message was sent and processed successfully, False otherwise
    """
    if not st.session_state.session_id:
        st.error("No active session. Please create a session first.")
        return False
    
    # Add user message to chat
    st.session_state.messages.append({"role": "user", "content": message})
    
    # Send message to API
    response = requests.post(
        f"{API_BASE_URL}/run",
        headers={"Content-Type": "application/json"},
        data=json.dumps({
            "app_name": AGENT_NAME,
            "user_id": st.session_state.user_id,
            "session_id": st.session_state.session_id,
            "new_message": {
                "role": "user",
                "parts": [{"text": message}]
            }
        })
    )
    
    if response.status_code != 200:
        st.error(f"Error: {response.text}")
        return False
    
    # Process the response
    events = response.json()
    
    # For debugging (optional)
    with st.expander("See API Response"):
        st.json(events)
    
    # Extract all assistant messages from the events
    for event in events:
        print(event)
        # Check if this is a model/assistant message with text content
        if event.get("content", {}).get("role") == "model" and "parts" in event.get("content", {}):
            for part in event["content"]["parts"]:
                if "text" in part and part["text"].strip():  # Only process non-empty text parts
                    # Add the message with the author (agent name) if available
                    author = event.get("author", "Assistant")
                    st.session_state.messages.append({
                        "role": "assistant", 
                        "content": part["text"],
                        "author": author
                    })
    
    return True
# UI Components
st.title("🛒 Procurement Assistant")

# Sidebar for session management
with st.sidebar:
    st.header("Session Management")
    
    if st.session_state.session_id:
        st.success(f"Active session: {st.session_state.session_id}")
        if st.button("➕ New Session"):
            st.session_state.session_id = None
            st.session_state.messages = []
            if create_session():
                st.rerun()
    else:
        st.warning("No active session")
        if st.button("➕ Create Session"):
            if create_session():
                st.rerun()
    
    st.divider()
    st.header("About")
    st.write("""
    This assistant helps you with procurement tasks:
    - Find laptops matching your requirements
    - Select vendors for your chosen laptop
    - Negotiate prices and delivery terms
    """)
    
    st.divider()
    st.caption("Make sure the ADK API Server is running on port 8000.")

# Chat interface
st.subheader("How can I help with your procurement needs today?")

# Display messages
# Display messages
for msg in st.session_state.messages:
    if msg["role"] == "user":
        st.chat_message("user").write(msg["content"])
    else:
        # Use different visuals based on agent/author if available
        author = msg.get("author", "assistant")
        with st.chat_message("assistant", avatar="🤖" if author != "assistant" else None):
            if author != "assistant" and author != "Assistant":
                st.caption(f"Agent: {author}")
            st.write(msg["content"])

# Input for new messages
if st.session_state.session_id:  # Only show input if session exists
    user_input = st.chat_input("Type your message...")
    if user_input:
        send_message(user_input)
        st.rerun()  # Rerun to update the UI with new messages
else:
    st.info("👈 Create a session to start chatting")