import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiDollarSign } from "react-icons/fi";
import { useAuth } from "../AuthProvider";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [adminToolsOpen, setAdminToolsOpen] = useState(false);
  const { currentUser } = useAuth();
  const adminEmail = String(currentUser.email || "Admin");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isAdminSection = ["/landing", "/user", "/bill"].includes(
    location.pathname
  );
  const showAdminTools = adminToolsOpen || isAdminSection;

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <button className="menu-toggle" onClick={toggleMenu}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <nav className={`menu ${isOpen ? "visible" : ""}`}>
        <ul>
          <li className="menu-item">
            <Link
              to="/"
              className={`menu-link ${
                location.pathname === "/" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              Tracking
            </Link>
          </li>
          {adminEmail === "admin@dev.com" && (
            <>
              <li className="menu-item">
                <Link
                  to="/landing"
                  className={`menu-link ${isAdminSection ? "active" : ""}`}
                  onClick={() => {
                    closeMenu();
                    setAdminToolsOpen(true);
                  }}
                >
                  Admin
                </Link>
              </li>

              {showAdminTools && (
                <div className="admin-tools">
                  <Link
                    to="/bill"
                    className={`admin-tool-btn ${
                      location.pathname === "/bill" ? "active" : ""
                    }`}
                    onClick={closeMenu}
                  >
                    <FiDollarSign size={14} />
                    <span>Bill Calculation</span>
                  </Link>
                  <Link
                    to="/user"
                    className={`admin-tool-btn ${
                      location.pathname === "/user" ? "active" : ""
                    }`}
                    onClick={closeMenu}
                  >
                    <FiUser size={14} />
                    <span>User Management</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
