from google.adk.agents import Agent
from typing import Dict, List, Any, Optional
import pandas as pd


def search_vendors(laptop_model: str,
                  max_price: Optional[float] = None,
                  min_rating: Optional[float] = None,
                  max_delivery_time: Optional[int] = None,
                  min_specs_matching: Optional[float] = None,
                  min_quantity: Optional[int] = None,
                  vendor_role: Optional[str] = None,
                  min_reliability: Optional[float] = None,
                  min_past_orders: Optional[int] = None) -> List[Dict]:
    """
    Search vendors based on laptop model and filtering criteria.
    
    Args:
        laptop_model: The laptop model name the user has selected
        max_price: Maximum quoted price in rupees
        min_rating: Minimum vendor rating (1-5)
        max_delivery_time: Maximum acceptable delivery time in days
        min_specs_matching: Minimum specs matching score (0-1)
        min_quantity: Minimum available quantity
        vendor_role: Type of vendor (Distributor, Authorized Retailer, OEM)
        min_reliability: Minimum vendor reliability score (0-1)
        min_past_orders: Minimum number of past orders with the vendor
        
    Returns:
        List of matching vendors as dictionaries
    """
    # Load the vendor dataset
    filtered_df = pd.read_csv('data/synthetic_vendor_dataset_expanded_by_model_name.csv')
    
    # Apply laptop model filter (basic requirement)
    filtered_df = filtered_df[filtered_df['Laptop Model Name'].str.contains(laptop_model, case=False, na=False)]
    
    # Apply additional filters based on provided parameters
    if max_price:
        filtered_df = filtered_df[filtered_df['Quoted Price (INR)'] <= max_price]
        
    if min_rating:
        filtered_df = filtered_df[filtered_df['Vendor Rating'] >= min_rating]
        
    if max_delivery_time:
        filtered_df = filtered_df[filtered_df['Delivery Time (Days)'] <= max_delivery_time]
        
    if min_specs_matching:
        filtered_df = filtered_df[filtered_df['Specs Matching Score'] >= min_specs_matching]
        
    if min_quantity:
        filtered_df = filtered_df[filtered_df['Available Quantity'] >= min_quantity]
        
    if vendor_role:
        filtered_df = filtered_df[filtered_df['Persona Role'].str.contains(vendor_role, case=False, na=False)]
        
    if min_reliability:
        filtered_df = filtered_df[filtered_df['Reliability Score'] >= min_reliability]
        
    if min_past_orders:
        filtered_df = filtered_df[filtered_df['Past Orders Count'] >= min_past_orders]
    
    # Sort by a combination of important factors: price, rating, and delivery time
    # Lower price, higher rating, and lower delivery time are better
    filtered_df = filtered_df.sort_values(by=['Quoted Price (INR)', 'Vendor Rating', 'Delivery Time (Days)'],
                                         ascending=[True, False, True])
    
    # Convert to list of dictionaries for the top results
    results = filtered_df.head(10).to_dict('records')
    
    return results

root_agent = Agent(
    name="vendor_selection_agent",
    model="gemini-2.0-flash",
    description=(
                "This agent helps find the best vendors for a selected laptop model based on "
                "factors like price, vendor rating, delivery time, and reliability."
    ),
    instruction=(
        """
        You are a procurement assistant specializing in vendor selection.
        If a laptop model is provided in the input, find the best vendors for the model.
        Your goal is to help users find the best vendors for their chosen laptop model
        by considering factors like price, vendor reliability, delivery time, and other preferences.
        Ask relevant questions to understand their priorities (price, quantity, delivery speed, vendor reliability, etc.)
        and always use the search_vendors tool to find suitable options.
        Always provide a ranked list of vendor options with key information like price, rating, delivery time,
        and reliability score. Maks sure to provide the vendor email id.

        Highlight trade-offs between different vendor options to help the user make an informed decision.
        """

    ),
    tools=[search_vendors],
    output_key="vendors",
)
