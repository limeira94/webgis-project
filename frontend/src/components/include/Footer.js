import React from 'react';
import "./Footer.css";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation()
  return (
    <footer id="footer" className="page-footer footer-color">

      <div className="footer-content">
        <a className="white-text text-lighten-4" href="/about">{t('about')}</a>
        <a className="white-text text-lighten-4" href="/contact">{t('contact')}</a>
        <p className="white-text text-lighten-4">© 2023 WebGIS Project</p>
      </div>

    </footer>
  );
};

export default Footer;
