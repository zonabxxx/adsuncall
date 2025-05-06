// Najprv importujeme i18n
import './i18n-setup';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './styles/base.css';
import './styles/buttons.css';
import './styles/forms.css';
import './styles/header.css';
import './styles/tables.css';
import './styles/layout.css';
import './styles/calendar.css';
import './styles/modal.css';
import './styles/notifications.css';

// Create root using React 18 createRoot API
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Render the app
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 