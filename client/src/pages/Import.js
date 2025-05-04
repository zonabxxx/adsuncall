import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import Papa from 'papaparse';
import config from '../config';
import BackButton from '../components/BackButton';

function Import() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('clients');
  const [previewData, setPreviewData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mappings, setMappings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [importResults, setImportResults] = useState(null);

  // Define required and optional fields for each import type
  const importFields = {
    clients: {
      required: ['company', 'email', 'phone', 'mail', 'postal_mail'],
      optional: ['notes', 'web']
    },
    calls: {
      required: ['client', 'callDate', 'status'],
      optional: ['duration', 'outcome', 'notes', 'nextAction', 'nextActionDate']
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleTypeChange = (e) => {
    setImportType(e.target.value);
    // Reset mappings when type changes
    setMappings({});
  };

  const parseCSV = () => {
    if (!file) {
      toast.error(t('import.no_file_selected'));
      return;
    }

    setIsLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Limit preview to 5 rows
          setPreviewData(results.data.slice(0, 5));
          const csvHeaders = results.meta.fields || [];
          setHeaders(csvHeaders);
          
          // Initialize mappings with smart matching
          const initialMappings = {};
          
          // Helper function to find best match for a field
          const findBestMatch = (fieldName) => {
            // Exact match
            const exactMatch = csvHeaders.find(
              header => header.toLowerCase() === fieldName.toLowerCase()
            );
            if (exactMatch) return exactMatch;
            
            // Contains match (e.g. "company_name" matches "company")
            const containsMatch = csvHeaders.find(
              header => header.toLowerCase().includes(fieldName.toLowerCase())
            );
            if (containsMatch) return containsMatch;
            
            // Special case mappings
            const specialMappings = {
              'company': ['organization', 'firma', 'spolocnost', 'business', 'name', 'client'],
              'email': ['address', 'adresa', 'e-mail'],
              'phone': ['tel', 'telefon', 'telephone', 'mobile', 'cell'],
              'mail': ['category', 'kategoria', 'typ', 'type'],
              'postal_mail': ['email', 'e-mail', 'mail'],
              'web': ['website', 'site', 'url', 'www'],
              'notes': ['note', 'comment', 'poznamka']
            };
            
            if (specialMappings[fieldName]) {
              for (const alias of specialMappings[fieldName]) {
                const specialMatch = csvHeaders.find(
                  header => header.toLowerCase().includes(alias.toLowerCase())
                );
                if (specialMatch) return specialMatch;
              }
            }
            
            return '';
          };
          
          // Map required fields first
          importFields[importType].required.forEach(field => {
            initialMappings[field] = findBestMatch(field);
          });
          
          // Then map optional fields
          importFields[importType].optional.forEach(field => {
            initialMappings[field] = findBestMatch(field);
          });
          
          setMappings(initialMappings);
          setStep(2);
        } else {
          toast.error(t('import.no_data_found'));
        }
        setIsLoading(false);
      },
      error: (error) => {
        toast.error(`${t('import.parsing_error')}: ${error.message}`);
        setIsLoading(false);
      }
    });
  };

  const handleMappingChange = (field, value) => {
    setMappings({
      ...mappings,
      [field]: value
    });
  };

  const validateMappings = () => {
    // Check authentication first
    if (!user || !user.token) {
      toast.error('You need to be logged in to import data. Please log in and try again.');
      navigate('/login');
      return false;
    }
  
    // Check mappings
    const requiredFields = importFields[importType].required;
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!mappings[field]) {
        missingFields.push(getFieldLabel(field));
      }
    }
    
    if (missingFields.length > 0) {
      toast.error(`${t('import.missing_required_field')}: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Check for duplicate mappings
    const usedHeaders = new Set();
    const duplicateHeaders = new Set();
    
    Object.values(mappings).forEach(header => {
      if (header && usedHeaders.has(header)) {
        duplicateHeaders.add(header);
      }
      if (header) {
        usedHeaders.add(header);
      }
    });
    
    if (duplicateHeaders.size > 0) {
      toast.warning(`You mapped multiple fields to the same column: ${Array.from(duplicateHeaders).join(', ')}`);
      // Don't block import for duplicates, just warn
    }
    
    return true;
  };

  const processImport = () => {
    if (!validateMappings()) {
      return;
    }

    setIsLoading(true);
    setImportResults(null); // Clear previous results
    
    try {
      // Process the full CSV file with the chosen mappings
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          // Transform data based on mappings
          const transformedData = results.data.map(row => {
            const newRow = {};
            Object.entries(mappings).forEach(([field, header]) => {
              if (header) {
                newRow[field] = row[header];
              }
            });
            return newRow;
          });

          // Log data info for debugging
          console.log(`Transforming ${transformedData.length} records for import`);
          
          // Check if we have user token
          if (!user || !user.token) {
            toast.error('Authorization token missing. Please login again.');
            setIsLoading(false);
            return;
          }

          // Break large datasets into batches to avoid "request entity too large" error
          const BATCH_SIZE = 100; // Process 100 records at a time
          const batches = [];
          
          // Create batches of records
          for (let i = 0; i < transformedData.length; i += BATCH_SIZE) {
            batches.push(transformedData.slice(i, i + BATCH_SIZE));
          }
          
          console.log(`Data will be processed in ${batches.length} batches`);
          
          // Process each batch sequentially using async/await
          const processBatch = async (batchIndex) => {
            if (batchIndex >= batches.length) {
              // All batches processed
              const result = {
                imported: transformedData.length,
                updated: 0,
                skipped: 0,
                total: transformedData.length,
                errors: []
              };
              setImportResults(result);
              toast.success(`${t('import.success')}: ${transformedData.length} ${importType}`);
              navigate(importType === 'clients' ? '/clients' : '/calls');
              return;
            }
            
            const batch = batches[batchIndex];
            const endpoint = importType === 'clients' 
              ? config.getApiUrl('/api/clients/import')
              : config.getApiUrl('/api/calls/import');
            
            try {
              console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} records)`);
              
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ data: batch })
              });
              
              if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server responded with status ${response.status}: ${text || 'No error message'}`);
              }
              
              const data = await response.json();
              console.log(`Batch ${batchIndex + 1} response:`, data);
              
              // Add to the total
              const result = {
                imported: data.imported || 0,
                updated: data.updated || 0,
                skipped: data.skipped || 0,
                total: data.total || 0,
                errors: data.errors || []
              };
              setImportResults(result);
              
              // Show progress
              toast.info(`Processed batch ${batchIndex + 1}/${batches.length} (${result.imported} records so far)`);
              
              // Process next batch
              processBatch(batchIndex + 1);
            } 
            catch (error) {
              console.error(`Error in batch ${batchIndex + 1}:`, error);
              toast.error(`${t('import.error')} in batch ${batchIndex + 1}: ${error.message}`);
              setIsLoading(false);
            }
          };
          
          // Start processing batches
          processBatch(0).catch(error => {
            console.error('Batch processing error:', error);
            setIsLoading(false);
          });
        },
        error: (error) => {
          console.error('CSV processing error:', error);
          toast.error(`${t('import.processing_error')}: ${error.message}`);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Import error:', error);
      toast.error(t('import.processing_error'));
      setIsLoading(false);
    }
  };

  // Get field labels from translations
  const getFieldLabel = (field) => {
    // Specific translations for client import fields 
    const fieldMap = {
      company: t('clients.company'),
      email: t('clients.email'), // Adresa
      phone: t('clients.phone'),
      mail: t('clients.mail'), // Kategória
      postal_mail: t('clients.postal_mail'), // Email
      notes: t('clients.notes'),
      web: t('clients.web'),
      client: t('calls.client'),
      callDate: t('calls.call_date'),
      status: t('calls.status'),
      duration: t('calls.duration'),
      outcome: t('calls.outcome'),
      nextAction: t('calls.next_action'),
      nextActionDate: t('calls.next_action_date')
    };
    
    return fieldMap[field] || field;
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <BackButton />

      <section className="heading">
        <h1>{t('import.title')}</h1>
        <p>{t('import.subtitle')}</p>
      </section>

      <div className="import-container">
        {step === 1 && (
          <div className="form">
            <div className="form-group">
              <label htmlFor="importType">{t('import.type')}</label>
              <select
                id="importType"
                value={importType}
                onChange={handleTypeChange}
                className="form-control"
              >
                <option value="clients">{t('import.clients')}</option>
                <option value="calls">{t('import.calls')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="csvFile">{t('import.select_file')}</label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleFileChange}
                className="form-control"
              />
              <p className="form-hint">{t('import.file_format_hint')}</p>
            </div>

            <div className="form-group">
              <button onClick={parseCSV} className="btn btn-block" disabled={!file}>
                <FaUpload /> {t('import.upload_and_preview')}
              </button>
            </div>
          </div>
        )}

        {step === 2 && previewData && (
          <>
            <h2>{t('import.preview')}</h2>
            <div className="table-responsive preview-table">
              <table>
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {headers.map((header, cellIndex) => (
                        <td key={cellIndex}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mapping-container">
              <h2>{t('import.column_mapping')}</h2>
              <p>{t('import.mapping_instruction')}</p>
              
              <div className="field-mappings">
                <h3 className="required-section">{t('import.required_fields')}</h3>
                {importFields[importType].required.map((field) => (
                  <div key={field} className="mapping-item">
                    <label className="required-field-label">{getFieldLabel(field)}:</label>
                    <select
                      value={mappings[field] || ''}
                      onChange={(e) => handleMappingChange(field, e.target.value)}
                      className={!mappings[field] ? 'error' : ''}
                    >
                      <option value="">{t('import.select_column')}</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                    <div className="mapping-status">
                      {mappings[field] ? (
                        <FaCheck className="mapping-valid" />
                      ) : (
                        <FaTimes className="mapping-invalid" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {importFields[importType].optional.length > 0 && (
                <>
                  <h3>{t('import.optional_fields')}</h3>
                  <div className="field-mappings">
                    {importFields[importType].optional.map((field) => (
                      <div key={field} className="mapping-item">
                        <label>{getFieldLabel(field)}:</label>
                        <select
                          value={mappings[field] || ''}
                          onChange={(e) => handleMappingChange(field, e.target.value)}
                        >
                          <option value="">{t('import.ignore_field')}</option>
                          {headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                        <div className="mapping-status">
                          {mappings[field] ? (
                            <FaCheck className="mapping-valid" />
                          ) : (
                            <FaTimes className="mapping-invalid" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="import-actions">
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                <FaArrowLeft /> {t('import.back_to_upload')}
              </button>
              <button
                onClick={processImport}
                className="btn btn-primary"
              >
                <FaCheck /> {t('import.process_import')}
              </button>
            </div>
          </>
        )}
      </div>

      {importResults && <ImportResults results={importResults} />}
    </>
  );
}

// Add a new ImportResults component to display detailed import results
const ImportResults = ({ results }) => {
  const { t } = useTranslation();
  
  if (!results) return null;
  
  return (
    <div className="import-results">
      <h3>{t('import.results')}</h3>
      <div className="results-summary">
        <p className="result-item">
          <strong>{t('import.new_imported')}:</strong> {results.imported}
        </p>
        <p className="result-item">
          <strong>{t('import.updated')}:</strong> {results.updated}
        </p>
        <p className="result-item">
          <strong>{t('import.skipped')}:</strong> {results.skipped}
        </p>
        <p className="result-item">
          <strong>{t('import.total_processed')}:</strong> {results.total}
        </p>
      </div>
      
      {results.errors && results.errors.length > 0 && (
        <div className="import-errors">
          <h4>{t('import.errors')}</h4>
          <div className="error-list">
            {results.errors.map((error, index) => (
              <div key={index} className="error-item">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Import; 