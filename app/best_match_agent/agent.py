from google.adk.agents import Agent
from typing import Dict, List, Any, Optional
import pandas as pd
# class LaptopSearchTool(BaseTool):
#     """Tool for searching through laptop specifications database."""
    
#     def __init__(self, specs_file_path: str = None):
#         """Initialize the tool with the path to the CSV file."""
#         if specs_file_path is None:
#             # Default path if not specified
#             current_dir = os.path.dirname(__file__)
#             specs_file_path = os.path.join(os.path.dirname(current_dir), 'data', 'laptop_specs_dataset_500.csv')
            
#         # Check if file exists, if not create a sample dataframe
#         if os.path.exists(specs_file_path):
#             self.specs_df = pd.read_csv(specs_file_path)
#         else:
#             print(f"Warning: Laptop specs file not found at {specs_file_path}. Creating dummy data.")
#             self.specs_df = self._create_dummy_data()
    
#     def _create_dummy_data(self) -> pd.DataFrame:
#         """Create dummy data for testing when the CSV file doesn't exist."""
#         data = {
#             'Brand': ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus'],
#             'Model Name / Number': ['XPS 13', 'Spectre x360', 'ThinkPad X1', 'MacBook Pro', 'ZenBook Pro'],
#             'Type of Laptop': ['Ultrabook', 'Convertible', 'Business', 'Professional', 'Gaming'],
#             'CPU': ['Intel i7-1165G7', 'Intel i7-1185G7', 'Intel i5-1135G7', 'Apple M1', 'AMD Ryzen 9'],
#             'RAM': ['16GB', '32GB', '8GB', '16GB', '32GB'],
#             'Storage': ['512GB SSD', '1TB SSD', '256GB SSD', '512GB SSD', '1TB SSD'],
#             'Screen Size (inches)': [13.3, 15.6, 14.0, 16.0, 15.6],
#             'Screen Type': ['IPS', 'OLED', 'IPS', 'Retina', 'OLED'],
#             'GPU': ['Intel Iris Xe', 'Intel Iris Xe', 'Integrated', 'Integrated', 'NVIDIA RTX 3070'],
#             'Operating System': ['Windows', 'Windows', 'Windows', 'macOS', 'Windows'],
#             'OS Version': ['11', '10', '10', 'Monterey', '11'],
#             'Weight (kg)': [1.2, 1.7, 1.4, 2.0, 2.2],
#             'Price (INR)': [120000, 140000, 95000, 180000, 150000],
#             'Rating': [4.5, 4.3, 4.8, 4.7, 4.6],
#             'Persona Role': ['Developer', 'Designer', 'Business', 'Creative Pro', 'Gamer']
#         }
#         return pd.DataFrame(data)

def search_laptops( cpu: Optional[str] = None,
                    ram: Optional[str] = None,
                    storage: Optional[str] = None,
                    screen_size: Optional[float] = None,
                    price_max: Optional[float] = None,
                    price_min: Optional[float] = None,
                    gpu: Optional[str] = None,
                    persona: Optional[str] = None,
                    brand: Optional[str] = None) -> List[Dict]:
    """
    Search laptops based on provided specifications.
    
    Args:
        cpu: CPU type or model (e.g., "Intel i7", "AMD Ryzen")
        ram: RAM size (e.g., "16GB")
        storage: Storage capacity (e.g., "512GB SSD")
        screen_size: Minimum screen size in inches
        price_max: Maximum price in rupees
        price_min: Minimum price in rupees
        gpu: GPU type or model
        persona: Target user (e.g., "Developer", "Gamer")
        brand: Laptop brand (e.g., "Dell", "HP")
        
    Returns:
        List of matching laptops as dictionaries
    """
    filtered_df = pd.read_csv('data/laptop_specs_dataset_500.csv')
    
    # Apply filters based on provided parameters
    if cpu:
        filtered_df = filtered_df[filtered_df['CPU'].str.contains(cpu, case=False, na=False)]
    
    if ram:
        filtered_df = filtered_df[filtered_df['RAM'].str.contains(ram, case=False, na=False)]
        
    if storage:
        filtered_df = filtered_df[filtered_df['Storage'].str.contains(storage, case=False, na=False)]
        
    if screen_size:
        filtered_df = filtered_df[filtered_df['Screen Size (inches)'] >= screen_size]
        
    if price_max:
        filtered_df = filtered_df[filtered_df['Price (INR)'] <= price_max]
        
    if price_min:
        filtered_df = filtered_df[filtered_df['Price (INR)'] >= price_min]
        
    if brand:
        filtered_df = filtered_df[filtered_df['Brand'].str.contains(brand, case=False, na=False)]
        
    if gpu:
        # Check if user wants dedicated GPU
        if gpu.lower() == 'dedicated':
            filtered_df = filtered_df[~filtered_df['GPU'].str.contains('Integrated', case=False, na=False)]
        elif gpu.lower() == 'integrated':
            filtered_df = filtered_df[filtered_df['GPU'].str.contains('Integrated', case=False, na=False)]
        else:
            filtered_df = filtered_df[filtered_df['GPU'].str.contains(gpu, case=False, na=False)]
    
    if persona:
        filtered_df = filtered_df[filtered_df['Persona Role'].str.contains(persona, case=False, na=False)]
    
    # Sort by rating in descending order
    filtered_df = filtered_df.sort_values(by='Rating', ascending=False)
    
    # Convert to list of dictionaries for the top 10 results
    results = filtered_df.head(10).to_dict('records')
    
    return results

root_agent = Agent(
    name="laptop_best_match_agent",
    model="gemini-2.0-flash",
    description=(
                "This agent helps find the best matching laptops based on user requirements "
                "such as CPU, RAM, storage, screen size, budget, and intended use."
    ),
    instruction=(
    """
    You are a laptop recommendation expert.
    Your goal is to help users find the perfect laptop for their needs by asking relevant questions
    and using the LaptopSearchTool to find suitable options. If user doesnt provide certain specifications you can find the best among the options.
    You should consider all specifications provided and try to suggest a ranked list of laptops
    that best match the user's criteria.
    Always provide key specifications in your recommendations.
    Always try to use the LaptopSearchTool and don't try to generate any random laptop specification.
    """
    ),
    output_key="best_laptop",
    tools=[search_laptops],
)