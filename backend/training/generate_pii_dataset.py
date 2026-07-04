import json
import random
import os
import re

# Create training folder if not exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Comprehensive Multi-Class PII Data Pools
FIRST_NAMES = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Reyansh", "Muhammad", "Rohan", "John", "Emma", "Sophia", "Michael", "Ananya", "Diya", "Sana", "Isha", "Priya", "Rahul", "Vikram", "Sneha", "Kavya", "Amit", "Rajesh", "Pooja", "Sunita", "David", "Sarah", "Chen", "Wei", "Hiroshi"]
LAST_NAMES = ["Sharma", "Patel", "Kumar", "Singh", "Gupta", "Verma", "Rao", "Das", "Nair", "Iyer", "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark"]
CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "New York", "London", "San Francisco", "Tokyo", "Singapore", "Sydney", "Toronto", "Berlin", "Paris", "Dubai"]
ORGS = ["Infosys", "TCS", "Wipro", "Reliance", "Tata Motors", "HDFC Bank", "ICICI Bank", "State Bank of India", "Google", "Microsoft", "Amazon", "Apple", "Meta", "IBM", "Intel", "Accenture", "Cognizant", "Capgemini", "Mahindra", "Airtel"]
MONEY_AMOUNTS = ["$5,000", "Rs. 45,000", "€1,200", "INR 10 lakh", "$150,000", "Rs. 2.5 crore", "£350", "85,000 USD", "$12,450.00", "Rs. 500"]
ORDER_IDS = ["#ORD-9876", "INV-2023-001", "TXN-889922", "BILL-5544", "REF-102938", "PO-900112", "ORD-554433", "INV-8899"]
DATES = ["14/10/2023", "October 14th", "2024-05-12", "15th August 2023", "01-01-2025", "25/12/2024", "March 3rd, 2023"]
GOV_IDS = ["5485-6985-1245", "ABCDE1234F", "987-65-4321", "A1234567", "6789-1234-5678", "XYZW9876A"]
EMAILS = ["rajesh.sharma@tcs.com", "s.jenkins@apple.com", "support@google.com", "admin@hdfc.com", "info@wipro.in", "contact@infosys.com"]
PHONES = ["+91-9876543210", "+1-415-555-0199", "022-26543210", "+44-20-7946-0921", "9876543210", "+91-9988776655"]

TEMPLATES = [
    "My name is {name} and I live in {city}. Please bill {money} to invoice {order}.",
    "{name} works at {org} as a senior software engineer. Contact: {email} | Phone: {phone}.",
    "Please send the confidential documents to {name} at our {city} branch by {date}.",
    "Mr. {name} met with the CEO of {org} in {city} regarding transaction {order} worth {money}.",
    "The transaction {order} for {money} was authorized by {name} from {org} on {date}.",
    "Patient {name} (Aadhaar/ID: {govid}) visited the hospital in {city} on {date}. Total bill price: {money}.",
    "Contact {name} regarding the contract with {org}. Invoice number {order} must be settled via {email}.",
    "Employee record: {name}, Department: IT, Location: {city}, PAN/ID: {govid}, Salary: {money}.",
    "We are pleased to offer {name} a full-time position at {org} starting {date}. Contact number: {phone}.",
    "{name} can be reached at our office in {city} or via email at {email} regarding order {order}."
]

def generate_sample():
    template = random.choice(TEMPLATES)
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    name = f"{first} {last}"
    city = random.choice(CITIES)
    org = random.choice(ORGS)
    money = random.choice(MONEY_AMOUNTS)
    order = random.choice(ORDER_IDS)
    date = random.choice(DATES)
    govid = random.choice(GOV_IDS)
    email = random.choice(EMAILS)
    phone = random.choice(PHONES)

    text = template.format(
        name=name, city=city, org=org, money=money, 
        order=order, date=date, govid=govid, email=email, phone=phone
    )
    
    # Track entity mappings
    entities_map = [
        (name, "PER"),
        (city, "LOC"),
        (org, "ORG"),
        (money, "MONEY"),
        (order, "ORDER"),
        (date, "DATE"),
        (govid, "GOV_ID"),
        (email, "EMAIL"),
        (phone, "PHONE")
    ]
    
    # Sort entities by length descending to match longest first
    entities_map.sort(key=lambda x: len(x[0]), reverse=True)
    
    # Generate token-level tags (CoNLL format for BERT/RoBERTa)
    words = text.split()
    tokens = []
    ner_tags = []
    
    for word in words:
        clean_word = word.strip(".,!?;:\"'()[]{}|")
        tokens.append(word)
        matched_tag = "O"
        for ent_val, ent_type in entities_map:
            ent_words = ent_val.split()
            if clean_word in ent_words:
                if clean_word == ent_words[0]:
                    matched_tag = f"B-{ent_type}"
                else:
                    matched_tag = f"I-{ent_type}"
                break
        ner_tags.append(matched_tag)

    # Generate character span offsets for spaCy
    spacy_ents = []
    for ent_val, ent_type in entities_map:
        for match in re.finditer(re.escape(ent_val), text):
            start, end = match.span()
            # Avoid duplicate or overlapping spans
            if not any(s <= start and e >= end for s, e, _ in spacy_ents):
                spacy_ents.append([start, end, ent_type])

    # Sort spaCy entities by start index
    spacy_ents.sort(key=lambda x: x[0])

    return {
        "text": text,
        "tokens": tokens,
        "ner_tags": ner_tags,
        "spacy_entities": spacy_ents
    }

def main():
    print("Generating 1,000 multi-class PII training records (PER, LOC, ORG, MONEY, ORDER, DATE, GOV_ID, EMAIL, PHONE)...")
    dataset = [generate_sample() for _ in range(1000)]
    
    output_path = os.path.join(BASE_DIR, "pii_training_dataset.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
        
    print(f"Dataset successfully saved to: {output_path}")
    print(f"Sample Multi-Class Record:\n{json.dumps(dataset[0], indent=2)}")

if __name__ == "__main__":
    main()
