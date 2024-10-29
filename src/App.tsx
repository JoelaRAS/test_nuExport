// src/App.tsx
import React from 'react';
import DataLoader from './components/Dataloader';
import './App.css';

const App: React.FC = () => {
    return (
        <div className="App">
            <h1>Extraction de Données JSON</h1>
            <DataLoader />
        </div>
    );
};

export default App;
