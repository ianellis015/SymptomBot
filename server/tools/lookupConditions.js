// Condition lookup tool
// Retrieves possible conditions associated with symptoms

const conditionsDatabase = [
    // Common conditions
    {
        name: "Anemia",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["fatigue", "weakness", "pallor", "dizziness", "dyspnea", "tachycardia", "headache"]
    },
    {
        name: "Common Cold",
        commonality: "very_common",
        severity: "mild",
        associated_symptoms: ["rhinorrhea", "nasal_congestion", "pharyngitis", "cough", "fatigue", "headache"]
    },
    {
        name: "Influenza",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["fever", "chills", "myalgia", "fatigue", "headache", "cough", "pharyngitis"]
    },
    {
        name: "Gastroenteritis",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["nausea", "vomiting", "diarrhea", "abdominal_pain", "fever", "fatigue"]
    },
    {
        name: "Migraine",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["severe_headache", "headache", "nausea", "visual_disturbance", "photophobia"]
    },
    {
        name: "Anxiety Disorder",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["anxiety", "palpitations", "dyspnea", "insomnia", "fatigue", "chest_pain"]
    },
    {
        name: "Dehydration",
        commonality: "common",
        severity: "mild",
        associated_symptoms: ["fatigue", "dizziness", "headache", "polydipsia", "dry_mouth"]
    },
    {
        name: "Hypertension",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["headache", "dizziness", "blurred_vision", "chest_pain"]
    },
    {
        name: "Type 2 Diabetes",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["fatigue", "polydipsia", "polyuria", "blurred_vision", "weight_loss"]
    },
    {
        name: "Hypothyroidism",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["fatigue", "weight_gain", "constipation", "depression", "memory_impairment"]
    },
    {
        name: "Hyperthyroidism",
        commonality: "less_common",
        severity: "moderate",
        associated_symptoms: ["weight_loss", "tachycardia", "anxiety", "diaphoresis", "insomnia", "fatigue"]
    },
    {
        name: "Asthma",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["dyspnea", "wheezing", "cough", "chest_pain"]
    },
    {
        name: "Allergic Rhinitis",
        commonality: "very_common",
        severity: "mild",
        associated_symptoms: ["rhinorrhea", "nasal_congestion", "pruritus", "fatigue"]
    },
    {
        name: "Gastroesophageal Reflux Disease",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["heartburn", "gastroesophageal_reflux", "chest_pain", "cough", "pharyngitis"]
    },
    {
        name: "Depression",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["depression", "fatigue", "insomnia", "anorexia", "weight_loss", "weight_gain"]
    },
    {
        name: "Iron Deficiency",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["fatigue", "weakness", "pallor", "dizziness", "headache"]
    },
    {
        name: "Urinary Tract Infection",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["polyuria", "abdominal_pain", "fever", "back_pain"]
    },
    {
        name: "Vertigo (BPPV)",
        commonality: "common",
        severity: "moderate",
        associated_symptoms: ["vertigo", "dizziness", "nausea", "vomiting"]
    },

    // Serious conditions - require careful handling
    {
        name: "Myocardial Infarction",
        commonality: "less_common",
        severity: "critical",
        associated_symptoms: ["chest_pain", "dyspnea", "diaphoresis", "nausea", "pain_radiating_arm", "fatigue"]
    },
    {
        name: "Pulmonary Embolism",
        commonality: "less_common",
        severity: "critical",
        associated_symptoms: ["chest_pain", "dyspnea", "tachycardia", "syncope", "hemoptysis"]
    },
    {
        name: "Stroke",
        commonality: "less_common",
        severity: "critical",
        associated_symptoms: ["numbness", "confusion", "visual_disturbance", "severe_headache", "weakness"]
    },
    {
        name: "Meningitis",
        commonality: "rare",
        severity: "critical",
        associated_symptoms: ["severe_headache", "fever", "neck_stiffness", "confusion", "photophobia"]
    },
    {
        name: "Pneumonia",
        commonality: "common",
        severity: "severe",
        associated_symptoms: ["cough", "fever", "dyspnea", "chest_pain", "fatigue", "chills"]
    },
    {
        name: "Appendicitis",
        commonality: "less_common",
        severity: "severe",
        associated_symptoms: ["abdominal_pain", "nausea", "vomiting", "fever", "anorexia"]
    }
];

export function lookupConditions(symptoms) {
    if (!symptoms || symptoms.length === 0) {
        return { conditions: [] };
    }

    // Score each condition based on symptom overlap
    const scoredConditions = conditionsDatabase.map(condition => {
        const matchingSymptoms = symptoms.filter(s =>
            condition.associated_symptoms.includes(s)
        );
        const matchScore = matchingSymptoms.length / symptoms.length;
        const coverageScore = matchingSymptoms.length / condition.associated_symptoms.length;

        return {
            ...condition,
            matching_symptoms: matchingSymptoms,
            score: matchScore * 0.7 + coverageScore * 0.3 // Weighted score
        };
    });

    // Filter to conditions with at least one matching symptom and sort by score
    const matchingConditions = scoredConditions
        .filter(c => c.matching_symptoms.length > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6) // Top 6 matches
        .map(({ score, matching_symptoms, ...condition }) => ({
            ...condition,
            matching_symptoms
        }));

    return { conditions: matchingConditions };
}
