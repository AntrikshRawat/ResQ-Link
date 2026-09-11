# ResQ-Link AI Service

A lightweight Python FastAPI sidecar that compares missing and rescued person reports. It calculates match scores across photos, names, estimated ages, and physical marks to suggest potential matches for human review.

---

## What It Does

The service compares two intake records and produces an explainable match score between `0.0` and `1.0`:

1. **Face Match (FaceNet):** Crops the face using MTCNN and extracts a 512-number vector embedding using Inception-ResNet-v1. It then checks cosine similarity between the two faces.


2. **Name Match (Phonetics):** Uses Double Metaphone and Jaro-Winkler to catch spelling and transliteration differences (like *Arun Kumar* vs *Aroon Kumaar*).


3. **Age Difference:** Penalizes scores as the estimated age gap widens ($\Delta_{\text{age}} / 10$). If an age is missing, it stays neutral (`0.50`).


4. **Physical Marks:** Tokenizes physical descriptions (scars, tattoos, birthmarks) and calculates word overlap.



---

## Scoring Rules

Final scores always stay between `0.0` and `1.0`.

* **Standard (Both photos have faces):**

$$\text{Score} = 0.40 \cdot \text{Face} + 0.35 \cdot \text{Name} + 0.15 \cdot \text{Age} + 0.10 \cdot \text{Marks}$$



* **Fallback (Missing photo or blurry face):**

$$\text{Score} = 0.70 \cdot \text{Name} + 0.20 \cdot \text{Age} + 0.10 \cdot \text{Marks}$$



* **Review Cut-off:**
* Score $\ge 0.60$: Flagged as eligible for human review (`PENDING_REVIEW` in the backend).


* Score $< 0.60$: Not sent to the officer triage queue.





---

## API Contract

### `POST /api/v1/evaluate-match`

**Request:**

```json
{
  "reportA": {
    "firstName": "Arun",
    "lastName": "Kumar",
    "approximateAge": 28,
    "distinguishingMarks": "scar on left eyebrow",
    "photoPath": "reports/TRK-8821.jpg"
  },
  "reportB": {
    "firstName": "Aroon",
    "lastName": "Kumaar",
    "approximateAge": 30,
    "distinguishingMarks": "small scar near left eyebrow",
    "photoPath": "reports/REP-9042.jpg"
  }
}

```

**Response:**

```json
{
  "compositeScore": 0.8875,
  "faceSimilarity": 0.912,
  "phoneticSimilarity": 0.95,
  "demographicScore": 0.80,
  "marksScore": 0.75,
  "isEligibleForReview": true,
  "isDegradedTextOnly": false,
  "faceDetectedA": true,
  "faceDetectedB": true,
  "phoneticKeysA": ["ARN", "KMR"],
  "phoneticKeysB": ["ARN", "KMR"],
  "ageDelta": 2,
  "discrepancies": {
    "ageDelta": 2,
    "marksOverlap": ["eyebrow", "scar"],
    "nameDiscrepancy": "Arun Kumar vs Aroon Kumaar",
    "isDegradedTextOnly": false
  }
}

```

---

## Quickstart

### 1. Install Dependencies

Requires Python 3.12.7:

```powershell
pip install -r requirements.txt

```

### 2. Cache Model Weights (One-time only)

Downloads the ~107 MB FaceNet weights to your local machine once so the app works offline:

```powershell
python -c "from facenet_pytorch import InceptionResnetV1; InceptionResnetV1(pretrained='vggface2')"

```

### 3. Start the Service

```powershell
uvicorn app.main:app --reload --port 8000

```

API docs will be live at `[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)`.

---

## Tests & Demo Data

* **Run all tests:**
```powershell
pytest tests/

```


* **Run the 25-case demo benchmark:**
```powershell
python -m data.seed_synthetic_data

```


(Tests transliterations, missing photos, hard negatives, and age gaps.)