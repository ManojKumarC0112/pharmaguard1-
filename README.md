# PharmaGuard: AI-Powered Pharmacogenomics

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](YOUR_VERCEL_APP_URL_HERE)
[![LinkedIn Demo](https://img.shields.io/badge/LinkedIn-Video_Demo-blue)](YOUR_LINKEDIN_VIDEO_URL_HERE)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **RIFT 2026 Submission** | **Track**: AI in Healthcare | **Problem Statement**: Pharmacogenomic Risk Prediction

PharmaGuard is a production-grade AI application that democratizes pharmacogenomic testing. By analyzing VCF (Variant Call Format) data, it predicts patient-specific drug risks (Toxic, Ineffective, Safe) and provides explanations using Generative AI, strictly aligned with **CPIC (Clinical Pharmacogenetics Implementation Consortium)** guidelines.

---

## 🚀 Live Demonstration

- **Live App**: [Insert Vercel/Render URL Here]
- **Video Demo**: [Insert LinkedIn Video URL Here] *#RIFT2026 #PharmaGuard*

---

## 🏗️ Architecture

PharmaGuard employs a decoupled microservices architecture to ensure scalability and separation of concerns.

```mermaid
graph TD
    User[User / Clinician] -->|Uploads VCF| Frontend[Next.js Frontend]
    Frontend -->|POST /analyze| Backend[FastAPI Backend]
    
    subgraph "Backend Services"
        Backend -->|Parses File| Parser[VCF Parser (Custom & Optimized)]
        Parser -->|Extracts Variants| KB[Knowledge Base (CPIC Rules)]
        KB -->|Matches Phenotypes| RiskEngine[Risk Engine]
        RiskEngine -->|Raw Risk Data| LLM[Gemini 1.5 Flash (AI Service)]
        LLM -->|Clinical Explanation| Backend
    end
    
    Backend -->|JSON Response| Frontend
    Frontend -->|Visualizes| Dashboard[Interactive Dashboard]
```

## �️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (Premium "Dark Editorial" Design System)
- **Icons**: Lucide React
- **Visualization**: Framer Motion

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Validation**: Pydantic
- **AI Integration**: Google Gemini 1.5 Flash
- **Bioinformatics**: Custom VCF v4.2 Parser (Performance Optimized)

---

## 💻 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Gemini API Key

### 1. Clone Repository
```bash
git clone https://github.com/your-username/pharmaguard.git
cd pharmaguard
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env

# Run Server
uvicorn main:app --reload --port 8001
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local

# Run Client
npm run dev
```
Open `http://localhost:3000` to view the app.

---

## 🧪 Usage & Sample Data

We provide comprehensive sample datasets to test various risk scenarios. You can download these directly from the **Upload Page** or find them in `frontend/public/`.

| File Name | Description | Key Variants |
| :--- | :--- | :--- |
| **sample_patient.vcf** | Mixed Risk Profile | Standard test case |
| **sample_toxic.vcf** | High Toxicity Risk | **CYP2D6*1/*2xN (URM)**: Codeine Toxicity<br>**CYP2C9*2/*3 (PM)**: Warfarin Bleeding Risk |
| **sample_ineffective.vcf** | Therapeutic Failure | **CYP2C19*2/*2 (PM)**: Clopidogrel Failure<br>**CYP2D6*4/*4 (PM)**: Codeine Inefficacy |

### Steps to Test
1.  Go to the **Upload** page.
2.  Download `sample_toxic.vcf`.
3.  Upload the file.
4.  Navigate to the **Results** page to see the "Toxic" warnings and AI explanation.

---

## � API Documentation

The backend provides a fully documented OpenAPI specification at `http://localhost:8001/docs`.

### Core Endpoint: `POST /analyze`
**Request**: `multipart/form-data` (File: `.vcf`, Drug: `string`)
**Response**:
```json
{
  "drug": "CODEINE",
  "risk_assessment": {
    "risk_label": "Toxic",
    "severity": "critical",
    "confidence_score": 0.98
  },
  "pharmacogenomic_profile": {
    "gene": "CYP2D6",
    "phenotype": "Ultrarapid Metabolizer",
    "diplotype": "*1/*2xN"
  },
  "clinical_recommendation": {
    "text": "Avoid Codeine. Use non-tramadol opioid.",
    "dose_adjustment": "Contraindicated"
  }
}
```

---

## 👥 Team Members

- **Member 1**: [Name] - [Role]
- **Member 2**: [Name] - [Role]
- **Member 3**: [Name] - [Role]

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
