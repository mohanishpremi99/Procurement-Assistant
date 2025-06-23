# Procurement Assistant

A powerful AI-powered procurement solution that helps businesses find, compare, and negotiate laptop purchases from multiple vendors using Google ADK (Agent Development Kit).

---

## 🌟 Features

- **Smart Laptop Matching**: Find laptops that match your specific requirements.
- **Vendor Selection**: Compare vendors based on prices, ratings, and reliability.
- **Multi-Vendor Negotiation**: Negotiate simultaneously with multiple vendors.
- **Streaming Responses**: Real-time conversation with deduplicated streaming responses.
- **Deal Summaries**: Get comprehensive summaries of negotiation outcomes.
- **Professional Negotiation**: Leverages procurement best practices for optimal deals.

---

## 📋 Architecture

The system follows a modular architecture with specialized agents:

```
Coordinator Agent
├── Best Match Agent
│   └── Finds laptops matching requirements
├── Vendor Selection Agent
│   └── Identifies suitable vendors
└── Multi-Seller Negotiator
    ├── Data Preparation Agent
    │   └── Prepares vendor data for negotiation
    ├── Parallel Executor
    │   ├── Negotiator First
    │   │   ├── Negotiation Starter
    │   │   ├── Negotiation Loop (max 5 iterations)
    │   │   │   ├── Buyer Agent
    │   │   │   └── Seller Agent
    │   │   └── Deal Summary Agent
    │   └── Negotiator Second
    │       ├── Negotiation Starter
    │       ├── Negotiation Loop (max 5 iterations)
    │       │   ├── Buyer Agent
    │       │   └── Seller Agent
    │       └── Deal Summary Agent
    └── Final Summary Agent
        └── Combines results from both negotiations
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Google ADK installed
- FastAPI
- Streamlit

### Installation

```bash
git clone https://github.com/yourusername/procurement-assistant.git
cd procurement-assistant
pip install -r requirements.txt
```

### Set Up the Environment

Ensure you have Google ADK installed and configured.  
Configure any required environment variables as needed by your deployment.

---

## 🏃‍♂️ Running the Application

You can run the application using `main.py`:

```bash
python main.py
```

> **Note:**  
> The user must select two vendors to initiate negotiations.

### Start Supporting Services

- **ADK Server**: Ensure your ADK server is running (default: port 8000)
- **CORS Proxy**: Start proxy server for cross-origin requests (default: port 8080)
- **Frontend**: Optionally, run the Streamlit frontend for interactive UI.

---

## 📱 User Interface

The application provides two interfaces:


## 💾 Data

Synthetic vendor datasets simulate real-world procurement scenarios:

- `synthetic_vendor_dataset_expanded.csv`: Complete vendor dataset
- `synthetic_vendor_dataset_expanded_by_model_name.csv`: Organized by laptop model
- `synthetic_vendor_dataset_multi_laptops.csv`: Multiple laptop offerings per vendor

---

## 🔄 Negotiation Process

1. **User Input**: User provides requirements or selects vendors (must select two).
2. **Laptop Matching**: Find laptops matching requirements.
3. **Vendor Selection**: Identify vendors who can supply those laptops.
4. **Data Preparation**: Extract and format vendor information to pass it as initial context to sellers.
5. **Parallel Negotiation**: Two vendor negotiations run simultaneously:
    - Initial offer from seller
    - Counter-offer from buyer
    - Negotiation loop (up to 5 rounds)
    - Deal summary generation
6. **Final Summary**: Compare negotiation outcomes.
7. **User Decision**: User selects preferred offer.

---

## 🧠 Agent Roles

- **Buyer Agent**: Represents the user, negotiates for lower prices and better terms.
- **Seller Agent**: Represents vendors, starts with high margins, makes strategic concessions.
- **Negotiation Starter**: Initiates conversations with opening terms.
- **Deal Summary Agent**: Creates structured reports of negotiation outcomes.
- **Final Summary Agent**: Combines results into a consolidated report.

---

## 📊 Evaluation Metrics

- Deal success rate
- Average price reduction achieved
- Time to negotiation completion
- User satisfaction with recommendations

---

## 🛠️ Troubleshooting

- **CORS Issues**: Ensure the proxy server is running on port 8080.
- **Connection Errors**: Verify ADK server is running on port 8000.
- **Missing Responses**: Check the console for API errors.
- **Streaming Issues**: Ensure your browser supports Server-Sent Events (SSE).

---

## 🔜 Future Enhancements

- Integration with real vendor APIs
- Enhanced analytics dashboard
- Multi-category procurement support
- Automated re-negotiation scheduling
- Export of deal reports to PDF/Excel


---

## 👥 Contributors

- [Your Name] - Initial work and development

---

## 🙏 Acknowledgments

- Google ADK team for the agent development framework
- FastAPI for the robust API support
