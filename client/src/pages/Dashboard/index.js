import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { format, parseISO, subDays } from 'date-fns';
import { sk } from 'date-fns/locale';
import { FaCalendar, FaClock, FaArrowRight, FaPhone, FaCalendarCheck, FaCalendarTimes, FaSpinner, FaChartPie, FaUserAlt, FaUsers, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { getCalls } from '../../features/calls/callSlice';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import '../../styles/Dashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { calls, isLoading, error } = useSelector((state) => state.calls);
  const { user } = useSelector((state) => state.auth);
  
  const [showOnlyUserData, setShowOnlyUserData] = useState(false);
  const [filteredCalls, setFilteredCalls] = useState([]);
  
  const [stats, setStats] = useState({
    totalCalls: 0,
    scheduledCalls: 0,
    completedCalls: 0,
    cancelledCalls: 0,
    successRate: 0,
    averageDuration: 0
  });
  
  const [upcomingCalls, setUpcomingCalls] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [callTrends, setCallTrends] = useState([]);
  const [outcomeStats, setOutcomeStats] = useState({});
  
  // Fetch calls data
  useEffect(() => {
    console.log('Fetching calls data from database...');
    dispatch(getCalls());
  }, [dispatch]);
  
  // Filter calls based on user selection
  useEffect(() => {
    if (calls && calls.length > 0) {
      if (showOnlyUserData && user) {
        const userCalls = calls.filter(call => call.user && call.user._id === user._id);
        console.log(`Filtering calls for current user (${user.name}):`, userCalls.length);
        setFilteredCalls(userCalls);
      } else {
        console.log('Using all calls data:', calls.length);
        setFilteredCalls(calls);
      }
    } else {
      setFilteredCalls([]);
    }
  }, [calls, showOnlyUserData, user]);
  
  // Helper function to normalize status
  const normalizeStatus = (status) => {
    if (!status) return '';
    // Remove spaces, convert to lowercase
    return status.toLowerCase().replace(/\s+/g, '');
  };
  
  // Process call data when it changes
  useEffect(() => {
    console.log('Processing filtered calls data, count:', filteredCalls?.length);
    if (filteredCalls && filteredCalls.length > 0) {
      console.log('Filtered calls for statistics:', filteredCalls);
      
      // Calculate basic statistics - handle case insensitive status matching
      const totalCalls = filteredCalls.length;
      
      // Count "In Progress" calls as scheduled for the dashboard stats
      const scheduledCalls = filteredCalls.filter(call => {
        const status = normalizeStatus(call.status);
        // Include both "scheduled" and "inprogress" for the scheduled count
        const isScheduled = status === 'scheduled' || status === 'inprogress';
        if (isScheduled) console.log('Found scheduled/in-progress call for stats:', call);
        return isScheduled;
      }).length;
      
      const completedCalls = filteredCalls.filter(call => {
        const status = normalizeStatus(call.status);
        const isCompleted = status === 'completed';
        if (isCompleted) console.log('Found completed call:', call);
        return isCompleted;
      }).length;
      
      const cancelledCalls = filteredCalls.filter(call => {
        const status = normalizeStatus(call.status);
        const isCancelled = status === 'cancelled';
        if (isCancelled) console.log('Found cancelled call:', call);
        return isCancelled;
      }).length;
      
      const inProgressCalls = filteredCalls.filter(call => {
        const status = normalizeStatus(call.status);
        const isInProgress = status === 'inprogress';
        if (isInProgress) console.log('Found in-progress call:', call);
        return isInProgress;
      }).length;
      
      console.log('Statistics calculated:', {
        totalCalls,
        scheduledCalls,
        completedCalls,
        cancelledCalls,
        inProgressCalls
      });
      
      // Calculate success rate (completed / (completed + cancelled))
      const completedAndCancelled = completedCalls + cancelledCalls;
      const successRate = completedAndCancelled > 0 
        ? Math.round((completedCalls / completedAndCancelled) * 100) 
        : 0;
      
      // Calculate average duration for completed calls and in progress calls
      const callsWithDuration = filteredCalls.filter(call => 
        call.duration && parseInt(call.duration) > 0 &&
        (call.status && (
          call.status.toLowerCase() === 'completed' || 
          call.status.toLowerCase() === 'in progress' ||
          call.status.toLowerCase() === 'cancelled'
        ))
      );
      
      console.log('Calls with duration:', callsWithDuration);
      
      const totalDuration = callsWithDuration.reduce(
        (sum, call) => sum + (parseInt(call.duration) || 0), 
        0
      );
      
      const averageDuration = callsWithDuration.length > 0 
        ? Math.round(totalDuration / callsWithDuration.length) 
        : 0;
      
      setStats({
        totalCalls,
        scheduledCalls,
        completedCalls,
        cancelledCalls,
        inProgressCalls,
        successRate,
        averageDuration
      });
      
      // Get upcoming calls (scheduled for future or in progress)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcoming = filteredCalls
        .filter(call => {
          // Check if the call is active or scheduled (case insensitive)
          const status = normalizeStatus(call.status);
          
          // Always include in-progress calls regardless of date
          if (status === 'inprogress') {
            return true;
          }
          
          // For scheduled calls, check the date
          if (status === 'scheduled') {
            // Check if we have a valid call date
            if (!call.callDate) {
              return false;
            }
            
            // Check if the call date is in the future or today
            try {
              const callDate = new Date(call.callDate);
              const callDateOnly = new Date(
                callDate.getFullYear(),
                callDate.getMonth(), 
                callDate.getDate()
              );
              const todayOnly = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              );
              
              // Return true if call date is today or in the future
              const isUpcoming = callDateOnly >= todayOnly;
              return isUpcoming;
            } catch (error) {
              console.error('Error parsing call date:', error);
              return false;
            }
          }
          
          return false;
        })
        .sort((a, b) => new Date(a.callDate) - new Date(b.callDate))
        .slice(0, 5);
      
      setUpcomingCalls(upcoming);
      
      // Get recent activity (last 5 calls with any status)
      const recent = [...filteredCalls]
        .sort((a, b) => new Date(b.updatedAt || b.callDate) - new Date(a.updatedAt || a.callDate))
        .slice(0, 5);
      
      setRecentActivity(recent);
      
      // Calculate call trends for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const daysCalls = filteredCalls.filter(call => {
          const callDate = new Date(call.callDate);
          return callDate >= date && callDate < nextDay;
        }).length;
        
        return {
          date,
          count: daysCalls
        };
      });
      
      setCallTrends(last7Days);
      
      // Calculate outcome statistics
      const outcomeCount = {};
      filteredCalls.forEach(call => {
        if (call.outcome) {
          outcomeCount[call.outcome] = (outcomeCount[call.outcome] || 0) + 1;
        }
      });
      
      setOutcomeStats(outcomeCount);
    }
  }, [filteredCalls]);
  
  // Toggle between all data and user-specific data
  const toggleDataView = () => {
    setShowOnlyUserData(!showOnlyUserData);
  };
  
  // Format date display - exactly as it appears in the database 
  const formatDate = (dateString) => {
    try {
      // Display the date exactly as in the format "3. mája 2025"
      return format(parseISO(dateString), 'd. MMMM yyyy', { locale: sk });
    } catch (error) {
      return dateString;
    }
  };
  
  // Format time display
  const formatTime = (dateString) => {
    try {
      return format(parseISO(dateString), 'HH:mm', { locale: sk });
    } catch (error) {
      return '';
    }
  };
  
  // Format day display for trends chart
  const formatDay = (date) => {
    try {
      return format(date, 'E', { locale: i18n.language === 'sk' ? sk : undefined });
    } catch (error) {
      return '';
    }
  };
  
  // Get status class
  const getStatusClass = (status) => {
    if (!status) return 'status-default';
    
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'scheduled':
        return 'status-scheduled';
      case 'inprogress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };
  
  // Get status text
  const getStatusText = (status) => {
    if (!status) return '';
    
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'scheduled':
        return t('calls.status.scheduled');
      case 'inprogress':
        return t('calls.status.inProgress');
      case 'completed':
        return t('calls.status.completed');
      case 'cancelled':
        return t('calls.status.cancelled');
      default:
        return status;
    }
  };
  
  // Get outcome text
  const getOutcomeText = (outcome) => {
    if (!outcome) return '';
    
    // Convert "Success" to "successful" for translation key
    if (outcome.toLowerCase() === 'success') {
      return t('outcome.successful');
    }
    
    const key = `outcome.${outcome.toLowerCase().replace(/ /g, '_')}`;
    return t(key);
  };
  
  // Prepare data for status chart
  const statusChartData = {
    labels: [
      t('calls.status.scheduled'),
      t('calls.status.inProgress'),
      t('calls.status.completed'),
      t('calls.status.cancelled')
    ],
    datasets: [
      {
        data: [
          stats.scheduledCalls,
          stats.inProgressCalls || 0,
          stats.completedCalls,
          stats.cancelledCalls
        ],
        backgroundColor: [
          '#ffc107', // yellow for scheduled
          '#17a2b8', // blue for in progress
          '#28a745', // green for completed
          '#dc3545'  // red for cancelled
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for outcome chart
  const outcomeChartData = {
    labels: Object.keys(outcomeStats).map(outcome => getOutcomeText(outcome)),
    datasets: [
      {
        data: Object.values(outcomeStats),
        backgroundColor: [
          '#4caf50', // green
          '#2196f3', // blue
          '#ff9800', // orange
          '#9c27b0', // purple
          '#e91e63', // pink
          '#607d8b'  // blue-grey
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for call trends chart
  const trendChartData = {
    labels: callTrends.map(day => formatDay(day.date)),
    datasets: [
      {
        label: t('dashboard.dailyCalls'),
        data: callTrends.map(day => day.count),
        backgroundColor: '#4285F4',
        borderColor: '#4285F4',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };
  
  // Chart options for trend chart
  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  // Chart options for pie charts
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 10,
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('dashboard.title')}</h1>
        <div className="data-toggle">
          <button 
            className={`toggle-button ${showOnlyUserData ? 'active' : ''}`} 
            onClick={toggleDataView}
            title={showOnlyUserData ? t('dashboard.showAllData') : t('dashboard.showMyData')}
          >
            {showOnlyUserData ? (
              <>
                <FaUserAlt className="toggle-icon" /> {t('dashboard.myStats')}
              </>
            ) : (
              <>
                <FaUsers className="toggle-icon" /> {t('dashboard.allStats')}
              </>
            )}
            {showOnlyUserData ? <FaToggleOn className="toggle-indicator" /> : <FaToggleOff className="toggle-indicator" />}
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FaPhone />
          </div>
          <div className="stat-title">{t('dashboard.totalCalls')}</div>
          <div className="stat-value">{stats.totalCalls}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon yellow">
            <FaCalendar />
          </div>
          <div className="stat-title">{t('dashboard.scheduledCalls')}</div>
          <div className="stat-value">{stats.scheduledCalls}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green">
            <FaCalendarCheck />
          </div>
          <div className="stat-title">{t('dashboard.completedCalls')}</div>
          <div className="stat-value">{stats.completedCalls}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon red">
            <FaCalendarTimes />
          </div>
          <div className="stat-title">{t('dashboard.cancelledCalls')}</div>
          <div className="stat-value">{stats.cancelledCalls}</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="dashboard-stats performance-metrics">
        <div className="stat-card extended">
          <div className="stat-icon purple">
            <FaChartPie />
          </div>
          <div className="stat-title">{t('dashboard.successRate')}</div>
          <div className="stat-value with-unit">{stats.successRate}%</div>
          <div className="stat-caption">{t('dashboard.completionRateDesc')}</div>
        </div>
        
        <div className="stat-card extended">
          <div className="stat-icon teal">
            <FaClock />
          </div>
          <div className="stat-title">{t('dashboard.avgDuration')}</div>
          <div className="stat-value with-unit">{stats.averageDuration} {t('calls.duration_minutes')}</div>
          <div className="stat-caption">{t('dashboard.avgDurationDesc')}</div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid-container">
        {/* Call Trend Chart */}
        <div className="col-8">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">{t('dashboard.callActivity')}</h2>
            </div>
            <div className="card-body chart-container">
              {isLoading ? (
                <div className="loading-state">
                  <FaSpinner className="fa-spin" /> {t('common.loading')}
                </div>
              ) : error ? (
                <div className="error-state">
                  {t('common.error')}
                </div>
              ) : (
                <div className="trend-chart">
                  <Bar data={trendChartData} options={trendChartOptions} height={220} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Status Distribution Pie Chart */}
        <div className="col-4">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">{t('dashboard.callStatuses')}</h2>
            </div>
            <div className="card-body chart-container">
              {isLoading ? (
                <div className="loading-state">
                  <FaSpinner className="fa-spin" /> {t('common.loading')}
                </div>
              ) : error ? (
                <div className="error-state">
                  {t('common.error')}
                </div>
              ) : (
                <div className="pie-chart">
                  <Pie data={statusChartData} options={pieChartOptions} height={180} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second row of charts and lists */}
      <div className="grid-container">
        {/* Outcome Distribution */}
        <div className="col-4">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">{t('dashboard.callOutcomes')}</h2>
            </div>
            <div className="card-body chart-container">
              {isLoading ? (
                <div className="loading-state">
                  <FaSpinner className="fa-spin" /> {t('common.loading')}
                </div>
              ) : error ? (
                <div className="error-state">
                  {t('common.error')}
                </div>
              ) : Object.keys(outcomeStats).length > 0 ? (
                <div className="pie-chart">
                  <Pie data={outcomeChartData} options={pieChartOptions} height={180} />
                </div>
              ) : (
                <div className="empty-state">
                  {t('dashboard.noOutcomeData')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Upcoming Calls */}
        <div className="col-8">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">{t('dashboard.upcomingCalls')}</h2>
              <Link to="/calls" className="card-action">
                {t('dashboard.viewAll')} <FaArrowRight />
              </Link>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="loading-state">
                  <FaSpinner className="fa-spin" /> {t('common.loading')}
                </div>
              ) : error ? (
                <div className="error-state">
                  {t('common.error')}
                </div>
              ) : upcomingCalls.length > 0 ? (
                <div className="call-list">
                  {upcomingCalls.map((call) => (
                    <Link to={`/calls/${call._id}`} key={call._id} className="call-item">
                      <div className="call-date-container">
                        <div className="call-date-icon">
                          <FaCalendar />
                        </div>
                        <div className="call-date-time">
                          <div className="call-date-primary">
                            {call.nextActionDate ? formatDate(call.nextActionDate) : formatDate(call.callDate)}
                          </div>
                          <div className="call-time">
                            {call.nextActionDate ? formatTime(call.nextActionDate) : formatTime(call.callDate)} h
                          </div>
                        </div>
                      </div>
                      <div className="call-client">
                        {call.client ? call.client.name : t('calls.unknownClient')}
                      </div>
                      <div className={`call-status ${getStatusClass(call.status)}`}>
                        {getStatusText(call.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  {t('dashboard.noUpcomingCalls')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        
      {/* Recent Activity */}
      <div className="grid-container">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">{t('dashboard.recentActivity')}</h2>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="loading-state">
                  <FaSpinner className="fa-spin" /> {t('common.loading')}
                </div>
              ) : error ? (
                <div className="error-state">
                  {t('common.error')}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="activity-list-extended">
                  {recentActivity.map((activity) => (
                    <Link to={`/calls/${activity._id}`} key={activity._id} className="activity-item">
                      <div className="activity-date">
                        {formatDate(activity.updatedAt || activity.callDate)}
                      </div>
                      <div className="activity-details">
                        {activity.client ? activity.client.name : t('calls.unknownClient')}
                      </div>
                      <div className="activity-status">
                        {getStatusText(activity.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  {t('dashboard.noRecentActivity')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;