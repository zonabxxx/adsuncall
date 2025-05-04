import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaPlus, FaAngleLeft, FaAngleRight, FaEye } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { getCalls, reset } from '../features/calls/callSlice';
import Spinner from '../components/Spinner';

function Calls() {
  const { t } = useTranslation();
  const { calls, isLoading, isSuccess } = useSelector(
    (state) => state.calls
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCalls, setFilteredCalls] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      if (isSuccess) {
        dispatch(reset());
      }
    };
  }, [dispatch, isSuccess]);

  useEffect(() => {
    dispatch(getCalls());
  }, [dispatch]);

  useEffect(() => {
    if (calls) {
      const results = calls.filter(call => {
        const searchLower = searchTerm.toLowerCase();
        return (
          call.client?.name?.toLowerCase().includes(searchLower) ||
          call.client?.company?.toLowerCase().includes(searchLower) ||
          (call.outcome && call.outcome.toLowerCase().includes(searchLower)) ||
          (call.status && call.status.toLowerCase().includes(searchLower)) ||
          (call.notes && call.notes.toLowerCase().includes(searchLower))
        );
      });
      setFilteredCalls(results);
      setCurrentPage(1); // Reset to first page on new search
    }
  }, [calls, searchTerm]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCalls.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const handleRowsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <section className="heading">
        <h1>{t('calls.title')}</h1>
        <p>{t('calls.subtitle')}</p>
        <div className="actions-row">
          <Link to="/calls/new" className="btn">
            <FaPlus /> {t('calls.add')}
          </Link>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder={t('calls.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </section>

      <div className="table-container">
        {filteredCalls.length === 0 ? (
          <p>{t('calls.no_calls')}</p>
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
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCalls.length)} {t('clients.of')} {filteredCalls.length}
              </div>
            </div>

            <table className="clients-table calls-table">
              <thead>
                <tr>
                  <th>{t('calls.client')}</th>
                  <th>{t('calls.date')}</th>
                  <th>{t('status.title')}</th>
                  <th>{t('outcome.title')}</th>
                  <th>{t('calls.made_by')}</th>
                  <th>{t('clients.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((call) => (
                  <tr key={call._id}>
                    <td>
                      <div className="call-client-info">
                        <div><strong>{call.client.name}</strong></div>
                        {call.client.company && <div>{call.client.company}</div>}
                      </div>
                    </td>
                    <td>{formatDate(call.callDate)}</td>
                    <td>
                      <span className={`status status-${call.status.toLowerCase()}`}>
                        {t(`calls.status.${call.status.toLowerCase().replace(/ /g, '_')}`)}
                      </span>
                    </td>
                    <td>
                      {call.outcome ? t(`outcome.${call.outcome.toLowerCase().replace(/ /g, '_')}`) : '-'}
                    </td>
                    <td>{call.user.name}</td>
                    <td className="actions-cell">
                      <div className="btn-container">
                        <Link to={`/calls/${call._id}`} className="action-btn" title={t('calls.view_details')}>
                          <FaEye />
                        </Link>
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

export default Calls; 