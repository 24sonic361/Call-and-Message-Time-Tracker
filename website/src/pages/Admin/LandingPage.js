import React from 'react';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaUsers } from 'react-icons/fa';
import '../../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="landmain-section">
        <div className="center-content">
          <h1 className="admin-header">Fucntional Administration</h1>
          <div className="header-divider"></div>

          <div className="white-box-container">
            <div className="landing-card">
              <h2 className="landing-title">Functions Selection</h2>
              
              <div className="button-grid">
                <button 
                  className="oval-button" 
                  onClick={() => navigate('/bill')}
                >
                  <div className="button-content">
                    <FaChartBar className="button-icon" />
                    <div className="button-text">
                      <h3>Billing Calculation</h3>
                      <p>Generate, analyze, and manage all financial statements</p>
                    </div>
                  </div>
                </button>

                <button 
                  className="oval-button" 
                  onClick={() => navigate('/user')}
                >
                  <div className="button-content">
                    <FaUsers className="button-icon" />
                    <div className="button-text">
                      <h3>User Management</h3>
                      <p>Manage user accounts and access controls</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;