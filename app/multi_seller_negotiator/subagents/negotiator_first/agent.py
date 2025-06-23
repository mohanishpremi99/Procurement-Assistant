from google.adk.agents import Agent, LoopAgent, SequentialAgent
from .sub_agents.buyer_agent import buyer_agent
from .sub_agents.seller_agent import seller_agent
from .sub_agents.negotiation_starter import negotiation_starter
from .sub_agents.deal_summary import deal_summary_agent


# Negotiation starter agent
negotiation_loop = LoopAgent(
    name="negotiation_loop_first",
    max_iterations=5,
    sub_agents=[buyer_agent, seller_agent],
    description="Two agents negotiate until deal is reached or max iterations."
)



# Root agent with sequential flow
negotiator_first = SequentialAgent(
    name="negotiater_first",
    sub_agents=[
        negotiation_starter,
        negotiation_loop,
        deal_summary_agent
    ],
    description="Starts negotiation and runs negotiation loop based on the following terms that the negotiation cordinater provides you and provides the user a report as soon as the negotiation completes. Ask for the number of units required and ask for the delivery date requirement or any other specific requirements."
)