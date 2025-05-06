import React from 'react';
import { useTranslation } from 'react-i18next';

function Spinner() {
  const { t } = useTranslation();
  
  return (
    <div className="loadingSpinnerContainer">
      <div className="loadingSpinner"></div>
      <p>{t('common.loading')}</p>
    </div>
  );
}

export default Spinner; 