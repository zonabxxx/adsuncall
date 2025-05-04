import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaBell, FaCalendarAlt, FaExclamationCircle, FaTimes, FaSpinner, FaInbox } from 'react-icons/fa';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { getTodaysCalls, getCalls } from '../features/calls/callSlice';
import '../styles/notifications.css';

const CallNotifications = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [upcomingCalls, setUpcomingCalls] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const notificationRef = useRef(null);
  
  const { todaysCalls, calls, isLoading: loading, isError: error } = useSelector(state => state.calls);
  
  // Logging pre debugging
  useEffect(() => {
    console.log('Today calls from Redux:', todaysCalls);
  }, [todaysCalls]);
  
  // Načítať dnešné hovory pri prvom renderovaní
  useEffect(() => {
    dispatch(getTodaysCalls());
    
    // Nastaviť interval na obnovenie dát každých 60 sekúnd
    const interval = setInterval(() => {
      dispatch(getTodaysCalls());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  // Ak nie sú dnešné volania, načítať všetky volania a filtrovať nadchádzajúce
  useEffect(() => {
    if (todaysCalls && todaysCalls.length === 0) {
      dispatch(getCalls());
    }
  }, [todaysCalls, dispatch]);
  
  // Filtrovať nadchádzajúce volania
  useEffect(() => {
    if (calls && calls.length > 0 && todaysCalls && todaysCalls.length === 0) {
      const now = new Date();
      const filtered = calls.filter(call => {
        if (!call.callDate) return false;
        const callDate = new Date(call.callDate);
        return callDate > now && call.status === 'scheduled';
      });
      
      // Zoradiť podľa dátumu
      const sorted = filtered.sort((a, b) => new Date(a.callDate) - new Date(b.callDate));
      
      // Len najbližšie 3 
      const upcoming = sorted.slice(0, 3);
      console.log('Upcoming calls:', upcoming);
      setUpcomingCalls(upcoming);
    }
  }, [calls, todaysCalls]);
  
  // Obnoviť dáta aj pri otvorení notifikácií
  useEffect(() => {
    if (isOpen) {
      dispatch(getTodaysCalls());
    }
  }, [isOpen, dispatch]);
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: sk });
  };
  
  // Function to determine which date to display - callDate or nextActionDate
  const getDisplayTime = (call) => {
    // Pre aktuálny deň zobrazujeme čas volania
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (call.callDate) {
      const callDate = new Date(call.callDate);
      const callDateOnly = new Date(callDate.getFullYear(), callDate.getMonth(), callDate.getDate());
      
      // Ak dátum volania je dnes, zobraziť čas volania
      if (callDateOnly.getTime() === todayDate.getTime()) {
        return formatTime(call.callDate);
      }
    }
    
    // Ak je definovaný nextActionDate a je to dnes, zobraziť ho
    if (call.nextActionDate) {
      const nextDate = new Date(call.nextActionDate);
      const nextDateOnly = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
      
      // Ak je nextActionDate dnes, zobraziť jeho čas
      if (nextDateOnly.getTime() === todayDate.getTime()) {
        return formatTime(call.nextActionDate);
      }
    }
    
    // Ak nemáme ani jeden dátum na dnes, vrátiť callDate alebo nextActionDate
    return call.callDate ? formatTime(call.callDate) : formatTime(call.nextActionDate);
  };
  
  const today = useMemo(() => {
    return format(new Date(), 'EEEE, d. MMMM', { locale: sk });
  }, []);
  
  const lastUpdated = useMemo(() => {
    return format(new Date(), 'HH:mm:ss', { locale: sk });
  }, []);
  
  // Helper function to get status translation
  const getStatusTranslation = (status) => {
    const statusMap = {
      'scheduled': t('calls.status.scheduled'),
      'in_progress': t('calls.status.in_progress'),
      'completed': t('calls.status.completed'),
      'cancelled': t('calls.status.cancelled')
    };
    return statusMap[status] || status;
  };
  
  const sortedCalls = useMemo(() => {
    if (!todaysCalls || !todaysCalls.length) return [];
    
    return [...todaysCalls].sort((a, b) => {
      return new Date(a.callDate) - new Date(b.callDate);
    });
  }, [todaysCalls]);
  
  const callCount = sortedCalls.length;
  
  // Check if call time is within the next hour
  const isCallSoon = (callDate) => {
    if (!callDate) return false;
    const now = new Date();
    const callTime = new Date(callDate);
    const diffMs = callTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 1;
  };
  
  // Začiatok drag operácie
  const handleMouseDown = (e) => {
    if (!notificationRef.current) return;
    
    // Ak kliknutie nie je na hlavičku, ignorovať
    if (!e.target.closest('.call-notifications-header')) return;
    
    setIsDragging(true);
    
    // Uložiť pozíciu myši
    setInitialPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    e.preventDefault();
  };
  
  // Koniec drag operácie
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Pridať a odstrániť event listenery pre drag-and-drop
  useEffect(() => {
    // Pohyb počas drag operácie - presunutá dovnútra useEffect
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      // Aktualizovať pozíciu notifikačného panelu
      setPosition({
        x: e.clientX - initialPosition.x,
        y: e.clientY - initialPosition.y
      });
      
      e.preventDefault();
    };
    
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, isDragging, initialPosition]);
  
  if (!isOpen) {
    return (
      <div className="notification-wrapper">
        <button 
          className={`notification-toggle-btn ${(callCount > 0 || upcomingCalls.length > 0) ? 'has-notifications' : ''}`}
          onClick={toggleNotifications}
          aria-label={t('notifications.toggle')}
        >
          <FaBell />
          {(callCount > 0 || upcomingCalls.length > 0) && (
            <span className="notification-badge">
              {callCount > 0 ? callCount : upcomingCalls.length}
            </span>
          )}
        </button>
      </div>
    );
  }
  
  return (
    <div className="notification-wrapper">
      <button 
        className={`notification-toggle-btn ${(callCount > 0 || upcomingCalls.length > 0) ? 'has-notifications' : ''}`}
        onClick={toggleNotifications}
        aria-label={t('notifications.toggle')}
      >
        <FaBell />
        {(callCount > 0 || upcomingCalls.length > 0) && (
          <span className="notification-badge">
            {callCount > 0 ? callCount : upcomingCalls.length}
          </span>
        )}
      </button>
      
      <div 
        className="call-notifications" 
        ref={notificationRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease'
        }}
      >
        <div 
          className="call-notifications-header"
          onMouseDown={handleMouseDown}
        >
          <div className="header-controls">
            <h3>
              <FaBell /> {callCount > 0 
                ? t('notifications.today_calls', { count: callCount }) 
                : t('notifications.upcoming_calls')}
            </h3>
            <button className="close-btn" onClick={toggleNotifications}>
              <FaTimes />
            </button>
          </div>
          <div className="today-date">
            <FaCalendarAlt className="calendar-icon" /> {today}
          </div>
        </div>
        
        <div className="call-notifications-content">
          {loading ? (
            <div className="notification-loading">
              <FaSpinner />
              <div>{t('common.loading')}</div>
            </div>
          ) : error ? (
            <div className="notification-error">
              <FaExclamationCircle />
              <div>{t('errors.data_fetch_error')}</div>
            </div>
          ) : sortedCalls.length > 0 ? (
            <>
              <div className="notification-list-header">
                <div>{t('call.time')}</div>
                <div>{t('client.name')}</div>
                <div>{t('call.status')}</div>
              </div>
              {sortedCalls.map(call => (
                <Link 
                  key={call._id} 
                  to={`/calls/${call._id}`}
                  className={`notification-item ${isCallSoon(call.callDate) ? 'call-soon' : ''}`}
                >
                  <div className="notification-time">
                    {getDisplayTime(call)}
                  </div>
                  <div className="notification-client">
                    {call.client?.name || call.clientName || t('common.noClient')}
                  </div>
                  <div className={`notification-status ${call.status}`}>
                    {getStatusTranslation(call.status)}
                  </div>
                </Link>
              ))}
            </>
          ) : upcomingCalls.length > 0 ? (
            <>
              <div className="notification-list-header">
                <div>{t('call.date')}</div>
                <div>{t('client.name')}</div>
                <div>{t('call.status')}</div>
              </div>
              {upcomingCalls.map(call => (
                <Link 
                  key={call._id} 
                  to={`/calls/${call._id}`}
                  className="notification-item"
                >
                  <div className="notification-time">
                    {getDisplayTime(call)}
                  </div>
                  <div className="notification-client">
                    {call.client?.name || call.clientName || t('common.noClient')}
                  </div>
                  <div className={`notification-status ${call.status}`}>
                    {getStatusTranslation(call.status)}
                  </div>
                </Link>
              ))}
            </>
          ) : (
            <div className="notification-empty">
              <FaInbox />
              <div>{t('calls.noScheduledCalls')}</div>
              <p>{t('calls.noCallsMessage')}</p>
            </div>
          )}
        </div>
        
        <div className="last-updated">
          {t('notifications.lastUpdated')}: {lastUpdated}
        </div>
        
        <div className="notifications-footer">
          <Link to="/calendar" className="calendar-link-bottom">
            <FaCalendarAlt /> {t('calendar.title')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CallNotifications; 