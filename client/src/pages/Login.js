import { useState, useEffect } from 'react';
import { FaSignInAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { login, reset } from '../features/auth/authSlice';
import Spinner from '../components/Spinner';

function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get the redirect path from location state or default to "/"
  const redirectPath = location.state?.from || '/';

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    // Redirect when logged in
    if (isSuccess || user) {
      toast.success('Prihlásenie úspešné!');
      
      // Use redirectPath to navigate back to the source page if specified
      navigate(redirectPath);
      
      // Special case for redirecting back to import page
      if (redirectPath === '/import') {
        toast.info('Teraz môžete spustiť import klientov');
      }
    }

    dispatch(reset());
  }, [isError, isSuccess, user, message, navigate, dispatch, redirectPath]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <section className='heading'>
        <h1>
          <FaSignInAlt /> {t('auth.login')}
        </h1>
        <p>{t('auth.login_subtitle')}</p>
        {redirectPath !== '/' && (
          <div className="redirect-message">
            <p>Po prihlásení budete presmerovaní späť na pôvodnú stránku</p>
          </div>
        )}
      </section>

      <section className='form'>
        <form onSubmit={onSubmit}>
          <div className='form-group'>
            <input
              type='email'
              className='form-control'
              id='email'
              name='email'
              value={email}
              onChange={onChange}
              placeholder={t('auth.email_placeholder')}
              required
            />
          </div>
          <div className='form-group'>
            <input
              type='password'
              className='form-control'
              id='password'
              name='password'
              value={password}
              onChange={onChange}
              placeholder={t('auth.password_placeholder')}
              required
            />
          </div>
          <div className='form-group'>
            <button className='btn btn-block'>{t('auth.submit')}</button>
          </div>
        </form>
      </section>
    </>
  );
}

export default Login; 