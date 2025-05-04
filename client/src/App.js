import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/notifications.css';

// Components
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Clients from './pages/Clients';
import Calendar from './pages/Calendar';
import Calls from './pages/Calls';
import CallDetails from './pages/CallDetails';
import NewCall from './pages/NewCall';
import ClientDetails from './pages/ClientDetails';
import Import from './pages/Import';
import NewClient from './pages/NewClient';

function App() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="loadingSpinner"><div className="spinner"></div></div>}>
      <div className="app-container">
        <Header />
        
        <main className="content-area">
          <div className="content-container">
            <Routes>
              <Route path="/" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/clients" element={
                <PrivateRoute>
                  <Clients />
                </PrivateRoute>
              } />
              <Route path="/clients/new" element={
                <PrivateRoute>
                  <NewClient />
                </PrivateRoute>
              } />
              <Route path="/clients/:clientId" element={
                <PrivateRoute>
                  <ClientDetails />
                </PrivateRoute>
              } />
              <Route path="/calls" element={
                <PrivateRoute>
                  <Calls />
                </PrivateRoute>
              } />
              <Route path="/calls/new" element={
                <PrivateRoute>
                  <NewCall />
                </PrivateRoute>
              } />
              <Route path="/calls/:callId" element={
                <PrivateRoute>
                  <CallDetails />
                </PrivateRoute>
              } />
              <Route path="/calendar" element={
                <PrivateRoute>
                  <Calendar />
                </PrivateRoute>
              } />
              <Route path="/import" element={
                <PrivateRoute>
                  <Import />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </main>
        
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} {t('app.title')} | {t('common.allRightsReserved')}</p>
        </footer>
      </div>
      
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Suspense>
  );
}

export default App; 