import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  return (
    <div className="app">
      <main className="app-main">
        <ChatInterface />
      </main>
      <footer className="app-footer">
        <p>SymptomBot v1.0 — AI-powered differential diagnosis explorer. Not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}

export default App;
