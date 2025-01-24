import { ThemeToggle } from "./ui/ThemeToggle";
import { Button } from "./ui/Button";
import { useState } from 'react';
import PropTypes from 'prop-types';
import logo from "../assets/LOGO.png";
import "../styles/navbar.css";

Navbar.defaultProps = {
    t: {
      nav: {
        tutorial: "Tutorial",
        about: "Quienes somos",
        credits: "Créditos",
        support: "Soporte",
        contact: "Contacto",
        login: "Iniciar sesión",
        signup: "Registrarse",
      },
    },
};

Navbar.propTypes = {
    t: PropTypes.shape({
      nav: PropTypes.shape({
        tutorial: PropTypes.string,
        about: PropTypes.string,
        credits: PropTypes.string,
        support: PropTypes.string,
        contact: PropTypes.string,
        login: PropTypes.string,
        signup: PropTypes.string,
      }),
    }),
};

NavItem.propTypes = {
    href: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  };

function NavItem({ href, children }) {
  return (
    <a
      href={href}
      className="nav-item"
    >
      {children}
    </a>
  );
}

function Navbar({ t }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    console.log('Menu button clicked');
    setMenuOpen(!menuOpen);
    console.log('Menu open state:', !menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-row">
          <a href="/" className="navbar-logo">
            <div className="logo-container">
              <img
                src={logo}
                alt="Logo"
                className="logo-image"
              />
            </div>
            <span className="logo-text">Leroi</span>
          </a>
          <button className="hamburger-button" onClick={toggleMenu}>
            ☰
          </button>
          {/* Navigation Links */}
          <div className={`navbar-links ${menuOpen ? 'menu-open' : ''}`}>
            <NavItem href="/#tutorial">{t.nav.tutorial}</NavItem>
            <NavItem href="/about">{t.nav.about}</NavItem>
            <NavItem href="/#credits">{t.nav.credits}</NavItem>
            <NavItem href="/about/#team">{t.nav.contact}</NavItem>
          </div>

          {/* Buttons */}
          <div className="navbar-buttons">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = "/login";
              }}
              className="navbar-button"
            >
              {t.nav.login}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = "/register";
              }}
              className="navbar-button"
            >
              {t.nav.signup}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}


export default Navbar;