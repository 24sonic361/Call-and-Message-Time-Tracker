import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
              to="/admin"
              className={`menu-link ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Admin
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
