from .subagents.negotiator_first import negotiator_first
from .subagents.negotiator_second import negotiator_second
from .subagents.summary_generator import final_summary_agent
from google.adk.agents import ParallelAgent, SequentialAgent, LlmAgent

parallel_agent = ParallelAgent(
    name="parallel_executor",
    sub_agents=[negotiator_first, negotiator_second],
    description="You make sure taht these two negotiations run parallely.",
)

data_preparation_agent = LlmAgent(
    name="data_preparation_agent",
    description="You have the data here: {cordinater}  and find the user selected vendors from users input and vendor details present in {vendors}. And create a clean output with the vendor details including email id, name, price and all other details under vendor one and vendor two names for the vendors that user selected.",
    output_key="prepared_data",
)
root_agent= SequentialAgent(
    name="negotiation_cordinator",
    sub_agents=[data_preparation_agent, parallel_agent,final_summary_agent],
    description="You make sure data preparation, parallel negotiation and final summary generation are performed succesfully in sequential order",
)






