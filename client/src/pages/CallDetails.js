import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaCalendarAlt, FaClock, FaUser, FaPhoneAlt, FaClipboardList, FaListAlt, FaTasks, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getCall, updateCall, deleteCall, reset } from '../features/calls/callSlice';
import { updateClient } from '../features/clients/clientSlice';
import Spinner from '../components/Spinner';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import Modal from '../components/Modal';

function CallDetails() {
  const { t } = useTranslation();
  const { callId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [callData, setCallData] = useState({
    status: '',
    duration: '',
    notes: '',
    outcome: '',
    nextAction: '',
    callDateTime: '',
    nextActionDateTime: '',
  });
  const [previousOutcome, setPreviousOutcome] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);

  const { call, isLoading, isError, message } = useSelector(
    (state) => state.calls
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    dispatch(getCall(callId));

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isError, message, callId]);

  useEffect(() => {
    if (call && Object.keys(call).length > 0) {
      // Format the dates for the datetime-local input fields (YYYY-MM-DDThh:mm)
      let callDateTime = '';
      let nextActionDateTime = '';

      if (call.callDate) {
        const date = new Date(call.callDate);
        callDateTime = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
      }

      if (call.nextActionDate) {
        const date = new Date(call.nextActionDate);
        nextActionDateTime = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
      }

      setCallData({
        status: call.status || '',
        duration: call.duration || '',
        notes: call.notes || '',
        outcome: call.outcome || '',
        nextAction: call.nextAction || '',
        callDateTime,
        nextActionDateTime
      });
      
      // Pri načítaní uložíme aktuálny výsledok pre porovnanie
      setPreviousOutcome(call.outcome || '');
    }
  }, [call]);

  const onChange = (e) => {
    const { name, value } = e.target;
    
    setCallData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Ak sa zmení výsledok na "úspešný", pripravíme sa na zobrazenie modálneho okna
    if (name === 'outcome' && value === 'success' && previousOutcome !== 'success' && call?.client && !call.client.isClient) {
      // Toto nastavenie necháme pre onSubmit, aby sa to zobrazilo až po uložení
      console.log('Outcome changed to success for non-client company');
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Format data for the backend
    const updatedCallData = {
      ...callData,
      callDate: callData.callDateTime, // The API still expects callDate
      nextActionDate: callData.nextActionDateTime // The API still expects nextActionDate
    };
    
    // Remove the new fields to avoid confusion on the backend
    delete updatedCallData.callDateTime;
    delete updatedCallData.nextActionDateTime;
    
    dispatch(updateCall({
      callId,
      callData: updatedCallData,
    }))
      .unwrap()
      .then(() => {
        toast.success(t('calls.updated_success'));
        
        // Ak sa zmenil výsledok na "úspešný" a firma nie je klientom, zobrazíme modálne okno
        if (callData.outcome === 'success' && previousOutcome !== 'success' && call?.client && !call.client.isClient) {
          setShowClientModal(true);
        } else {
          setIsEditing(false);
        }
        
        // Aktualizujeme predchádzajúci výsledok
        setPreviousOutcome(callData.outcome);
      })
      .catch((error) => {
        toast.error(t('calls.error_update'));
      });
  };

  const handleAddToClients = () => {
    if (!call || !call.client || !call.client._id) {
      toast.error(t('errors.client_not_found'));
      setShowClientModal(false);
      setIsEditing(false);
      return;
    }
    
    dispatch(updateClient({
      clientId: call.client._id,
      clientData: { isClient: true }
    }))
      .unwrap()
      .then(() => {
        toast.success(t('clients.added_to_clients') || 'Firma bola pridaná medzi klientov');
        setShowClientModal(false);
        setIsEditing(false);
      })
      .catch((error) => {
        toast.error(t('clients.error_update') || 'Chyba pri aktualizácii klienta');
        setShowClientModal(false);
        setIsEditing(false);
      });
  };
  
  // Funkcia na zatvorenie modálneho okna bez pridania medzi klientov
  const handleCloseModal = () => {
    setShowClientModal(false);
    setIsEditing(false);
  };

  const onDelete = () => {
    if (window.confirm(t('calls.delete_confirm'))) {
      dispatch(deleteCall(callId));
      toast.success(t('calls.deleted_success'));
      navigate('/calls');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  // Helper function to format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to normalize status
  const normalizeStatus = (status) => {
    if (!status) return '';
    // Remove spaces, convert to lowercase
    return status.toLowerCase().replace(/\s+/g, '');
  };

  // Helper function to get the translated status text
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

  // Helper function to get the translated outcome text
  const getOutcomeText = (outcome) => {
    if (!outcome) return '';
    
    // Convert "Success" to "successful" for translation key
    if (outcome.toLowerCase() === 'success') {
      return t('outcome.successful');
    }
    
    const key = `outcome.${outcome.toLowerCase().replace(/\s+/g, '_')}`;
    return t(key);
  };

  return (
    <div className="call-details-container">
      <BackButton />

      <div className="page-header">
        <h1 className="page-title">{t('calls.details')}</h1>
        {!isEditing && (
          <div className="actions-container">
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <FaEdit /> {t('common.edit')}
            </button>
            <button className="btn btn-danger" onClick={onDelete}>
              <FaTrash /> {t('common.delete')}
            </button>
          </div>
        )}
      </div>

      {call && call.client && (
        <div className="card client-info-card">
          <div className="card-header">
            <h2 className="card-title"><FaUser /> {t('calls.client_info')}</h2>
            <Link to={`/clients/${call.client._id}`} className="btn btn-sm">
              {t('calls.view_client')}
            </Link>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t('clients.name')}:</span>
                <span className="info-value">{call.client.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('clients.email')}:</span>
                <span className="info-value">{call.client.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('clients.phone')}:</span>
                <span className="info-value">{call.client.phone}</span>
              </div>
              {call.client.company && (
                <div className="info-item">
                  <span className="info-label">{t('clients.company')}:</span>
                  <span className="info-value">{call.client.company}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><FaPhoneAlt /> {t('calls.edit')}</h2>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit} className="call-form-layout">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="callDateTime">
                    <FaCalendarAlt /> {t('calls.call_date_time')}
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="callDateTime"
                    name="callDateTime"
                    value={callData.callDateTime}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">
                    <FaClipboardList /> {t('calls.status')}
                  </label>
                  <select
                    className="form-control"
                    id="status"
                    name="status"
                    value={callData.status}
                    onChange={onChange}
                    required
                  >
                    <option value="">{t('calls.select_status')}</option>
                    <option value="Scheduled">{t('status.scheduled')}</option>
                    <option value="In Progress">{t('status.in_progress')}</option>
                    <option value="Completed">{t('status.completed')}</option>
                    <option value="Cancelled">{t('status.cancelled')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="duration">
                    <FaClock /> {t('calls.duration')}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="duration"
                    name="duration"
                    value={callData.duration}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="outcome">
                    <FaListAlt /> {t('calls.outcome')}
                  </label>
                  <select
                    className="form-control"
                    id="outcome"
                    name="outcome"
                    value={callData.outcome}
                    onChange={onChange}
                  >
                    <option value="">{t('calls.select_outcome')}</option>
                    <option value="Success">{t('outcome.success')}</option>
                    <option value="Need Follow-up">{t('outcome.need_followup')}</option>
                    <option value="No Answer">{t('outcome.no_answer')}</option>
                    <option value="Not Interested">{t('outcome.not_interested')}</option>
                    <option value="Other">{t('outcome.other')}</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group notes-field">
                <label htmlFor="notes">
                  <FaClipboardList /> {t('calls.notes')}
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  value={callData.notes}
                  onChange={onChange}
                  rows="4"
                />
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nextAction">
                    <FaTasks /> {t('calls.next_action')}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nextAction"
                    name="nextAction"
                    value={callData.nextAction}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nextActionDateTime">
                    <FaCalendarAlt /> {t('calls.next_action_date_time')}
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="nextActionDateTime"
                    name="nextActionDateTime"
                    value={callData.nextActionDateTime}
                    onChange={onChange}
                  />
                </div>
              </div>
              
              <div className="form-buttons">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  <FaTimes /> {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-success">
                  <FaSave /> {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card call-info-card">
          <div className="card-header">
            <h2 className="card-title"><FaPhoneAlt /> {t('calls.call_info')}</h2>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label"><FaCalendarAlt /> {t('calls.date')}:</span>
                <span className="info-value">{formatDate(call.callDate)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label"><FaClipboardList /> {t('status.title')}:</span>
                <span className={`status-badge status-${call.status && call.status.toLowerCase().replace(/\s+/g, '_')}`}>
                  {getStatusText(call.status)}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label"><FaUser /> {t('calls.made_by')}:</span>
                <span className="info-value">{call.user && call.user.name}</span>
              </div>
              
              {call.duration > 0 && (
                <div className="info-item">
                  <span className="info-label"><FaClock /> {t('calls.duration')}:</span>
                  <span className="info-value">{call.duration} {t('calls.duration_minutes')}</span>
                </div>
              )}
              
              {call.outcome && (
                <div className="info-item">
                  <span className="info-label"><FaListAlt /> {t('calls.outcome')}:</span>
                  <span className="info-value">{getOutcomeText(call.outcome)}</span>
                </div>
              )}
            </div>
            
            {call.notes && (
              <div className="notes-section">
                <h3><FaClipboardList /> {t('calls.notes')}</h3>
                <div className="notes-content">{call.notes}</div>
              </div>
            )}
            
            <div className="follow-up">
              <h3 className="section-title"><FaTasks /> {t('calls.next_action')}</h3>
              {call.nextAction ? (
                <>
                  <p>{call.nextAction}</p>
                  {call.nextActionDate && (
                    <p className="date-info">
                      <FaCalendarAlt /> {formatDate(call.nextActionDate)}
                    </p>
                  )}
                </>
              ) : (
                <p className="no-data">{t('calls.noNotes')}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modálne okno pre otázku o pridaní medzi klientov */}
      {showClientModal && (
        <Modal
          show={showClientModal}
          onClose={handleCloseModal}
          title={t('clients.add_to_clients_title') || "Pridanie medzi klientov"}
        >
          <p>{t('clients.successful_call_add_client') || "Hovor bol úspešný. Chcete pridať túto firmu medzi vašich klientov?"}</p>
          <div className="modal-actions">
            <button className="btn btn-success" onClick={handleAddToClients}>
              {t('common.yes') || "Áno"}
            </button>
            <button className="btn btn-secondary" onClick={handleCloseModal}>
              {t('common.no') || "Nie"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CallDetails; 