import './LoadingIndicator.css';

export default function LoadingIndicator({ type = 'pulse', text = 'Analyzing symptoms...' }) {
    return (
        <div className="loading-container">
            {type === 'dna' ? (
                <div className="dna-helix">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="helix-strand">
                            <div className="helix-dot"></div>
                            <div className="helix-dot"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="pulse-scanner">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="pulse-bar"></div>
                    ))}
                </div>
            )}
            <span className="loading-text">{text}</span>
        </div>
    );
}
