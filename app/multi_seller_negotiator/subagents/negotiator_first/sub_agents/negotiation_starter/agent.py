from google.adk.agents import Agent, LoopAgent, SequentialAgent

# Negotiation starter agent
negotiation_starter = Agent(
    name="negotiation_starter_first",
    model="gemini-2.0-flash",
    description="Initiates the negotiation process",
    instruction="""
    You are a single vendor and you start negotiation with the buyer by setting up the context.You are first vendor in the prepared data {prepared_data} named vendor one. Stick to your persona. Start with a welcome introducing yourself alongisde with the starting quote.
    Keep it simple and direct. Make an opening statment based on the quantity you have and the unit price and other facotrs like delivery time.
    """,
    output_key="starter_first",
)
