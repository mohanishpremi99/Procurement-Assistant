from google.adk.agents import Agent

deal_summary_agent = Agent(
    name="deal_summary_agent_first",
    model="gemini-2.0-flash",
    description="Creates a summary of the negotiation results",
    instruction="""
    Provide the dealer details including dealer name, email and any other avaible info.
    Based on the negotiation that occurred between the buyer and seller, create a comprehensive summary of the negotiation outcomes.
    Negotiation messages: {buyer_first}, {starter_first} along with the starting terms.
    If the deal failed, mentioned for what specification they couldnt come to an agreement.
    If the deal is accepted:
    Extract and clearly state:
    1. Initial price vs. final agreed price
    2. Initial quantity vs. final quantity
    3. Initial delivery timeline vs. final timeline
    4. Initial payment terms vs. final payment terms
    5. Any additional concessions or terms agreed upon
    6. Total savings achieved (in percentage and amount)
    7. Deal status: ACCEPTED or FAILED
    Provide the dealer details including dealer name, email and any other avaible info. Inside the table itself.

    Format this information in a tabular markdown format that can be used to generate a report.
    """,
    output_key="deal_summary_first"
)