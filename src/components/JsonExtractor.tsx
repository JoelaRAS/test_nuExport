// src/components/JsonExtractor.tsx
import React from 'react';

interface ExtractedData {
    nom: string;
    prix_unitaire: number;
    quantites: number;
    prix: number;
    total: number;
}

interface JsonExtractorProps {
    extractedData: ExtractedData[];
}

const JsonExtractor: React.FC<JsonExtractorProps> = ({ extractedData = [] }) => {
    console.log('Données extraites reçues dans JsonExtractor:', extractedData);

    if (!Array.isArray(extractedData) || extractedData.length === 0) {
        return <p>Aucune donnée extraite à afficher</p>;
    }

    return (
        <div>
            {extractedData.map((data, index) => (
                <div key={index} className="json-card">
                    <h3>{data.nom || 'N/A'}</h3>
                    <p>Prix Unitaire: {data.prix_unitaire || 'N/A'}</p>
                    <p>Quantités: {data.quantites || 'N/A'}</p>
                    <p>Prix: {data.prix || 'N/A'}</p>
                    <p>Total: {data.total || 'N/A'}</p>
                </div>
            ))}
        </div>
    );
};

export default JsonExtractor;
