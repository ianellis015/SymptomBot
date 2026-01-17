import { useState, useRef, useEffect } from 'react';
import LoadingIndicator from './LoadingIndicator';
import SafetyWarning from './SafetyWarning';
import DiagnosisCard from './DiagnosisCard';
import './ChatInterface.css';

const API_BASE = 'http://localhost:3001/api';

const examplePrompts = [
    "I feel tired and dizzy",
    "I have a headache and fever",
    "My stomach hurts and I feel nauseous",
    "I'm having trouble sleeping and feeling anxious"
];

export default function ChatInterface() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState('checking');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Check server health on mount
    useEffect(() => {
        checkServerHealth();
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const checkServerHealth = async () => {
        try {
            const response = await fetch(`${API_BASE}/health`);
            const data = await response.json();
            setServerStatus(data.status === 'healthy' ? 'online' : 'offline');
        } catch {
            setServerStatus('offline');
        }
    };

    const sendMessage = async (text) => {
        if (!text.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: text.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text.trim()
                })
            });

            const data = await response.json();

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: data.response,
                toolCalls: data.toolCalls,
                isHighRisk: data.isHighRisk,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: 'I apologize, but I encountered an error processing your request. Please make sure the server is running and try again.',
                isError: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleExampleClick = (prompt) => {
        setInput(prompt);
        sendMessage(prompt);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const parseResponse = (text) => {
        // Extract conditions from numbered list
        const conditions = [];
        const conditionRegex = /\d+\.\s+\*\*(.+?)\*\*(?:\s*\(([^)]+)\))?\s*–\s*(.+?)(?=\n|$)/g;
        let match;
        while ((match = conditionRegex.exec(text)) !== null) {
            conditions.push({
                name: match[1],
                note: match[2] || null,
                description: match[3]
            });
        }

        // Extract confidence
        const confidenceMatch = text.match(/\*\*Confidence:\*\*\s*(Low|Medium|High)/i);
        const confidence = confidenceMatch ? confidenceMatch[1] : null;

        // Extract follow-up question
        const followUpMatch = text.match(/→\s*(.+?)(?=\n|$)/);
        const followUp = followUpMatch ? followUpMatch[1] : null;

        return { conditions, confidence, followUp };
    };

    const renderMessageContent = (message) => {
        if (message.isHighRisk) {
            // Extract reason from the response
            const reasonMatch = message.text.match(/\*\*(.+?)\*\*/);
            return <SafetyWarning reason={reasonMatch ? reasonMatch[1] : null} />;
        }

        const { conditions, confidence, followUp } = parseResponse(message.text);

        return (
            <div className="message-bubble">
                <div className="message-text markdown-content"
                    dangerouslySetInnerHTML={{
                        __html: message.text
                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.+?)\*/g, '<em>$1</em>')
                            .replace(/\n/g, '<br/>')
                    }}
                />

                {confidence && (
                    <div className={`confidence-indicator confidence-${confidence.toLowerCase()}`}>
                        <span>📊</span>
                        Confidence: {confidence}
                    </div>
                )}

                {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="tool-calls">
                        {message.toolCalls.map((tool, index) => (
                            <span key={index} className="tool-badge">
                                🔧 {tool.tool}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="chat-interface">
            {/* Header */}
            <header className="chat-header">
                <div className="header-logo">
                    <div className="logo-icon">🧬</div>
                    <div className="logo-text">
                        <h1>Symptom<span>Bot</span></h1>
                        <p>AI Differential Diagnosis Explorer</p>
                    </div>
                </div>
                <div className="header-status">
                    <div className={`status-dot ${serverStatus !== 'online' ? 'offline' : ''}`}
                        style={{
                            background: serverStatus === 'online' ? 'var(--color-success)' :
                                serverStatus === 'offline' ? 'var(--color-danger)' : 'var(--color-warning)'
                        }}
                    />
                    <span className="status-text" style={{
                        color: serverStatus === 'online' ? 'var(--color-success)' :
                            serverStatus === 'offline' ? 'var(--color-danger)' : 'var(--color-warning)'
                    }}>
                        {serverStatus === 'online' ? 'System Online' :
                            serverStatus === 'offline' ? 'Server Offline' : 'Checking...'}
                    </span>
                </div>
            </header>

            {/* Messages */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="welcome-screen">
                        <div className="welcome-icon">🔬</div>
                        <h2 className="welcome-title">Welcome to SymptomBot</h2>
                        <p className="welcome-subtitle">
                            Describe your symptoms and I'll help generate possible differential diagnoses.
                            Remember, I'm an AI tool for informational purposes only — always consult a healthcare professional
                            for medical advice.
                        </p>
                        <div className="example-prompts">
                            {examplePrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    className="example-prompt"
                                    onClick={() => handleExampleClick(prompt)}
                                >
                                    "{prompt}"
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <div key={message.id} className={`message message-${message.type}`}>
                                <div className="message-avatar">
                                    {message.type === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="message-content">
                                    {message.type === 'user' ? (
                                        <div className="message-bubble">
                                            <div className="message-text">{message.text}</div>
                                        </div>
                                    ) : (
                                        renderMessageContent(message)
                                    )}
                                    <div className="message-time">{formatTime(message.timestamp)}</div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message message-bot">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="message-bubble">
                                        <LoadingIndicator type="pulse" text="Analyzing symptoms..." />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="input-area" onSubmit={handleSubmit}>
                <div className="input-wrapper">
                    <div className="input-field-wrapper">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            placeholder="Describe your symptoms..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            disabled={isLoading || serverStatus === 'offline'}
                            rows={1}
                        />
                    </div>
                    <button
                        type="submit"
                        className="send-button"
                        disabled={!input.trim() || isLoading || serverStatus === 'offline'}
                    >
                        ➤
                    </button>
                </div>
                <p className="input-disclaimer">
                    ⚠️ Not medical advice. For informational purposes only. Always consult a healthcare provider.
                </p>
            </form>
        </div>
    );
}
