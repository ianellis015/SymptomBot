import './DiagnosisCard.css';

export default function DiagnosisCard({ condition, rank }) {
    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'mild': return 'severity-mild';
            case 'moderate': return 'severity-moderate';
            case 'severe': return 'severity-severe';
            case 'critical': return 'severity-critical';
            default: return 'severity-moderate';
        }
    };

    const getCommonalityLabel = (commonality) => {
        switch (commonality) {
            case 'very_common': return 'Very Common';
            case 'common': return 'Common';
            case 'less_common': return 'Less Common';
            case 'rare': return 'Rare';
            default: return commonality;
        }
    };

    const getIcon = (severity) => {
        switch (severity) {
            case 'mild': return '🔬';
            case 'moderate': return '⚕️';
            case 'severe': return '🏥';
            case 'critical': return '🚨';
            default: return '🔬';
        }
    };

    return (
        <div className="diagnosis-card" style={{ position: 'relative' }}>
            {rank && <div className="diagnosis-rank">{rank}</div>}

            <div className="diagnosis-header">
                <div className="diagnosis-icon">{getIcon(condition.severity)}</div>
                <span className={`diagnosis-severity ${getSeverityClass(condition.severity)}`}>
                    {condition.severity}
                </span>
            </div>

            <h4 className="diagnosis-name">{condition.name}</h4>
            <p className="diagnosis-commonality">{getCommonalityLabel(condition.commonality)}</p>

            {condition.matching_symptoms && condition.matching_symptoms.length > 0 && (
                <div className="diagnosis-symptoms">
                    {condition.matching_symptoms.map((symptom, index) => (
                        <span key={index} className="symptom-tag matched">
                            {symptom.replace(/_/g, ' ')}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
