from google.adk.agents import Agent, LoopAgent, SequentialAgent
from .sub_agents.buyer_agent import buyer_agent
from .sub_agents.seller_agent import seller_agent
from .sub_agents.negotiation_starter import negotiation_starter
from .sub_agents.deal_summary import deal_summary_agent


# Negotiation starter agent
negotiation_loop = LoopAgent(
    name="negotiation_loop_second",
    max_iterations=5,
    sub_agents=[buyer_agent, seller_agent],
    description="Two agents negotiate until deal is reached or max iterations."
)



# Root agent with sequential flow
negotiator_second = SequentialAgent(
    name="negotiater_second",
    sub_agents=[
        negotiation_starter,
        negotiation_loop,
        deal_summary_agent
    ],
    description="Starts negotiation and runs negotiation loop based on the following terms {cordinater}. Ask for the number of units required and ask for the delivery date requirement or any other specific requirements. You are the second vendor in the {cordinater} and you pass down these details from {vendor} to the negotiation starter."
)