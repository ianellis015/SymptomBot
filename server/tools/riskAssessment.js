// Risk assessment tool
// Identifies red-flag combinations that require immediate medical attention

const redFlagPatterns = [
    {
        symptoms: ["chest_pain", "dyspnea"],
        conditions: ["Myocardial Infarction", "Pulmonary Embolism"],
        risk_level: "high",
        reason: "Chest pain combined with shortness of breath can indicate a cardiac emergency or pulmonary embolism. These symptoms require immediate medical evaluation."
    },
    {
        symptoms: ["chest_pain", "diaphoresis"],
        conditions: ["Myocardial Infarction"],
        risk_level: "high",
        reason: "Chest pain with sweating is a classic presentation of heart attack. Seek emergency care immediately."
    },
    {
        symptoms: ["chest_pain", "pain_radiating_arm"],
        conditions: ["Myocardial Infarction"],
        risk_level: "high",
        reason: "Chest pain radiating to the arm is a hallmark sign of myocardial infarction. Emergency evaluation is critical."
    },
    {
        symptoms: ["severe_headache", "confusion"],
        conditions: ["Stroke", "Meningitis"],
        risk_level: "high",
        reason: "Sudden severe headache with confusion may indicate stroke, bleeding in the brain, or meningitis. Immediate medical attention is essential."
    },
    {
        symptoms: ["severe_headache", "fever", "neck_stiffness"],
        conditions: ["Meningitis"],
        risk_level: "high",
        reason: "This triad of symptoms is concerning for meningitis, which requires emergency treatment."
    },
    {
        symptoms: ["numbness", "weakness", "confusion"],
        conditions: ["Stroke"],
        risk_level: "high",
        reason: "Sudden numbness, weakness, and confusion are warning signs of stroke. Time is critical - seek emergency care immediately."
    },
    {
        symptoms: ["numbness", "visual_disturbance"],
        conditions: ["Stroke"],
        risk_level: "high",
        reason: "Sudden numbness with vision changes may indicate a stroke. Emergency evaluation is necessary."
    },
    {
        symptoms: ["syncope", "chest_pain"],
        conditions: ["Myocardial Infarction", "Pulmonary Embolism", "Arrhythmia"],
        risk_level: "high",
        reason: "Fainting with chest pain suggests a potentially life-threatening cardiac or pulmonary condition."
    },
    {
        symptoms: ["dyspnea", "tachycardia", "syncope"],
        conditions: ["Pulmonary Embolism"],
        risk_level: "high",
        reason: "This combination is highly concerning for pulmonary embolism, a blood clot in the lungs requiring emergency care."
    },
    {
        symptoms: ["abdominal_pain", "fever", "vomiting"],
        conditions: ["Appendicitis"],
        risk_level: "moderate_high",
        reason: "Abdominal pain with fever and vomiting may indicate appendicitis or another condition requiring prompt medical evaluation."
    },
    {
        symptoms: ["fever", "dyspnea", "cough"],
        conditions: ["Pneumonia"],
        risk_level: "moderate",
        reason: "This combination suggests possible pneumonia. While not always an emergency, medical evaluation is recommended, especially if symptoms are severe."
    }
];

// Check for critical severity conditions
const criticalConditions = [
    "Myocardial Infarction",
    "Pulmonary Embolism",
    "Stroke",
    "Meningitis"
];

export function riskAssessment(symptoms, conditions) {
    // Default response
    let result = {
        risk_level: "low",
        reason: "No high-risk patterns detected based on the symptoms provided."
    };

    // Check if any critical conditions are in the list
    const hasCriticalCondition = conditions.some(c => criticalConditions.includes(c));

    // Check for red flag symptom patterns
    for (const pattern of redFlagPatterns) {
        const matchingSymptoms = pattern.symptoms.filter(s => symptoms.includes(s));
        const matchRatio = matchingSymptoms.length / pattern.symptoms.length;

        // If we match at least 2 symptoms from the pattern OR all pattern symptoms
        if (matchingSymptoms.length >= 2 || matchRatio === 1) {
            // Check if any of the pattern's conditions match
            const matchingConditions = pattern.conditions.filter(c => conditions.includes(c));

            if (matchingConditions.length > 0 || matchRatio >= 0.8) {
                // Found a concerning pattern
                if (pattern.risk_level === "high" || (pattern.risk_level === "moderate_high" && hasCriticalCondition)) {
                    return {
                        risk_level: "high",
                        reason: pattern.reason,
                        flagged_symptoms: matchingSymptoms,
                        potential_conditions: pattern.conditions
                    };
                } else if (result.risk_level === "low") {
                    result = {
                        risk_level: pattern.risk_level,
                        reason: pattern.reason,
                        flagged_symptoms: matchingSymptoms,
                        potential_conditions: pattern.conditions
                    };
                }
            }
        }
    }

    // Also flag if we have a critical condition with matching symptoms
    if (hasCriticalCondition && result.risk_level === "low") {
        result = {
            risk_level: "moderate",
            reason: "Some symptoms may be associated with serious conditions. Consider consulting a healthcare provider for proper evaluation."
        };
    }

    return result;
}
