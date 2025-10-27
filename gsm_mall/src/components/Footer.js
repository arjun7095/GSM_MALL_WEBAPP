import React from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mall-footer">
      <div className="mall-footer-container">
        {/* About */}
        <div className="footer-col">
          <h3>MallBoost</h3>
          <p>
            Your all-in-one digital marketing platform for shopping malls.
            Boost footfall, run targeted campaigns, and analyze performance in real time.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/brands">Brands</a></li>
            <li><a href="/promotions">Promotions</a></li>
            <li><a href="/admin/dashboard">Admin Dashboard</a></li>
            <li><a href="/user/dashboard">User Dashboard</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>Email: <a href="mailto:support@mallboost.com">support@mallboost.com</a></p>
          <p>Phone: +1 800 555 0199</p>
          <p>Address: 123 Mall Avenue, NY 10001</p>
        </div>

        {/* Social */}
        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://www.facebook.com" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://x.com/" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://www.instagram.com/" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://in.linkedin.com/" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MallBoost. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;