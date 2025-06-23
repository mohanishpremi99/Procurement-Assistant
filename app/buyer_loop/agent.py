from google.adk.agents import Agent, LoopAgent, ParallelAgent

# Buyer agent
buyer_agent = Agent(
    name="buyer_agent",
    model="gemini-1.5-flash",
    description="Buyer negotiation agent",
    instruction="""
You are a buyer negotiating the price of a laptop. 
✅ Your budget is $1000. 
✅ Your goal is to get the best deal without exceeding this budget.
✅ Be polite but firm. Try to reduce price using reasoning like:
- "That seems a bit high, can you offer a better price?"
- "If I order two units, can I get a discount?"
✅ If you agree to a deal, end your message with: DEAL_ACCEPTED
✅ If you want to stop negotiating, end your message with: NEGOTIATION_EXIT
Your job is to negotiate smartly and try to win the best price.
"""
)

# Seller 1 agent
seller1_agent = Agent(
    name="seller1_agent",
    model="gemini-1.5-flash",
    description="First seller agent",
    instruction="""
You are a seller offering laptops to a buyer.
✅ Your initial price is $1200.
✅ You want to maximize profit but can reduce the price down to $1050 after negotiation.
✅ Offer small discounts slowly. If the buyer pushes hard, reduce price in steps:
- $1200 -> $1150 -> $1100 -> final $1050
✅ Be professional and persuasive.
✅ If you agree to a deal, end your message with: DEAL_ACCEPTED
✅ If you want to stop negotiating, end your message with: NEGOTIATION_EXIT
"""
)

# Seller 2 agent
seller2_agent = Agent(
    name="seller2_agent",
    model="gemini-1.5-flash",
    description="Second seller agent",
    instruction="""
You are a seller offering laptops to a buyer.
✅ Your initial price is $1250.
✅ You can go as low as $1025 after negotiation.
✅ You prefer to offer bundle deals rather than price cuts. Suggest things like:
- "I'll include a free mouse if you accept $1150."
- "At $1100, I can add a 1-year warranty."
✅ Be friendly but try to close at the highest price possible.
✅ If you agree to a deal, end your message with: DEAL_ACCEPTED
✅ If you want to stop negotiating, end your message with: NEGOTIATION_EXIT
"""
)

# Negotiation loop for seller 1
negotiation_loop_1 = LoopAgent(
    name="negotiation_loop_seller1",
    max_iterations=5,
    sub_agents=[buyer_agent, seller1_agent],
    description="Negotiation loop between buyer and seller 1"
)

# Negotiation loop for seller 2
negotiation_loop_2 = LoopAgent(
    name="negotiation_loop_seller2",
    max_iterations=5,
    sub_agents=[buyer_agent, seller2_agent],
    description="Negotiation loop between buyer and seller 2"
)

# Parallel negotiation
root_agent = ParallelAgent(
    name="parallel_negotiation",
    sub_agents=[negotiation_loop_1, negotiation_loop_2],
    description="Buyer negotiates with two sellers in parallel"
)

