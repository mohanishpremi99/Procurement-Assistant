from google.adk.agents import Agent, LoopAgent, SequentialAgent

# Negotiation starter agent
negotiation_starter = Agent(
    name="negotiation_starter",
    model="gemini-2.0-flash",
    description="Initiates the negotiation process",
    instruction="""
    You start negotiations by setting up the context.
    Based on the input, create an opening statement for negotiation.
    Keep it simple and direct. Make an opening statment based on the quantity you have and the unit price and other facotrs like delivery time.
    """,
    output_key="starter",
)
