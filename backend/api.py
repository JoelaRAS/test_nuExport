# backend/api.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from transformers import AutoModelForCausalLM, AutoTokenizer
import json
import torch

# Configuration de FastAPI
app = FastAPI()

# Chargement du modèle et du tokenizer NuExtract
print("Début du chargement du modèle et du tokenizer NuExtract...")
model_name = "numind/NuExtract-v1.5"
device = "cpu"  # Utilisation de CPU uniquement
try:
    model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True).to(device).eval()
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    print("Modèle et tokenizer chargés avec succès.")
except Exception as e:
    print(f"Erreur lors du chargement du modèle : {e}")

# Modèle de données pour l'API
class ExtractRequest(BaseModel):
    bucket_name: str
    folder_path: str
    json_files: List[str]  # Les contenus JSON sont directement passés
    template: dict  # Le template JSON pour l'extraction

# Fonction pour faire une prédiction avec NuExtract
def predict_NuExtract(model, tokenizer, texts, template, batch_size=1, max_length=10_000, max_new_tokens=4_000):
    print("Début de la fonction predict_NuExtract...")
    
    # Convertir le template en chaîne JSON pour le prompt
    template_json = json.dumps(template, indent=4)
    prompts = [f"""<|input|>\n### Template:\n{template_json}\n### Text:\n{text}\n\n<|output|>""" for text in texts]
    print("Prompts générés pour les textes fournis.")

    outputs = []
    with torch.no_grad():
        for i in range(0, len(prompts), batch_size):
            batch_prompts = prompts[i:i + batch_size]
            print(f"Traitement du batch de prompts {i + 1} sur {len(prompts)}...")

            try:
                batch_encodings = tokenizer(batch_prompts, return_tensors="pt", truncation=True, padding=True, max_length=max_length).to(model.device)
                print("Encodage des prompts réussi.")

                pred_ids = model.generate(**batch_encodings, max_new_tokens=max_new_tokens)
                print("Prédiction générée pour ce batch.")

                decoded_output = tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
                outputs += decoded_output
                print(f"Décodage terminé pour le batch. Résultat : {decoded_output}")
            except Exception as e:
                print(f"Erreur lors de la génération pour un batch : {e}")

    try:
        final_outputs = [output.split("<|output|>")[1].strip() for output in outputs]
        print("Extraction des résultats finalisée.")
        return final_outputs
    except Exception as e:
        print(f"Erreur lors de l'extraction des résultats : {e}")
        return []

# Route principale pour extraire les informations des JSONs
@app.post("/extract")
async def extract_info(request: ExtractRequest):
    print("Réception d'une nouvelle requête d'extraction...")
    try:
        predictions = predict_NuExtract(model, tokenizer, request.json_files, request.template)
        print("Prédictions complétées pour la requête.")

        extracted_data = [{"file": f"File {i+1}", "content": pred} for i, pred in enumerate(predictions)]
        print(f"Données extraites prêtes à être renvoyées au frontend : {extracted_data}")

        return {"extracted_data": extracted_data}
    
    except Exception as e:
        print(f"Erreur lors de l'extraction des informations : {e}")
        return {"error": str(e)}
