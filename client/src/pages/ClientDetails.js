import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPhone, FaToggleOn, FaToggleOff, FaUser, FaBuilding, FaEnvelope, FaGlobe, FaList, FaInfoCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getClient, updateClient, deleteClient, reset, toggleClientStatus } from '../features/clients/clientSlice';
import { getClientCalls } from '../features/calls/callSlice';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton';

function ClientDetails() {
  const { t } = useTranslation();
  const { clientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [clientData, setClientData] = useState({
    name: '',
    address: '',
    phone: '',
    company: '',
    web: '',
    mail: '',
    notes: '',
  });

  const { client, isLoading, isError, message } = useSelector(
    (state) => state.clients
  );

  const { calls, isLoading: callsLoading } = useSelector(
    (state) => state.calls
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    dispatch(getClient(clientId));
    dispatch(getClientCalls(clientId));

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isError, message, clientId]);

  useEffect(() => {
    if (client && Object.keys(client).length > 0) {
      setClientData({
        name: client.name || '',
        address: client.address || '',
        phone: client.phone || '',
        company: client.company || '',
        web: client.web || '',
        mail: client.mail || '',
        notes: client.notes || '',
      });
    }
  }, [client]);

  const onChange = (e) => {
    setClientData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(updateClient({
      clientId,
      clientData,
    }));
    setIsEditing(false);
    toast.success('Client updated successfully');
  };

  const onDelete = () => {
    if (window.confirm(t('clients.delete_confirm'))) {
      dispatch(deleteClient(clientId))
        .unwrap()
        .then(() => {
          toast.success(t('clients.deleted'));
          navigate('/clients');
        })
        .catch((error) => {
          toast.error(t('clients.error_delete'));
        });
    }
  };

  const onToggleStatus = () => {
    dispatch(toggleClientStatus(clientId))
      .unwrap()
      .then(() => {
        toast.success(t('clients.status_updated'));
      })
      .catch((error) => {
        toast.error(t('clients.error_update'));
      });
  };

  if (isLoading || callsLoading) {
    return <Spinner />;
  }

  return (
    <div className="call-details-container">
      <BackButton />

      <div className="page-header">
        <h1 className="page-title">{client.name}</h1>
        <div className="actions-container">
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <FaEdit /> {t('clients.edit')}
          </button>
          <button className="btn btn-danger" onClick={onDelete}>
            <FaTrash /> {t('clients.delete')}
          </button>
          <button 
            className={`btn ${client.isActive ? 'btn-warning' : 'btn-success'}`} 
            onClick={onToggleStatus}
          >
            {client.isActive ? <FaToggleOff /> : <FaToggleOn />} {client.isActive ? t('clients.deactivate') : t('clients.activate')}
          </button>
          <Link 
            to={`/calls/new?client=${client._id}`}
            className="btn" 
            state={{ 
              client: { 
                _id: client._id, 
                name: client.name, 
                email: client.email, 
                phone: client.phone 
              } 
            }}
          >
            <FaPhone /> {t('clients.new_call')}
          </Link>
        </div>
      </div>

      {isEditing ? (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><FaUser /> {t('clients.edit')}</h2>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit} className="call-form-layout">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">{t('clients.name')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={clientData.name}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address">{t('clients.address')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    value={clientData.address}
                    onChange={onChange}
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
                    value={clientData.phone}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company">{t('clients.company')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="company"
                    name="company"
                    value={clientData.company}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="web">{t('clients.web')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="web"
                    name="web"
                    value={clientData.web}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mail">{t('clients.mail')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="mail"
                    name="mail"
                    value={clientData.mail}
                    onChange={onChange}
                  />
                </div>
              </div>
              
              <div className="form-group notes-field">
                <label htmlFor="notes">{t('clients.notes')}</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  value={clientData.notes}
                  onChange={onChange}
                  rows="4"
                />
              </div>
              
              <div className="form-group form-actions">
                <button type="submit" className="btn btn-primary">
                  {t('clients.save')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  {t('clients.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><FaUser /> {t('clients.contact_info')}</h2>
            {client.isActive === false && (
              <span className="status-badge status-cancelled">
                {t('clients.inactive')}
              </span>
            )}
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label"><FaEnvelope /> {t('clients.email')}:</span>
                <span className="info-value">{client.address || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label"><FaPhone /> {t('clients.phone')}:</span>
                <span className="info-value">{client.phone || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label"><FaBuilding /> {t('clients.company')}:</span>
                <span className="info-value">{client.company || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label"><FaList /> {t('clients.mail')}:</span>
                <span className="info-value">{client.mail || '-'}</span>
              </div>
              
              {client.web && (
                <div className="info-item">
                  <span className="info-label"><FaGlobe /> {t('clients.web')}:</span>
                  <span className="info-value">
                    <a href={client.web.startsWith('http') ? client.web : `http://${client.web}`} target="_blank" rel="noopener noreferrer">
                      {client.web}
                    </a>
                  </span>
                </div>
              )}
            </div>
            
            {client.notes && (
              <div className="notes-section">
                <h3><FaInfoCircle /> {t('clients.notes')}</h3>
                <div className="notes-content">{client.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><FaPhone /> {t('clients.call_history')}</h2>
        </div>
        <div className="card-body">
          {calls.length === 0 ? (
            <p>{t('clients.no_calls')}</p>
          ) : (
            <div className="calls-list">
              {calls.map((call) => (
                <div className="call-item" key={call._id}>
                  <div className="call-item-header">
                    <div className="call-date">
                      {new Date(call.callDate).toLocaleDateString()}
                    </div>
                    <span className={`status-badge status-${call.status.toLowerCase()}`}>
                      {t(`status.${call.status.toLowerCase()}`)}
                    </span>
                  </div>
                  
                  <div className="call-item-body">
                    <p>
                      <strong>{t('calls.made_by')}:</strong> {call.user.name}
                    </p>
                    {call.outcome && (
                      <p>
                        <strong>{t('calls.outcome')}:</strong> {t(`outcome.${call.outcome.toLowerCase().replace(/ /g, '_')}`)}
                      </p>
                    )}
                    {call.notes && (
                      <p className="call-notes">
                        <strong>{t('calls.notes')}:</strong> {call.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="call-item-footer">
                    <Link to={`/calls/${call._id}`} className="btn btn-sm">
                      {t('calls.view_details')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientDetails; 