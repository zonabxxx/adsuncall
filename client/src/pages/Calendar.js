import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import { getCalls } from '../features/calls/callSlice';
import { Link } from 'react-router-dom';

function Calendar() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const dispatch = useDispatch();
  
  const { calls, isLoading } = useSelector((state) => state.calls);
  
  // Load all calls for the calendar display
  useEffect(() => {
    dispatch(getCalls());
  }, [dispatch]);
  
  // Refresh data when month changes
  useEffect(() => {
    // We already track currentDate in the dependency array
    // which will trigger this effect when month or year changes
    dispatch(getCalls());
  }, [currentDate, dispatch]);

  // Pomocná funkcia pre generovanie dní v mesiaci
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Získame prvý deň v mesiaci
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Prevedenie na pondelok=0
    
    // Doplníme dni z predchádzajúceho mesiaca
    for (let i = startingDay; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: isSameDay(prevDate, new Date())
      });
    }
    
    // Pridáme dni aktuálneho mesiaca
    while (date.getMonth() === month) {
      const clonedDate = new Date(date);
      days.push({
        date: clonedDate,
        isCurrentMonth: true,
        isToday: isSameDay(clonedDate, new Date())
      });
      date.setDate(date.getDate() + 1);
    }
    
    // Doplníme dni ďalšieho mesiaca
    const lastDayIndex = days[days.length - 1].date.getDay();
    const remainingDays = lastDayIndex === 0 ? 0 : 7 - lastDayIndex;
    
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: isSameDay(nextDate, new Date())
      });
    }
    
    return days;
  };
  
  // Pomocná funkcia pre porovnanie dátumov
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };
  
  // Funkcia pre získanie hovorov pre konkrétny deň
  const getCallsForDay = (day) => {
    if (!calls || !Array.isArray(calls)) {
      return [];
    }
    
    // Pre porovnanie potrebujeme deň bez času a časového pásma
    // Používame lokálny dátum, aby sme predišli problému s časovými pásmami
    const dayYear = day.getFullYear();
    const dayMonth = day.getMonth();
    const dayDate = day.getDate();
    
    const callsForDay = calls.filter(call => {
      if (!call) {
        return false;
      }
      
      try {
        // Kontrola pre primárny dátum hovoru callDate
        if (call.callDate) {
          // Konverzia na lokálny čas
          const callDate = new Date(call.callDate);
          
          // Porovnanie dňa, mesiaca a roku namiesto ISO stringu
          if (callDate.getDate() === dayDate && 
              callDate.getMonth() === dayMonth && 
              callDate.getFullYear() === dayYear) {
            return true;
          }
        }
        
        // Kontrola pre nextActionDate - taktiež pridať hovory s nasledujúcimi akciami do kalendára
        if (call.nextActionDate) {
          const nextActionDate = new Date(call.nextActionDate);
          
          // Porovnanie dňa, mesiaca a roku namiesto ISO stringu
          if (nextActionDate.getDate() === dayDate && 
              nextActionDate.getMonth() === dayMonth && 
              nextActionDate.getFullYear() === dayYear) {
            return true;
          }
        }
        
        return false;
      } catch (error) {
        console.error('Error comparing dates:', error);
        return false;
      }
    });
    
    return callsForDay;
  };
  
  // Posun na predchádzajúci mesiac
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Posun na nasledujúci mesiac
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Návrat na aktuálny mesiac
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Generujeme dni pre mesačný pohľad
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  // Formátovanie názvu mesiaca a roku
  const monthYear = currentDate.toLocaleDateString(t('locale'), { 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Dni v týždni - použijeme skrátené názvy
  const weekdays = [
    t('calendar.mondayShort', 'Po'),
    t('calendar.tuesdayShort', 'Ut'),
    t('calendar.wednesdayShort', 'St'),
    t('calendar.thursdayShort', 'Št'),
    t('calendar.fridayShort', 'Pi'),
    t('calendar.saturdayShort', 'So'),
    t('calendar.sundayShort', 'Ne')
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button className="btn" onClick={prevMonth}>
            <FaChevronLeft />
          </button>
          <button className="btn today-btn" onClick={goToToday}>
            {t('calendar.today')}
          </button>
          <button className="btn" onClick={nextMonth}>
            <FaChevronRight />
          </button>
        </div>
        
        <h2 className="calendar-title">{monthYear}</h2>
        
        <div className="calendar-view-options">
          <button className="btn">
            {t('calendar.month')}
          </button>
        </div>
      </div>
      
      <div className="calendar-month-view">
        <div className="calendar-weekdays">
          {weekdays.map((day, index) => (
            <div key={index}>{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {daysInMonth.map((day, index) => {
            const dayCallsData = getCallsForDay(day.date);
            const hasEvents = dayCallsData.length > 0;
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${!day.isCurrentMonth ? 'empty' : ''} ${day.isToday ? 'today' : ''}`}
              >
                <div className="day-header">
                  {day.date.getDate()}
                </div>
                
                <div className="day-events">
                  {isLoading ? (
                    <div className="loading-events">
                      <small>{t('common.loading')}</small>
                    </div>
                  ) : (
                    hasEvents ? (
                      dayCallsData.map(call => {
                        // Jednoduchšie určenie triedy podľa stavu
                        const statusClass = call.status 
                          ? call.status.toLowerCase().replace(/\s+/g, '_')
                          : 'default';
                        
                        // Určenie, či ide o primárny hovor alebo nasledujúcu akciu (follow-up)
                        const isNextAction = call.nextActionDate && (() => {
                          const nextDate = new Date(call.nextActionDate);
                          return (
                            nextDate.getDate() === day.date.getDate() && 
                            nextDate.getMonth() === day.date.getMonth() && 
                            nextDate.getFullYear() === day.date.getFullYear()
                          );
                        })();
                        
                        return (
                          <Link 
                            to={`/calls/${call._id}`} 
                            key={call._id}
                            className={`event event-${statusClass} ${isNextAction ? 'event-next-action' : ''}`}
                          >
                            <div className="event-time">
                              {isNextAction 
                                ? new Date(call.nextActionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(call.callDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                            </div>
                            <div className="event-title">
                              {call.client ? call.client.name : t('common.noClient')}
                              {isNextAction && <span className="next-action-indicator"> • {t('calls.followUp')}</span>}
                            </div>
                          </Link>
                        );
                      })
                    ) : null
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color scheduled"></div>
          <span>{t('calls.scheduled')}</span>
        </div>
        <div className="legend-item">
          <div className="legend-color in_progress"></div>
          <span>{t('calls.inProgress')}</span>
        </div>
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>{t('calls.completed')}</span>
        </div>
        <div className="legend-item">
          <div className="legend-color cancelled"></div>
          <span>{t('calls.cancelled')}</span>
        </div>
      </div>
    </div>
  );
}

export default Calendar; 