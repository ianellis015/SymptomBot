import './SafetyWarning.css';

export default function SafetyWarning({ reason }) {
    return (
        <div className="safety-warning">
            <div className="safety-header">
                <div className="safety-icon">⚠️</div>
                <h3 className="safety-title">Important Safety Notice</h3>
            </div>

            <div className="safety-content">
                <p>
                    Some of the symptoms you described can be associated with <strong>serious conditions</strong> that may require immediate medical attention.
                </p>
                {reason && (
                    <p><strong>{reason}</strong></p>
                )}
            </div>

            <div className="safety-action">
                <span className="safety-action-icon">🏥</span>
                <span className="safety-action-text">
                    Please seek immediate medical evaluation from a healthcare professional.
                </span>
            </div>

            <div className="safety-footer">
                <p className="safety-disclaimer">
                    This is an AI tool and cannot replace professional medical judgment.
                    If you are experiencing a medical emergency, please call emergency services immediately.
                </p>
            </div>
        </div>
    );
}
