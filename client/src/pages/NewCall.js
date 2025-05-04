import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { createCall } from '../features/calls/callSlice';
import { getClients } from '../features/clients/clientSlice';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton';

function NewCall() {
  const { t } = useTranslation();
  const location = useLocation();
  const preselectedClient = location.state?.client;

  const [formData, setFormData] = useState({
    client: '',
    callDateTime: new Date().toISOString().slice(0, -8), // Format: YYYY-MM-DDThh:mm
    status: 'scheduled',
    duration: '',
    notes: '',
    outcome: '',
    nextAction: '',
    nextActionDateTime: '',
  });

  const { client, callDateTime, status, duration, notes, outcome, nextAction, nextActionDateTime } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { clients, isLoading: isClientsLoading } = useSelector((state) => state.clients);
  const { isLoading } = useSelector((state) => state.calls);

  useEffect(() => {
    dispatch(getClients());
  }, [dispatch]);

  // Effect to set preselected client when location.state changes
  useEffect(() => {
    if (preselectedClient && preselectedClient._id) {
      console.log('Preselecting client:', preselectedClient._id, preselectedClient.name);
      setFormData(prevState => ({
        ...prevState,
        client: preselectedClient._id
      }));
      
      // Verify client exists in the loaded clients list
      setTimeout(() => {
        const clientExists = clients.some(c => c._id === preselectedClient._id);
        console.log('Client exists in loaded clients list:', clientExists);
        
        if (!clientExists) {
          console.warn('Preselected client not found in loaded clients list. This could cause issues.');
        }
      }, 500); // Short delay to ensure clients are loaded
    } else {
      console.log('No preselected client available or missing _id');
    }
  }, [preselectedClient, clients]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    console.log('Form submission data:', formData);

    // Format data for the backend
    const callData = {
      ...formData,
      callDate: callDateTime, // The API still expects callDate
      nextActionDate: nextActionDateTime // The API still expects nextActionDate
    };

    // Remove the new fields to avoid confusion on the backend
    delete callData.callDateTime;
    delete callData.nextActionDateTime;

    console.log('Data sending to API:', callData);

    dispatch(createCall(callData))
      .unwrap()
      .then((response) => {
        console.log('Call created successfully:', response);
        toast.success(t('calls.success_create'));
        navigate('/calls');
      })
      .catch((error) => {
        console.error('Error creating call:', error);
        // Provide more specific error messages based on validation issues
        if (error && error.includes('validation failed')) {
          if (error.includes('status')) {
            toast.error(`${t('calls.error_create')}: ${t('calls.status')} ${t('calls.validation_error')}`);
          } else if (error.includes('outcome')) {
            toast.error(`${t('calls.error_create')}: ${t('calls.outcome')} ${t('calls.validation_error')}`);
          } else {
            toast.error(`${t('calls.error_create')}: ${t('calls.validation_error')}`);
          }
        } else {
          toast.error(error || t('calls.error_create'));
        }
      });
  };

  if (isLoading || isClientsLoading) {
    return <Spinner />;
  }

  return (
    <>
      <BackButton />

      <section className="heading">
        <h1>{t('calls.create')}</h1>
        <p>{t('calls.create_subtitle')}</p>
      </section>

      <section className="form">
        <form onSubmit={onSubmit} className="call-form-layout">
          <div className="form-group full-width">
            <label htmlFor="client">{t('calls.client')}</label>
            <select
              className="form-control"
              id="client"
              name="client"
              value={client}
              onChange={onChange}
              required
            >
              <option value="">{t('calls.select_client')}</option>
              {clients.map((c) => (
                <option 
                  key={c._id} 
                  value={c._id} 
                  className={!c.isActive ? 'inactive-client-option' : ''}
                >
                  {c.name} {!c.isActive ? `(${t('clients.inactive')})` : ''}
                </option>
              ))}
            </select>
            {client && !clients.some(c => c._id === client) && (
              <div className="client-warning">
                <strong>{t('clients.warning')}:</strong> {t('clients.client_not_found')}
              </div>
            )}
            {client && clients.some(c => c._id === client && !c.isActive) && (
              <div className="client-warning" style={{backgroundColor: 'rgba(255, 193, 7, 0.1)', borderColor: '#ffc107', color: '#856404'}}>
                <strong>{t('clients.warning')}:</strong> {t('clients.client_inactive_notice')}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="callDateTime">{t('calls.call_date_time')}</label>
            <input
              type="datetime-local"
              className="form-control"
              id="callDateTime"
              name="callDateTime"
              value={callDateTime}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">{t('calls.status')}</label>
            <select
              className="form-control"
              id="status"
              name="status"
              value={status}
              onChange={onChange}
              required
            >
              <option value="scheduled">{t('status.scheduled')}</option>
              <option value="in_progress">{t('status.in_progress')}</option>
              <option value="completed">{t('status.completed')}</option>
              <option value="cancelled">{t('status.cancelled')}</option>
              <option value="failed">{t('status.failed')}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="duration">{t('calls.duration')}</label>
            <input
              type="number"
              className="form-control"
              id="duration"
              name="duration"
              value={duration}
              onChange={onChange}
              placeholder={t('calls.duration_placeholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="outcome">{t('calls.outcome')}</label>
            <select
              className="form-control"
              id="outcome"
              name="outcome"
              value={outcome}
              onChange={onChange}
            >
              <option value="">{t('calls.select_outcome')}</option>
              <option value="success">{t('outcome.success')}</option>
              <option value="need_followup">{t('outcome.need_followup')}</option>
              <option value="no_answer">{t('outcome.no_answer')}</option>
              <option value="not_interested">{t('outcome.not_interested')}</option>
              <option value="other">{t('outcome.other')}</option>
            </select>
          </div>
          <div className="form-group notes-field">
            <label htmlFor="notes">{t('calls.notes')}</label>
            <textarea
              className="form-control"
              id="notes"
              name="notes"
              value={notes}
              onChange={onChange}
              placeholder={t('calls.notes_placeholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="nextAction">{t('calls.next_action')}</label>
            <input
              type="text"
              className="form-control"
              id="nextAction"
              name="nextAction"
              value={nextAction}
              onChange={onChange}
              placeholder={t('calls.next_action_placeholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="nextActionDateTime">{t('calls.next_action_date_time')}</label>
            <input
              type="datetime-local"
              className="form-control"
              id="nextActionDateTime"
              name="nextActionDateTime"
              value={nextActionDateTime}
              onChange={onChange}
            />
          </div>
          <div className="form-group submit-button">
            <button className="btn">{t('auth.submit')}</button>
          </div>
        </form>
      </section>
    </>
  );
}

export default NewCall; 