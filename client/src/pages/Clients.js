import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaPlus, FaAngleLeft, FaAngleRight, FaEye, FaPhone, FaToggleOn, FaToggleOff, FaTrash, FaSync } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getClients, reset, toggleClientStatus, deleteClient } from '../features/clients/clientSlice';
import Spinner from '../components/Spinner';

function Clients() {
  const { t } = useTranslation();
  const { clients, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.clients
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [showInactive, setShowInactive] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionError, setConnectionError] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      if (isSuccess) {
        dispatch(reset());
      }
    };
  }, [dispatch, isSuccess]);

  // Funkcia na načítanie klientov
  const loadClients = useCallback(() => {
    setConnectionError(false);
    dispatch(getClients());
  }, [dispatch]);

  // Pôvodné načítanie klientov
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Kontrola chyby a prípadné opätovné načítanie
  useEffect(() => {
    if (isError) {
      if (message && (message.includes('500') || message.includes('network') || message.includes('timeout') || message.includes('connection') || message.includes('server'))) {
        setConnectionError(true);
        // Pokúsime sa automaticky obnoviť každých 5 sekúnd, maximálne 3 pokusy
        if (retryCount < 3) {
          const timer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadClients();
          }, 5000);
          
          return () => clearTimeout(timer);
        } else {
          toast.error(t('errors.db_connection_failed'));
        }
      } else {
        toast.error(message);
      }
    }
  }, [isError, message, loadClients, retryCount, t]);

  useEffect(() => {
    if (clients) {
      let results = clients.filter(client => {
        const searchLower = searchTerm.toLowerCase();
        return (
          client.name?.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.phone?.toLowerCase().includes(searchLower)
        );
      });
      
      // Filter out inactive clients if showInactive is false
      if (!showInactive) {
        results = results.filter(client => client.isActive);
      }
      
      setFilteredClients(results);
      setCurrentPage(1); // Reset to first page on new search
    }
  }, [clients, searchTerm, showInactive]);

  // Toggle client active status
  const handleToggleStatus = (e, clientId) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch(toggleClientStatus(clientId))
      .unwrap()
      .then(() => {
        toast.success(t('clients.status_updated'));
      })
      .catch((error) => {
        toast.error(t('clients.error_update'));
      });
  };
  
  // Delete client
  const handleDeleteClient = (e, clientId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(t('clients.delete_confirm'))) {
      dispatch(deleteClient(clientId))
        .unwrap()
        .then(() => {
          toast.success(t('clients.deleted'));
        })
        .catch((error) => {
          toast.error(t('clients.error_delete'));
        });
    }
  };

  // Manuálne obnovenie dát
  const handleManualRefresh = () => {
    setRetryCount(0);
    loadClients();
    toast.info(t('clients.refreshing'));
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const handleRowsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <section className="heading">
        <h1>{t('clients.title')}</h1>
        <p>{t('clients.subtitle')}</p>
        <div className="actions-row">
          <div>
            <Link to="/clients/new" className="btn">
              <FaPlus /> {t('clients.add')}
            </Link>
            <label className="checkbox-container" style={{ marginLeft: '15px' }}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
              /> {t('clients.show_inactive')}
            </label>
            <button 
              onClick={handleManualRefresh} 
              className="btn btn-light" 
              style={{ marginLeft: '10px' }}
              title={t('clients.refresh_data')}
            >
              <FaSync /> 
            </button>
          </div>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder={t('clients.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </section>

      {connectionError && (
        <div className="connection-error-banner">
          <p>{t('errors.db_connection_error')}</p>
          <button onClick={handleManualRefresh} className="btn btn-sm">
            <FaSync /> {t('errors.retry')}
          </button>
        </div>
      )}

      <div className="table-container">
        {filteredClients.length === 0 ? (
          connectionError ? (
            <p>{t('errors.could_not_load_clients')}</p>
          ) : (
            <p>{t('clients.no_clients')}</p>
          )
        ) : (
          <>
            <div className="table-toolbar">
              <div className="items-per-page">
                <label htmlFor="rowsPerPage">{t('clients.rows_per_page')}:</label>
                <select 
                  id="rowsPerPage" 
                  value={itemsPerPage} 
                  onChange={handleRowsPerPageChange}
                  className="select-items"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="page-info">
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredClients.length)} {t('clients.of')} {filteredClients.length}
              </div>
            </div>

            <table className="clients-table">
              <thead>
                <tr>
                  <th>{t('clients.name')}</th>
                  <th>{t('clients.mail')}</th>
                  <th>{t('clients.email')}</th>
                  <th>{t('clients.phone')}</th>
                  <th>{t('clients.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((client) => (
                  <tr key={client._id} className={client.isActive ? '' : 'client-row-inactive'}>
                    <td>
                      {client.name}
                      {!client.isActive && (
                        <span className="client-status-indicator client-inactive">
                          {t('clients.inactive')}
                        </span>
                      )}
                    </td>
                    <td>{client.mail || '-'}</td>
                    <td>{client.address || '-'}</td>
                    <td>{client.phone || '-'}</td>
                    <td className="actions-cell">
                      <div className="btn-container">
                        <Link to={`/clients/${client._id}`} className="action-btn" title={t('clients.view_details')}>
                          <FaEye />
                        </Link>
                        <Link 
                          to={`/calls/new?client=${client._id}`} 
                          state={{ client: client }}
                          className="action-btn btn-secondary"
                          title={t('clients.new_call')}
                        >
                          <FaPhone />
                        </Link>
                        <button 
                          type="button"
                          onClick={(e) => handleToggleStatus(e, client._id)} 
                          className={`action-btn ${client.isActive ? 'btn-warning' : 'btn-success'}`}
                          title={client.isActive ? t('clients.deactivate') : t('clients.activate')}
                        >
                          {client.isActive ? <FaToggleOff /> : <FaToggleOn />}
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDeleteClient(e, client._id)} 
                          className="action-btn btn-danger"
                          title={t('clients.delete')}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <FaAngleLeft />
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  let pageNum;
                  
                  // Calculate which page numbers to show
                  if (totalPages <= 5) {
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + index;
                  } else {
                    pageNum = currentPage - 2 + index;
                  }
                  
                  // Only render if pageNum is valid
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                <FaAngleRight />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Clients; 