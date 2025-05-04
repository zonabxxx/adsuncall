import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaPhone, FaClipboardList, FaCalendarAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Spinner from '../components/Spinner';
import config from '../config';

function Home() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(config.getApiUrl('/api/clients/stats'), {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  if (loading) return <Spinner />;

  return (
    <>
      <section className="heading">
        <h1>{t('app.title')}</h1>
        <p>{t('app.subtitle')}</p>
      </section>

      {stats && (
        <section className="stats-container">
          <h2>{t('app.statistics')}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{t('app.total_clients')}</h3>
              <div className="stat-value">{stats.userClients}</div>
              <div className="stat-detail">{t('app.in_system')}: {stats.totalClients}</div>
            </div>
            <div className="stat-card">
              <h3>{t('app.unique_companies')}</h3>
              <div className="stat-value">{stats.uniqueCompaniesCount}</div>
              <div className="stat-detail">{t('app.imported_companies')}</div>
            </div>
            <div className="stat-card">
              <h3>{t('app.field_coverage')}</h3>
              <ul className="coverage-list">
                <li>{t('clients.email')}: {stats.fieldCoverage.withEmail}</li>
                <li>{t('clients.phone')}: {stats.fieldCoverage.withPhone}</li>
                <li>{t('clients.mail')}: {stats.fieldCoverage.withCategory}</li>
                <li>{t('clients.postal_mail')}: {stats.fieldCoverage.withPostalMail}</li>
              </ul>
            </div>
          </div>

          {/* User distribution */}
          {stats.userDistribution && stats.userDistribution.length > 0 && (
            <div className="user-distribution">
              <h3>{t('app.user_distribution')}</h3>
              <table className="distribution-table">
                <thead>
                  <tr>
                    <th>Používateľ</th>
                    <th>Email</th>
                    <th>Počet klientov</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.userDistribution.map(user => (
                    <tr key={user.userId}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td className="client-count">{user.clientCount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2"><strong>Celkom</strong></td>
                    <td className="client-count"><strong>{stats.totalClients}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="boxes">
        <div>
          <Link to="/clients">
            <FaUser size={50} />
            <h2>{t('buttons.view_clients')}</h2>
          </Link>
        </div>
        <div>
          <Link to="/calls">
            <FaPhone size={50} />
            <h2>{t('buttons.view_calls')}</h2>
          </Link>
        </div>
        <div>
          <Link to="/calendar">
            <FaCalendarAlt size={50} />
            <h2>{t('buttons.view_calendar')}</h2>
          </Link>
        </div>
        <div>
          <Link to="/import">
            <FaClipboardList size={50} />
            <h2>{t('nav.import')}</h2>
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home; 