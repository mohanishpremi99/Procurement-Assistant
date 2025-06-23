import streamlit as st
import requests
import json
import uuid
import time

st.set_page_config(
    page_title="Procurement Assistant Streaming",
    page_icon="🛒",
    layout="centered"
)

API_BASE_URL = "http://localhost:8000"
AGENT_NAME = "coordinator"

if "user_id" not in st.session_state:
    st.session_state.user_id = f"user-{uuid.uuid4()}"
if "session_id" not in st.session_state:
    st.session_state.session_id = None
if "messages" not in st.session_state:
    st.session_state.messages = []

def create_session():
    session_id = f"session-{int(time.time())}"
    response = requests.post(
        f"{API_BASE_URL}/apps/{AGENT_NAME}/users/{st.session_state.user_id}/sessions/{session_id}",
        headers={"Content-Type": "application/json"},
        data=json.dumps({})
    )
    if response.status_code == 200:
        st.session_state.session_id = session_id
        st.session_state.messages = []
        welcome = "👋 Hello! I'm your Procurement Assistant. What do you need today?"
        st.session_state.messages.append({"role": "assistant", "content": welcome})
        return True
    else:
        st.error(f"Failed to create session: {response.text}")
        return False

def stream_sse_message(message):
    st.session_state.messages.append({"role": "user", "content": message})
    url = f"{API_BASE_URL}/run_sse"
    payload = {
        "appName": AGENT_NAME,
        "userId": st.session_state.user_id,
        "sessionId": st.session_state.session_id,
        "newMessage": {
            "role": "user",
            "parts": [{"text": message}]
        },
        "streaming": True
    }
    with requests.post(url, headers={"Content-Type": "application/json"}, data=json.dumps(payload), stream=True) as r:
        if r.status_code != 200:
            st.error(f"Stream error: {r.text}")
            return
        buffer = ""
        seen_parts = set()
        with st.chat_message("assistant") as chat_box:
            message_placeholder = st.container()
            for line in r.iter_lines():
                if line:
                    decoded = line.decode("utf-8").strip()
                    if decoded.startswith("data:"):
                        try:
                            json_str = decoded[5:].strip()
                            data_json = json.loads(json_str)
                            parts = data_json.get("content", {}).get("parts", [])
                            for part in parts:
                                text = part.get("text", "")
                                if text and text not in seen_parts:
                                    seen_parts.add(text)
                                    buffer += text
                                    message_placeholder.markdown(buffer)
                        except json.JSONDecodeError as e:
                            print(f"JSON decode error on chunk: {decoded}, error: {e}")
                            continue
            st.session_state.messages.append({"role": "assistant", "content": buffer})

st.title("🛒 Procurement Assistant (deduplicated stream)")

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

st.subheader("How can I help with your procurement needs today?")

for msg in st.session_state.messages:
    if msg["role"] == "user":
        st.chat_message("user").write(msg["content"])
    else:
        st.chat_message("assistant").write(msg["content"])

if st.session_state.session_id:
    user_input = st.chat_input("Type your message...")
    if user_input:
        stream_sse_message(user_input)
        st.rerun()
else:
    st.info("👈 Create a session to start chatting")
