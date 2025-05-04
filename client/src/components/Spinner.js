import React from 'react';
import { useTranslation } from 'react-i18next';

const Spinner = () => {
  const { t } = useTranslation();
  
  return (
    <div className="loadingSpinner">
      <div className="spinner"></div>
      <p>{t('app.loading')}</p>
    </div>
  );
};

export default Spinner; 