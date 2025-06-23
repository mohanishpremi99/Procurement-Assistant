import pandas as pd
import numpy as np
import random

# Load the dataset
df = pd.read_csv('/home/ampolusahithi/Desktop/Hackathon/Procurement-Assistant/app/agents/data/synthetic_vendor_dataset_multi_laptops.csv')

# Create a copy of the original dataframe
original_df = df.copy()

# Group by laptop model NAME to find models with fewer than 3 vendors
model_groups = df.groupby('Laptop Model Name')
models_to_duplicate = []

for model_name, group in model_groups:
    unique_vendors = group['Vendor Name'].nunique()
    if unique_vendors < 3:
        models_to_duplicate.append((model_name, 3 - unique_vendors))

# Create a list to store new rows
new_rows = []

# List of all vendor names to choose from when creating new vendors
all_vendors = df['Vendor Name'].unique().tolist()

# For each model that needs more vendors
for model_name, num_needed in models_to_duplicate:
    # Get the original row for this model
    model_rows = df[df['Laptop Model Name'] == model_name]
    original_row = model_rows.iloc[0].copy()
    
    # Get existing vendors for this model to avoid duplicates
    existing_vendors = set(model_rows['Vendor Name'].tolist())
    
    # Choose random vendors that are not already offering this model
    available_vendors = [v for v in all_vendors if v not in existing_vendors]
    
    # If we don't have enough unique vendors, we'll create new vendor names
    if len(available_vendors) < num_needed:
        extra_vendors = [f"New Vendor {i}" for i in range(num_needed - len(available_vendors))]
        available_vendors.extend(extra_vendors)
    
    # Select the needed number of vendors
    selected_vendors = random.sample(available_vendors, num_needed)
    
    # Create new rows for each selected vendor
    for vendor in selected_vendors:
        new_row = original_row.copy()
        
        # Update vendor information
        new_row['Vendor Name'] = vendor
        new_row['Vendor ID'] = f"V-{random.randint(100, 999)}"
        
        # Vary the price and other attributes slightly to make the data more realistic
        price_variation = random.uniform(0.9, 1.1)  # +/- 10%
        new_row['Quoted Price (INR)'] = int(original_row['Quoted Price (INR)'] * price_variation)
        
        new_row['Available Quantity'] = random.randint(10, 100)
        new_row['Delivery Time (Days)'] = random.randint(2, 7)
        new_row['Vendor Rating'] = round(min(5.0, max(3.5, original_row['Vendor Rating'] + random.uniform(-0.5, 0.5))), 1)
        new_row['Past Orders Count'] = random.randint(200, 500)
        new_row['Reliability Score'] = round(min(0.9, max(0.78, original_row['Reliability Score'] + random.uniform(-0.05, 0.05))), 2)
        
        # If using a new vendor name, create a matching email
        if vendor.startswith("New Vendor"):
            vendor_part = vendor.lower().replace(" ", "")
            domains = ["supplies.com", "systems.com", "vendors.com", "distributors.com", "retailers.com"]
            new_row['Vendor Email'] = f"{vendor_part}@{random.choice(domains)}"
        
        # Add to our list of new rows
        new_rows.append(new_row)

# Create a DataFrame from new rows and concatenate with original
new_df = pd.DataFrame(new_rows)
expanded_df = pd.concat([original_df, new_df], ignore_index=True)

# Save the expanded dataset
expanded_df.to_csv('/home/ampolusahithi/Desktop/Hackathon/Procurement-Assistant/app/agents/data/synthetic_vendor_dataset_expanded_by_model_name.csv', index=False)

# Print some statistics
original_models = len(model_groups)
original_vendors_per_model = original_df.groupby('Laptop Model Name')['Vendor Name'].nunique().mean()
new_vendors_per_model = expanded_df.groupby('Laptop Model Name')['Vendor Name'].nunique().mean()

print(f"Original dataset: {len(original_df)} rows, {original_models} model names")
print(f"Average vendors per model name before: {original_vendors_per_model:.2f}")
print(f"Expanded dataset: {len(expanded_df)} rows")
print(f"Average vendors per model name after: {new_vendors_per_model:.2f}")

# Verify all model names now have at least 3 vendors
models_with_insufficient_vendors = 0
for model_name, group in expanded_df.groupby('Laptop Model Name'):
    if group['Vendor Name'].nunique() < 3:
        models_with_insufficient_vendors += 1
        print(f"Model {model_name} still has only {group['Vendor Name'].nunique()} vendors")

print(f"Models with fewer than 3 vendors: {models_with_insufficient_vendors}")

# Additional statistics
unique_models = expanded_df['Laptop Model Name'].nunique()
print(f"Number of unique laptop models: {unique_models}")
print(f"Models with exactly 3 vendors: {(expanded_df.groupby('Laptop Model Name')['Vendor Name'].nunique() == 3).sum()}")
print(f"Models with more than 3 vendors: {(expanded_df.groupby('Laptop Model Name')['Vendor Name'].nunique() > 3).sum()}")