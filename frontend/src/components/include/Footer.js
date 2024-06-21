import React from 'react';
import "./Footer.css";

const Footer = () => {
  return (
    <footer id="footer" className="page-footer footer-color">

      <div className="footer-content">
        <a className="white-text text-lighten-4" href="/about">About</a>
        <a className="white-text text-lighten-4" href="/contact">Contact</a>
        <p className="white-text text-lighten-4">© 2023 WebGIS Project</p>
      </div>

    </footer>
  );
};

export default Footer;
