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
        <h1>Vytvoriť hovor</h1>
        <p>Vytvorenie nového hovoru</p>
      </section>

      <section className="form">
        <form onSubmit={onSubmit} className="call-form-layout">
          <div className="form-group full-width">
            <label htmlFor="client">Klient</label>
            <select
              className="form-control"
              id="client"
              name="client"
              value={client}
              onChange={onChange}
              required
            >
              <option value="">Vyberte klienta</option>
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
            <label htmlFor="callDateTime">Dátum a čas hovoru</label>
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
            <label htmlFor="status">Stav</label>
            <select
              className="form-control"
              id="status"
              name="status"
              value={status}
              onChange={onChange}
              required
            >
              <option value="scheduled">Naplánovaný</option>
              <option value="in_progress">Prebieha</option>
              <option value="completed">Dokončený</option>
              <option value="cancelled">Zrušený</option>
              <option value="failed">Neúspešný</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="duration">Trvanie</label>
            <input
              type="number"
              className="form-control"
              id="duration"
              name="duration"
              value={duration}
              onChange={onChange}
              placeholder="Zadajte trvanie hovoru"
            />
          </div>
          <div className="form-group">
            <label htmlFor="outcome">Výsledok</label>
            <select
              className="form-control"
              id="outcome"
              name="outcome"
              value={outcome}
              onChange={onChange}
            >
              <option value="">Vyberte výsledok</option>
              <option value="success">Úspešný</option>
              <option value="need_followup">Potrebné následné konanie</option>
              <option value="no_answer">Bez odpovede</option>
              <option value="not_interested">Nezáujem</option>
              <option value="other">Iné</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="notes">Poznámky</label>
            <textarea
              className="form-control"
              id="notes"
              name="notes"
              value={notes}
              onChange={onChange}
              placeholder="Zadajte poznámky k hovoru"
            />
          </div>
          <div className="form-group">
            <label htmlFor="nextAction">Ďalšia akcia</label>
            <input
              type="text"
              className="form-control"
              id="nextAction"
              name="nextAction"
              value={nextAction}
              onChange={onChange}
              placeholder="Zadajte ďalšiu akciu"
            />
          </div>
          <div className="form-group">
            <label htmlFor="nextActionDateTime">Dátum a čas ďalšej akcie</label>
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
            <button className="btn">Odoslať</button>
          </div>
        </form>
      </section>
    </>
  );
}

export default NewCall; 