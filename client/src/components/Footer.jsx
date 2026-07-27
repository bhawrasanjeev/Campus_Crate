import React from 'react';
import { Package } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <Package size={20} color="#15227b" />
          <span className="footer-brand">CampusCrate</span>
          <span className="footer-copy">
            © {new Date().getFullYear()} CrateFound. For Campus Safety.
          </span>
        </div>

        <div className="footer-links">
          <button className="footer-link">About</button>
          <button className="footer-link">Help</button>
          <button className="footer-link">Privacy</button>
          <button className="footer-link">Report Abuse</button>
        </div>
      </div>
    </footer>
  );
};
