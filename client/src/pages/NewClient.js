import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { createClient } from '../features/clients/clientSlice';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton';

function NewClient() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    company: '',
    web: '',
    mail: '',
    notes: '',
    postal_mail: '',
  });

  const { name, address, phone, company, web, mail, notes, postal_mail } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.clients);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    dispatch(createClient(formData))
      .unwrap()
      .then(() => {
        toast.success('Client created successfully');
        navigate('/clients');
      })
      .catch(toast.error);
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <BackButton />

      <section className="heading">
        <h1>{t('clients.create')}</h1>
        <p>{t('clients.create_subtitle')}</p>
      </section>

      <section className="form">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('clients.name')}</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder={t('clients.name_placeholder')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">{t('clients.email')}</label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address"
              value={address}
              onChange={onChange}
              placeholder={t('clients.email_placeholder')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">{t('clients.phone')}</label>
            <input
              type="text"
              className="form-control"
              id="phone"
              name="phone"
              value={phone}
              onChange={onChange}
              placeholder={t('clients.phone_placeholder')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="company">{t('clients.company_optional')}</label>
            <input
              type="text"
              className="form-control"
              id="company"
              name="company"
              value={company}
              onChange={onChange}
              placeholder={t('clients.company_placeholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="web">{t('clients.web_optional')}</label>
            <input
              type="text"
              className="form-control"
              id="web"
              name="web"
              value={web}
              onChange={onChange}
              placeholder={t('clients.web_placeholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="mail">{t('clients.mail_optional')}</label>
            <input
              type="text"
              className="form-control"
              id="mail"
              name="mail"
              value={mail}
              onChange={onChange}
              placeholder={t('clients.mail_placeholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="postal_mail">{t('clients.postal_mail_optional')}</label>
            <input
              type="email"
              className="form-control"
              id="postal_mail"
              name="postal_mail"
              value={postal_mail}
              onChange={onChange}
              placeholder={t('clients.postal_mail_placeholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">{t('clients.notes_optional')}</label>
            <textarea
              className="form-control"
              id="notes"
              name="notes"
              value={notes}
              onChange={onChange}
              placeholder={t('clients.notes_placeholder')}
            />
          </div>
          <div className="form-group">
            <button className="btn btn-block">{t('auth.submit')}</button>
          </div>
        </form>
      </section>
    </>
  );
}

export default NewClient; 