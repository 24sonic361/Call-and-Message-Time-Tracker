import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../AuthProvider';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const adminEmail = String(currentUser.email || 'Admin');

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="menu-toggle" onClick={toggleMenu}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <nav className={`menu ${isOpen ? 'visible' : ''}`}>
        <ul>
          <li className="menu-item">
            <Link
              to="/"
              className={`menu-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Tracking
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/bill"
              className={`menu-link ${location.pathname === '/bill' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Billing
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/landing"
              className={`menu-link ${location.pathname === '/landing' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Landing
            </Link>
          </li>
          {adminEmail === 'admin@dev.com' && (
            <li className="menu-item">
              <Link
                to="/admin"
                className={`menu-link ${location.pathname === '/admin' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;