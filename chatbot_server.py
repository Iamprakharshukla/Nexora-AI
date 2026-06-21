import os
import re
import json
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "prisma", "dev.db")

# Intent classification training data
TRAINING_DATA = [
    ("hi", "greet"), ("hello", "greet"), ("hey", "greet"), ("namaste", "greet"), ("good morning", "greet"), ("start", "greet"), ("starr", "greet"),
    ("find me a villa in mumbai", "search_property"),
    ("show properties in gurugram", "search_property"),
    ("i want to rent a 3 bhk apartment", "search_property"),
    ("villas under 10 crore", "search_property"),
    ("buy duplex in bengaluru", "search_property"),
    ("rent flat in delhi", "search_property"),
    ("properties under 50 lakhs", "search_property"),
    ("3bhk flat in pune", "search_property"),
    ("give me luxury houses in hyderabad", "search_property"),
    ("apartments for sale in mumbai", "search_property"),
    ("properties for rent in bangalore", "search_property"),
    ("who are you", "ask_agent"), ("what can you do", "ask_agent"), ("how do you work", "ask_agent"), ("help me", "ask_agent"),
    ("i want to schedule a visit", "book_visit"),
    ("can i book a walkthrough", "book_visit"),
    ("please call me back", "book_visit"),
    ("contact details for site visit", "book_visit"),
    ("schedule callback", "book_visit")
]

# Train classifier
texts = [x[0] for x in TRAINING_DATA]
labels = [x[1] for x in TRAINING_DATA]
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)
clf = MultinomialNB()
clf.fit(X, labels)

def get_properties_from_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Property WHERE isApproved = 1")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"[Error reading SQLite Property table]: {e}")
        return []

def extract_entities(query):
    q = query.lower()
    
    # 1. City extraction
    city = None
    if "mumbai" in q or "bombay" in q: city = "Mumbai"
    elif "gurugram" in q or "gurgaon" in q: city = "Gurugram"
    elif "bengaluru" in q or "bangalore" in q: city = "Bengaluru"
    elif "delhi" in q or "ncr" in q: city = "Delhi"
    elif "pune" in q: city = "Pune"
    elif "hyderabad" in q: city = "Hyderabad"
    
    # 2. BHK extraction
    bhk = None
    bhk_match = re.search(r"(\d+)\s*bhk", q)
    if bhk_match:
        bhk = int(bhk_match.group(1))
    else:
        bedroom_match = re.search(r"(\d+)\s*bedroom", q)
        if bedroom_match:
            bhk = int(bedroom_match.group(1))

    # 3. Budget extraction
    max_price = None
    crore_match = re.search(r"(?:under|below|less than|within)\s*(?:rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:crore|cr)", q)
    lakh_match = re.search(r"(?:under|below|less than|within)\s*(?:rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)", q)
    if crore_match:
        max_price = float(crore_match.group(1)) * 10000000
    elif lakh_match:
        max_price = float(lakh_match.group(1)) * 100000
        
    # 4. Category extraction
    category = None
    if "villa" in q or "mansion" in q: category = "Villa"
    elif "penthouse" in q or "duplex" in q: category = "Penthouse"
    elif "apartment" in q or "flat" in q: category = "Apartment"
    elif "township" in q: category = "Township"
    
    # 5. Purpose extraction
    purpose = None
    if "rent" in q or "lease" in q: purpose = "RENT"
    elif "buy" in q or "sale" in q or "purchase" in q: purpose = "BUY"
    
    return {
        "city": city,
        "bhk": bhk,
        "max_price": max_price,
        "category": category,
        "purpose": purpose
    }

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json() or {}
        message = data.get("message", "").strip()
        history = data.get("history", [])
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Predict Intent using ML model
        X_query = vectorizer.transform([message.lower()])
        predicted_intent = clf.predict(X_query)[0]
        
        properties = get_properties_from_db()
        entities = extract_entities(message)
        
        reply = ""
        matched_ids = []
        
        if predicted_intent == "greet":
            reply = "Namaste and welcome to Nexora Luxury Estates. I am Jarvis, your digital concierge. How may I assist you with your premium property search today? I can help you find villas, duplexes, or apartments across Mumbai, Gurugram, Bengaluru, and other elite hubs."
            matched_ids = [p["id"] for p in properties[:3]]
            
        elif predicted_intent == "ask_agent":
            reply = "I am Jarvis, Nexora's AI real estate advisor. I specialize in sourcing ultra-luxury estates, analyzing market yields, and coordinating site visits for our elite clients. You can ask me to find specific BHK configurations, villas under a target budget, or rental listings in any premium locality."
            
        elif predicted_intent == "book_visit":
            reply = "I would be delighted to schedule a private walkthrough or site visit for you. Please let me know your preferred date and time, or drop your contact details in our listing wizard, and our relationship managers will coordinate it immediately."
            
        else: # search_property or fallback general
            # Filter database properties
            filtered = []
            for p in properties:
                # filter by city
                if entities["city"] and p.get("city") and entities["city"].lower() not in p.get("city").lower():
                    continue
                # filter by bhk
                if entities["bhk"] and p.get("bhk") and p.get("bhk") != entities["bhk"]:
                    continue
                # filter by budget
                if entities["max_price"] and p.get("price") and p.get("price") > entities["max_price"]:
                    continue
                # filter by category
                if entities["category"] and p.get("category") and entities["category"].lower() not in p.get("category").lower():
                    continue
                # filter by purpose
                if entities["purpose"] and p.get("purpose"):
                    p_purpose = p.get("purpose")
                    if entities["purpose"] == "BUY" and p_purpose not in ["BUY", "SELL"]:
                        continue
                    if entities["purpose"] == "RENT" and p_purpose != "RENT":
                        continue
                filtered.append(p)
                
            if len(filtered) > 0:
                first_p = filtered[0]
                city_text = f" in {entities['city']}" if entities["city"] else ""
                bhk_text = f" featuring {entities['bhk']} BHK" if entities["bhk"] else ""
                type_text = f" {entities['category']}s" if entities["category"] else " luxury portfolios"
                price_text = f" under ₹{(entities['max_price'] / 10000000):.1f} Cr" if entities["max_price"] else ""
                
                reply = f"Using my **Machine Learning model**, I identified **{len(filtered)}{type_text}**{city_text}{bhk_text}{price_text} matching your criteria. Among these is the prestigious **{first_p['name']}** in {first_p['locality'] or 'Elite Locality'}, {first_p['city']}. Here are the matched portfolios:"
                matched_ids = [p["id"] for p in filtered]
            else:
                active_city = entities["city"] or "Mumbai"
                fallback_props = [p for p in properties if active_city.lower() in (p.get("city") or "").lower()]
                show_props = fallback_props[:3] if fallback_props else properties[:3]
                
                reply = f"I couldn't locate an exact match for that specific configuration in our current database. However, I have highlighted some of our finest active portfolios {f'in {active_city}' if entities['city'] else ''} representing peak architectural elegance:"
                matched_ids = [p["id"] for p in show_props]
                
        return jsonify({
            "intent": predicted_intent,
            "entities": entities,
            "reply": reply,
            "matchedPropertyIds": matched_ids
        })
    except Exception as e:
        print(f"[Error in chat endpoint]: {e}")
        return jsonify({"error": "Failed to process chat input"}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
