import spacy

# Load the pre-trained model
model_path = "c:/Users/User/Desktop/RedactX - Copy/project/backend/model/model-best"
nlp = spacy.load(model_path)

def redact_entities(text):
    doc = nlp(text)
    redacted_text = text
    for ent in doc.ents:
        redacted_text = redacted_text.replace(ent.text, "[REDACTED]")
    return redacted_text

