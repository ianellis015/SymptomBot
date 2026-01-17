// Symptom normalization tool
// Converts user language into standardized medical symptom terms

const symptomMappings = {
  // Fatigue/Energy
  'tired': 'fatigue',
  'exhausted': 'fatigue',
  'no energy': 'fatigue',
  'worn out': 'fatigue',
  'sleepy': 'fatigue',
  'drowsy': 'fatigue',
  'lethargic': 'fatigue',
  'weak': 'weakness',
  
  // Pain
  'headache': 'headache',
  'head hurts': 'headache',
  'migraine': 'severe_headache',
  'chest pain': 'chest_pain',
  'chest hurts': 'chest_pain',
  'stomach pain': 'abdominal_pain',
  'stomach ache': 'abdominal_pain',
  'belly pain': 'abdominal_pain',
  'back pain': 'back_pain',
  'joint pain': 'joint_pain',
  'muscle pain': 'myalgia',
  'sore throat': 'pharyngitis',
  'throat hurts': 'pharyngitis',
  
  // Respiratory
  'cough': 'cough',
  'coughing': 'cough',
  "can't breathe": 'dyspnea',
  'short of breath': 'dyspnea',
  'shortness of breath': 'dyspnea',
  'difficulty breathing': 'dyspnea',
  'hard to breathe': 'dyspnea',
  'wheezing': 'wheezing',
  'congestion': 'nasal_congestion',
  'stuffy nose': 'nasal_congestion',
  'runny nose': 'rhinorrhea',
  
  // Cardiovascular
  'heart racing': 'palpitations',
  'heart pounding': 'palpitations',
  'fast heartbeat': 'tachycardia',
  'irregular heartbeat': 'arrhythmia',
  
  // Neurological
  'dizzy': 'dizziness',
  'dizziness': 'dizziness',
  'lightheaded': 'lightheadedness',
  'vertigo': 'vertigo',
  'fainting': 'syncope',
  'fainted': 'syncope',
  'numbness': 'numbness',
  'tingling': 'paresthesia',
  'pins and needles': 'paresthesia',
  'confusion': 'confusion',
  'confused': 'confusion',
  'memory problems': 'memory_impairment',
  
  // Gastrointestinal
  'nausea': 'nausea',
  'nauseous': 'nausea',
  'feel sick': 'nausea',
  'vomiting': 'vomiting',
  'throwing up': 'vomiting',
  'diarrhea': 'diarrhea',
  'loose stool': 'diarrhea',
  'constipation': 'constipation',
  'bloating': 'bloating',
  'heartburn': 'heartburn',
  'acid reflux': 'gastroesophageal_reflux',
  'loss of appetite': 'anorexia',
  'no appetite': 'anorexia',
  
  // Skin
  'rash': 'rash',
  'itching': 'pruritus',
  'itchy': 'pruritus',
  'hives': 'urticaria',
  'pale': 'pallor',
  'pale skin': 'pallor',
  'sweating': 'diaphoresis',
  'sweaty': 'diaphoresis',
  'night sweats': 'night_sweats',
  
  // General
  'fever': 'fever',
  'chills': 'chills',
  'swelling': 'edema',
  'swollen': 'edema',
  'weight loss': 'weight_loss',
  'weight gain': 'weight_gain',
  'thirsty': 'polydipsia',
  'frequent urination': 'polyuria',
  'blurred vision': 'blurred_vision',
  'vision problems': 'visual_disturbance',
  
  // Mental health
  'anxious': 'anxiety',
  'anxiety': 'anxiety',
  'depressed': 'depression',
  'sad': 'depression',
  'insomnia': 'insomnia',
  "can't sleep": 'insomnia',
  'trouble sleeping': 'insomnia'
};

export function normalizeSymptoms(rawSymptoms) {
  const inputLower = rawSymptoms.toLowerCase();
  const normalizedSet = new Set();
  
  // Check each mapping
  for (const [phrase, normalized] of Object.entries(symptomMappings)) {
    if (inputLower.includes(phrase)) {
      normalizedSet.add(normalized);
    }
  }
  
  // If no matches found, try to extract individual words that might be symptoms
  if (normalizedSet.size === 0) {
    const words = inputLower.split(/\s+/);
    for (const word of words) {
      if (symptomMappings[word]) {
        normalizedSet.add(symptomMappings[word]);
      }
    }
  }
  
  return {
    normalized_symptoms: Array.from(normalizedSet)
  };
}
