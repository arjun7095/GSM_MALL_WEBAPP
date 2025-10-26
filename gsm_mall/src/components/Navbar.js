import React, { useState } from "react";
import "./Navbar.css";
import { FaShoppingBag} from "react-icons/fa";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="mall-navbar">
      <div className="mall-navbar-container">
        {/* Logo */}
        <a href="/" className="mall-logo">
          <FaShoppingBag className="logo-icon" />
          <span>MallBoost</span>
        </a>

        {/* Desktop Links */}
        <ul className={`mall-links ${mobileOpen ? "active" : ""}`}>
          <li><a href="/">Home</a></li>
          <li><a href="/brands">Brands</a></li>
          <li><a href="/promotions">Promotions</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact Us</a></li>

        </ul>

        {/* Hamburger */}
        <div
          className="mall-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className={mobileOpen ? "open" : ""}></span>
          <span className={mobileOpen ? "open" : ""}></span>
          <span className={mobileOpen ? "open" : ""}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;