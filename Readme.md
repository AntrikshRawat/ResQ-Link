# ResQ-Link

> **Multimodal Person Re-Identification & Disaster Relief Platform**  
> Connecting missing person reports with rescued individuals in disaster and humanitarian crisis zones through automated multimodal AI matching and human-in-the-loop triage.

---

## 📌 Problem Statement

During humanitarian crises and natural disasters, missing person records and rescued survivor intakes are gathered asynchronously by different relief agencies, medical camps, and family members. This results in critical challenges:
- **Spelling & Transliteration Errors**: Names often have varied regional spellings (e.g., *Arun Kumar* vs. *Aroon Kumaar*).
- **Incomplete / Changing Details**: Ages are approximate, clothing may change, and injuries/debris obscure identification.
- **Fragmented Data**: Information silos between intake camps and searching families prevent rapid reunions.

**ResQ-Link** bridges this gap by unifying report intake, applying PostgreSQL trigram candidate filtering, and executing a multimodal AI scoring pipeline (facial recognition, phonetic matching, demographic heuristics, and physical mark overlap). When composite match confidence is high, reports are routed to an officer triage queue for human verification, ensuring speed and reliability without automated false alarms.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Base UI / Shadcn UI, React Hook Form, Zod, React Query, Lucide Icons |
| **Backend** | Node.js, Express.js, Sequelize ORM, PostgreSQL with `pg_trgm` extension, Multer (file storage), JWT, Axios |
| **AI Sidecar** | Python 3.12, FastAPI, Uvicorn, PyTorch (CPU), FaceNet (`InceptionResnetV1` + `MTCNN`), Double Metaphone, Jellyfish (Jaro-Winkler) |
| **Monorepo Runner** | Root `package.json` with `concurrently` |

---

## 📐 Multimodal Matching Pipeline

Matches between **MISSING** and **RESCUED** records produce an explainable score between `0.0` and `1.0`:

1. **Facial Embedding (40%)**: Face detection & alignment via MTCNN followed by 512-dimensional vector embedding extraction via Inception-ResNet-v1 (`vggface2`) and cosine similarity.
2. **Phonetic & Text Matching (35%)**: Token-level Double Metaphone key generation combined with Jaro-Winkler string similarity.
3. **Demographic Compatibility (15%)**: Linear penalty based on age divergence ($\Delta_{\text{age}} / 10$).
4. **Distinguishing Marks (10%)**: Jaccard token overlap across physical descriptions (scars, birthmarks, tattoos).
5. **Dynamic Degradation Fallback**: If photos are missing or faces are obscured, the system smoothly reweights to text heuristics ($0.70 \cdot \text{Name} + 0.20 \cdot \text{Age} + 0.10 \cdot \text{Marks}$) without crashing.
6. **Review Threshold**: Candidates scoring $\ge 0.60$ enter the officer triage queue for manual approval.

---

## 🚀 Initialization & Setup

### 1. Prerequisites
- **Node.js**: v18 or newer
- **Python**: v3.12 or compatible
- **PostgreSQL**: Running locally or accessible via network

---

### 2. Environment Setup

#### A. Backend Database Configuration
Create or verify `Backend/.env`:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resqlink_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_jwt_secret_key
AI_SERVICE_URL=http://127.0.0.1:8000/api/v1/evaluate-match
AI_HEALTH_URL=http://127.0.0.1:8000/health
```

#### B. Install Root & Sub-package Dependencies
From the repository root:
```bash
# Install root runner (concurrently)
npm install

# Install Frontend dependencies
cd Frontend && npm install && cd ..

# Install Backend dependencies
cd Backend && npm install && cd ..
```

#### C. Setup Python AI Environment
```bash
cd AI

# Create virtual environment
python -m venv .venv

# Activate virtual environment:
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

cd ..
```

---

### 3. Running the Entire Project

Start the Frontend, Backend, and AI Service simultaneously from the root folder:

```bash
npm run project
```

This single command initializes all three microservices with color-coded logs:
- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:3000](http://localhost:3000) (Health: `/health`)
- **AI Service**: [http://localhost:8000](http://localhost:8000) (Docs: `/docs`, Health: `/health`)

*(To run an individual service separately, you can run `npm run dev:frontend`, `npm run dev:backend`, or `npm run dev:ai` from the root directory).*