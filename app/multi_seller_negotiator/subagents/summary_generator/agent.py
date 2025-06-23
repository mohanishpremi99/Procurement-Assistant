from google.adk.agents import Agent

final_summary_agent = Agent(
    name="deal_summary_agent",
    model="gemini-2.0-flash",
    description="Creates a summary of the negotiation results",
    instruction="""
    You are provided two different deal summaries through {deal_summary_first} and {deal_summary_second}.
    Your task is to create a consolidated deal summary, report to the user. 
    Format this information in a tabular markdown format that can be used to generate a report.
    """,
    output_key="final_deal_summary"
)