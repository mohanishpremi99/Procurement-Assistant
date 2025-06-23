from typing import Dict, List, Any
import pandas as pd

def filter_laptops_by_criteria(df: pd.DataFrame, criteria: Dict[str, Any]) -> pd.DataFrame:
    """Filter laptop DataFrame based on provided criteria."""
    filtered_df = df.copy()
    
    for column, value in criteria.items():
        if column == 'price_max':
            filtered_df = filtered_df[filtered_df['Price (INR)'] <= value]
        elif column == 'price_min':
            filtered_df = filtered_df[filtered_df['Price (INR)'] >= value]
        elif column in ['RAM', 'Storage', 'CPU', 'GPU', 'Screen Size (inches)']:
            if isinstance(value, str):
                filtered_df = filtered_df[filtered_df[column].str.contains(value, case=False)]
            else:
                filtered_df = filtered_df[filtered_df[column] == value]
    
    return filtered_df

def format_laptop_details(laptop: Dict[str, Any]) -> str:
    """Format laptop details for display."""
    details = f"Model: {laptop['Brand']} {laptop['Model Name / Number']}\n"
    details += f"Type: {laptop['Type of Laptop']}\n"
    details += f"Display: {laptop['Screen Size (inches)']}\" {laptop['Screen Type']}\n"
    details += f"CPU: {laptop['CPU']}\n"
    details += f"RAM: {laptop['RAM']}\n"
    details += f"Storage: {laptop['Storage']}\n"
    details += f"GPU: {laptop['GPU']}\n"
    details += f"OS: {laptop['Operating System']} {laptop['OS Version']}\n"
    details += f"Weight: {laptop['Weight (kg)']} kg\n"
    details += f"Price: ₹{laptop['Price (INR)']:,}\n"
    details += f"Rating: {laptop['Rating']}/5.0"
    
    return details

def rank_laptops(laptops: List[Dict[str, Any]], preferences: Dict[str, float]) -> List[Dict[str, Any]]:
    """Rank laptops based on user preferences."""
    # Implement your ranking algorithm here
    # This is a simple ranking based on weighted criteria
    ranked_laptops = []
    
    for laptop in laptops:
        score = 0
        
        # Calculate score based on preferences
        if 'performance' in preferences:
            cpu_score = 0
            if 'Intel i7' in laptop['CPU'] or 'Ryzen 7' in laptop['CPU']:
                cpu_score = 5
            elif 'Intel i5' in laptop['CPU'] or 'Ryzen 5' in laptop['CPU']:
                cpu_score = 3
            else:
                cpu_score = 1
            
            score += cpu_score * preferences['performance']
        
        if 'budget' in preferences:
            # Higher score for lower price (inverse relationship)
            price_score = 5 - min(5, laptop['Price (INR)'] / 30000)
            score += price_score * preferences['budget']
        
        if 'rating' in preferences:
            rating_score = laptop['Rating']
            score += rating_score * preferences['rating']
        
        ranked_laptops.append({
            'laptop': laptop,
            'score': score
        })
    
    # Sort by score in descending order
    ranked_laptops.sort(key=lambda x: x['score'], reverse=True)
    
    # Return just the laptops, not the scores
    return [item['laptop'] for item in ranked_laptops]