// LLM Agent Orchestrator
// Implements the strict agent loop with tool function calling

import OpenAI from 'openai';
import { normalizeSymptoms } from '../tools/normalizeSymptoms.js';
import { lookupConditions } from '../tools/lookupConditions.js';
import { riskAssessment } from '../tools/riskAssessment.js';

// Tool definitions for OpenAI function calling
const tools = [
    {
        type: "function",
        function: {
            name: "normalize_symptoms",
            description: "Convert user language into standardized medical symptom terms",
            parameters: {
                type: "object",
                properties: {
                    raw_symptoms: {
                        type: "string",
                        description: "The raw symptom description from the user"
                    }
                },
                required: ["raw_symptoms"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "lookup_conditions",
            description: "Retrieve possible conditions associated with symptoms",
            parameters: {
                type: "object",
                properties: {
                    symptoms: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of normalized symptom terms"
                    }
                },
                required: ["symptoms"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "risk_assessment",
            description: "Identify red-flag combinations that require caution",
            parameters: {
                type: "object",
                properties: {
                    symptoms: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of normalized symptom terms"
                    },
                    conditions: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of condition names to assess"
                    }
                },
                required: ["symptoms", "conditions"]
            }
        }
    }
];

// Execute tool calls
function executeTool(toolName, args) {
    switch (toolName) {
        case 'normalize_symptoms':
            return normalizeSymptoms(args.raw_symptoms);
        case 'lookup_conditions':
            return lookupConditions(args.symptoms);
        case 'risk_assessment':
            return riskAssessment(args.symptoms, args.conditions);
        default:
            return { error: `Unknown tool: ${toolName}` };
    }
}

// System prompt for the medical agent
const SYSTEM_PROMPT = `You are an AI agent embedded in a medical decision-support prototype.

You are not a doctor and must never provide definitive diagnoses or treatment advice.

Your role is to:
- Generate plausible differential diagnoses
- Use tool calls as your primary reasoning mechanism
- Explicitly manage uncertainty and risk
- Ask targeted follow-up questions when confidence is low

CRITICAL RULES:
1. You MUST use tools to interpret symptoms, retrieve medical knowledge, and assess risk
2. You may NOT hallucinate medical facts
3. If tool data is insufficient, ask the user for clarification instead of guessing
4. If a high-risk condition is detected, you must short-circuit and surface a safety message

AGENT LOOP (FOLLOW STRICTLY):
1. Call normalize_symptoms with the user's raw input
2. Call lookup_conditions with the normalized symptoms
3. Call risk_assessment with symptoms and conditions
4. If risk_level is "high": Stop and display safety message
5. If confidence is low/moderate: Ask ONE clarifying question
6. If confidence is high: Present ranked differentials

OUTPUT FORMAT:
When presenting differential diagnoses:
"Based on the symptoms provided, here are some possible causes:
1. Condition Name – short explanation
2. Condition Name – short explanation

Confidence: Low / Medium / High

To better understand your situation, one question could help:
→ [Targeted follow-up question]"

When risk is high:
"⚠️ IMPORTANT SAFETY NOTICE

Some of the symptoms you described can be associated with serious conditions that may require immediate medical attention.

It would be safest to seek immediate medical evaluation from a healthcare professional.

Please do not delay seeking care if you are experiencing these symptoms."`;

export async function runAgentLoop(userMessage, conversationHistory = []) {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
        // Return mock response for development/demo without API key
        return runMockAgentLoop(userMessage);
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    // Build messages array
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: "user", content: userMessage }
    ];

    let response;
    let toolResults = [];
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (iterations < maxIterations) {
        iterations++;

        response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: messages,
            tools: tools,
            tool_choice: "auto"
        });

        const assistantMessage = response.choices[0].message;
        messages.push(assistantMessage);

        // Check if we have tool calls
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
            for (const toolCall of assistantMessage.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);

                console.log(`[Agent] Calling tool: ${toolName}`, toolArgs);

                const result = executeTool(toolName, toolArgs);

                console.log(`[Agent] Tool result:`, result);

                toolResults.push({
                    tool: toolName,
                    args: toolArgs,
                    result: result
                });

                // Add tool result to messages
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
            }
        } else {
            // No more tool calls, we have a final response
            break;
        }
    }

    return {
        response: response.choices[0].message.content,
        toolCalls: toolResults,
        conversationHistory: messages.slice(1) // Exclude system prompt
    };
}

// Mock agent loop for development without API key
async function runMockAgentLoop(userMessage) {
    console.log('[Agent] Running in MOCK mode (no API key configured)');

    // Step 1: Normalize symptoms
    const normalizeResult = normalizeSymptoms(userMessage);
    console.log('[Mock Agent] Normalized symptoms:', normalizeResult);

    const toolResults = [{
        tool: 'normalize_symptoms',
        args: { raw_symptoms: userMessage },
        result: normalizeResult
    }];

    if (normalizeResult.normalized_symptoms.length === 0) {
        return {
            response: "I couldn't identify specific symptoms from your description. Could you please describe your symptoms in more detail? For example, are you experiencing any pain, fatigue, fever, or other specific sensations?",
            toolCalls: toolResults,
            conversationHistory: []
        };
    }

    // Step 2: Lookup conditions
    const conditionsResult = lookupConditions(normalizeResult.normalized_symptoms);
    console.log('[Mock Agent] Conditions found:', conditionsResult);

    toolResults.push({
        tool: 'lookup_conditions',
        args: { symptoms: normalizeResult.normalized_symptoms },
        result: conditionsResult
    });

    // Step 3: Risk assessment
    const conditionNames = conditionsResult.conditions.map(c => c.name);
    const riskResult = riskAssessment(normalizeResult.normalized_symptoms, conditionNames);
    console.log('[Mock Agent] Risk assessment:', riskResult);

    toolResults.push({
        tool: 'risk_assessment',
        args: {
            symptoms: normalizeResult.normalized_symptoms,
            conditions: conditionNames
        },
        result: riskResult
    });

    // Step 4: Generate response based on risk level
    if (riskResult.risk_level === 'high') {
        return {
            response: `⚠️ **IMPORTANT SAFETY NOTICE**

Some of the symptoms you described can be associated with serious conditions that may require immediate medical attention.

**${riskResult.reason}**

It would be safest to seek immediate medical evaluation from a healthcare professional. Please do not delay seeking care if you are experiencing these symptoms.

*This is an AI tool and cannot replace professional medical judgment. If you are experiencing a medical emergency, please call emergency services immediately.*`,
            toolCalls: toolResults,
            conversationHistory: [],
            isHighRisk: true
        };
    }

    // Build differential diagnosis response
    const topConditions = conditionsResult.conditions.slice(0, 4);

    let response = `Based on the symptoms provided, here are some possible causes:\n\n`;

    topConditions.forEach((condition, index) => {
        const severityNote = condition.severity === 'mild' ? '' :
            condition.severity === 'moderate' ? ' (warrants attention)' :
                ' (requires evaluation)';
        response += `${index + 1}. **${condition.name}**${severityNote} – commonly associated with ${condition.matching_symptoms.join(', ')}\n`;
    });

    // Determine confidence
    const matchQuality = topConditions.length > 0 ?
        (topConditions[0].matching_symptoms.length / normalizeResult.normalized_symptoms.length) : 0;

    let confidence;
    let followUpQuestion;

    if (matchQuality >= 0.8 && topConditions.length >= 2) {
        confidence = 'High';
        followUpQuestion = null;
    } else if (matchQuality >= 0.5) {
        confidence = 'Medium';
        followUpQuestion = generateFollowUpQuestion(normalizeResult.normalized_symptoms, topConditions);
    } else {
        confidence = 'Low';
        followUpQuestion = generateFollowUpQuestion(normalizeResult.normalized_symptoms, topConditions);
    }

    response += `\n**Confidence:** ${confidence}`;

    if (followUpQuestion) {
        response += `\n\nTo better understand your situation, one question could help:\n→ ${followUpQuestion}`;
    }

    response += `\n\n---\n*Disclaimer: This is an AI tool for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.*`;

    return {
        response,
        toolCalls: toolResults,
        conversationHistory: []
    };
}

function generateFollowUpQuestion(symptoms, conditions) {
    // Generate relevant follow-up questions based on symptoms
    if (symptoms.includes('fatigue') || symptoms.includes('weakness')) {
        return "How long have you been experiencing these symptoms? Have you noticed any changes in your diet, sleep patterns, or stress levels recently?";
    }
    if (symptoms.includes('chest_pain')) {
        return "Can you describe the chest pain more specifically? Is it sharp or dull? Does it worsen with breathing, movement, or eating?";
    }
    if (symptoms.includes('headache') || symptoms.includes('severe_headache')) {
        return "Where exactly is the headache located? Is it accompanied by sensitivity to light or sound?";
    }
    if (symptoms.includes('dizziness') || symptoms.includes('lightheadedness')) {
        return "Does the dizziness occur when standing up quickly, or is it constant? Have you experienced any falls or near-falls?";
    }
    if (symptoms.includes('abdominal_pain')) {
        return "Where in your abdomen is the pain located? Is it associated with eating, and have you noticed any changes in bowel habits?";
    }
    if (symptoms.includes('cough')) {
        return "Is your cough dry or productive? If productive, what color is the mucus?";
    }

    // Default question
    return "How long have you been experiencing these symptoms, and have they been getting better, worse, or staying the same?";
}
