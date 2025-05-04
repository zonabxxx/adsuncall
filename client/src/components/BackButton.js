import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const BackButton = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button onClick={handleGoBack} className="btn btn-back">
      <FaArrowLeft /> {t('common.back')}
    </button>
  );
};

export default BackButton; 