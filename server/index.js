// SymptomBot Express Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { normalizeSymptoms } from './tools/normalizeSymptoms.js';
import { lookupConditions } from './tools/lookupConditions.js';
import { riskAssessment } from './tools/riskAssessment.js';
import { runAgentLoop } from './llm/agent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        hasApiKey: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString()
    });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`[Server] Received message: "${message}"`);

        const result = await runAgentLoop(message, conversationHistory);

        console.log(`[Server] Agent response generated`);

        res.json({
            response: result.response,
            toolCalls: result.toolCalls,
            conversationHistory: result.conversationHistory,
            isHighRisk: result.isHighRisk || false
        });
    } catch (error) {
        console.error('[Server] Error in chat endpoint:', error);
        res.status(500).json({
            error: 'An error occurred processing your request',
            details: error.message
        });
    }
});

// Individual tool endpoints for debugging/testing
app.post('/api/tools/normalize-symptoms', (req, res) => {
    try {
        const { raw_symptoms } = req.body;

        if (!raw_symptoms) {
            return res.status(400).json({ error: 'raw_symptoms is required' });
        }

        const result = normalizeSymptoms(raw_symptoms);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tools/lookup-conditions', (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || !Array.isArray(symptoms)) {
            return res.status(400).json({ error: 'symptoms array is required' });
        }

        const result = lookupConditions(symptoms);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tools/risk-assessment', (req, res) => {
    try {
        const { symptoms, conditions } = req.body;

        if (!symptoms || !Array.isArray(symptoms)) {
            return res.status(400).json({ error: 'symptoms array is required' });
        }
        if (!conditions || !Array.isArray(conditions)) {
            return res.status(400).json({ error: 'conditions array is required' });
        }

        const result = riskAssessment(symptoms, conditions);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                     SymptomBot Server                         ║
╠═══════════════════════════════════════════════════════════════╣
║  Status:    Running on http://localhost:${PORT}                  ║
║  API Key:   ${process.env.OPENAI_API_KEY ? 'Configured ✓' : 'Not configured (using mock mode)'}              ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});
