import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'sk', name: 'Slovenčina' },
    { code: 'en', name: 'English' }
  ];
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    // Uloženie vybraného jazyka do localStorage
    localStorage.setItem('i18nextLng', languageCode);
  };
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="language-container">
      <div className="language-switcher">
        <button 
          className="dropdown-toggle" 
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <FaGlobe /> {currentLanguage.name} <FaChevronDown />
        </button>
        
        <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
          {languages.map(language => (
            <button
              key={language.code}
              className={`dropdown-item ${currentLanguage.code === language.code ? 'active' : ''}`}
              onClick={() => changeLanguage(language.code)}
            >
              {language.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher; 