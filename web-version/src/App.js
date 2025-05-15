import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AdSunCall</h1>
        <p className="App-subtitle">
          Call Manager pre mobilné zariadenia
        </p>
        
        <div className="App-card">
          <h2>Stiahnite si mobilnú aplikáciu</h2>
          <p>
            Táto aplikácia je optimalizovaná pre mobilné zariadenia.
            Pre najlepší zážitok si stiahnite aplikáciu pre Android alebo iOS.
          </p>
          
          <div className="App-button-container">
            <a 
              className="App-button"
              href="https://play.google.com/store/apps"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stiahnuť pre Android
            </a>
            
            <a 
              className="App-button"
              href="https://apps.apple.com/us/app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stiahnuť pre iOS
            </a>
          </div>
          
          <div className="App-info">
            <h3>Vlastnosti aplikácie:</h3>
            <ul>
              <li>Správa klientov a kontaktov</li>
              <li>Plánovanie hovorov</li>
              <li>Zaznamenávanie hovorov a výsledkov</li>
              <li>Funkcia pripomienok</li>
              <li>Offline prístup k údajom</li>
            </ul>
          </div>
        </div>
        
        <p className="App-footer">
          © {new Date().getFullYear()} AdSunCall - Všetky práva vyhradené
        </p>
      </header>
    </div>
  );
}

export default App;
