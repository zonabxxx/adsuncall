import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaSignOutAlt, FaHome, FaUsers, FaPhoneAlt, FaCalendarAlt, FaHeadset, FaUser } from 'react-icons/fa';
import { logout, reset } from '../features/auth/authSlice';
import CallNotifications from './CallNotifications';
import LanguageSwitcher from './LanguageSwitcher';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <FaHeadset className="logo-icon" />
          <span>{t('app.title')}</span>
        </Link>
      </div>
      
      <div className="nav-items">
        {user ? (
          <>
            <ul>
              <li>
                <Link to="/">
                  <FaHome /> {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/clients">
                  <FaUsers /> {t('nav.clients')}
                </Link>
              </li>
              <li>
                <Link to="/calls">
                  <FaPhoneAlt /> {t('nav.calls')}
                </Link>
              </li>
              <li>
                <Link to="/calendar">
                  <FaCalendarAlt /> {t('nav.calendar')}
                </Link>
              </li>
              <li className="language-nav-item">
                <LanguageSwitcher />
              </li>
              <li>
                <CallNotifications />
              </li>
              <li className="user-info-wrapper">
                <div className="user-info">
                  <FaUser className="user-icon" />
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    {user.isAdmin && <span className="user-role">admin</span>}
                  </div>
                </div>
              </li>
              <li>
                <button className="btn" onClick={onLogout}>
                  <FaSignOutAlt /> {t('nav.logout')}
                </button>
              </li>
            </ul>
          </>
        ) : (
          <>
            <ul>
              <li>
                <Link to="/login">{t('auth.login')}</Link>
              </li>
              <li>
                <Link to="/register">{t('auth.register')}</Link>
              </li>
              <li className="language-nav-item">
                <LanguageSwitcher />
              </li>
            </ul>
          </>
        )}
      </div>
    </header>
  );
}

export default Header; 