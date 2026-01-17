# SymptomBot 🧬
**Symptom → Differential Diagnosis Explorer**

An AI-powered medical decision-support prototype that generates plausible differential diagnoses using structured medical tools.

> ⚠️ **Disclaimer**: This is an educational prototype. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a healthcare provider for medical concerns.

## Features

- 🔬 **Symptom Normalization** - Converts user language to standardized medical terms
- 📋 **Condition Lookup** - Retrieves matching conditions from medical knowledge base
- ⚠️ **Risk Assessment** - Detects red-flag symptom combinations requiring urgent care
- 🤖 **LLM Agent Loop** - Structured reasoning with tool-based decision making
- 🎨 **High-Tech Medical Lab UI** - Dark theme with glassmorphism and scientific aesthetic

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **LLM**: OpenAI GPT-4 (optional - works in mock mode without API key)

## Getting Started

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment (Optional)

To use the LLM features, create a `.env` file in the server directory:

```bash
cd server
cp .env.example .env
# Add your OpenAI API key to .env
```

The app works in **mock mode** without an API key, using the built-in medical tools directly.

### 3. Start the Application

```bash
# Terminal 1 - Start the backend
cd server
npm run dev

# Terminal 2 - Start the frontend
cd client
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/chat` | POST | Main LLM conversation endpoint |
| `/api/tools/normalize-symptoms` | POST | Symptom normalization |
| `/api/tools/lookup-conditions` | POST | Condition lookup |
| `/api/tools/risk-assessment` | POST | Risk assessment |

## Project Structure

```
SymptomBot/
├── client/                # React frontend
│   └── src/
│       ├── components/    # UI components
│       ├── App.jsx        # Main app
│       └── index.css      # Design system
├── server/                # Node.js backend
│   ├── tools/             # Medical tool implementations
│   ├── llm/               # LLM agent orchestrator
│   └── index.js           # Express server
└── README.md
```

## Medical Tools

### 1. Normalize Symptoms
Converts natural language to standardized medical terms.
```
"I feel tired and dizzy" → ["fatigue", "dizziness"]
```

### 2. Lookup Conditions
Retrieves conditions matching the symptoms.
```
["fatigue", "dizziness"] → [Anemia, Dehydration, Hypothyroidism...]
```

### 3. Risk Assessment
Identifies dangerous symptom combinations.
```
["chest_pain", "dyspnea"] → HIGH RISK - Possible cardiac emergency
```

## License

MIT License - For educational purposes only.
