import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import '../styles/HomePage.css'; 

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('calls');

  return (
    <div className="homepage-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="law-firm-title">LAW FIRM</h2>
        <nav className="menu">
          <ul>
            <li className="menu-item">
              Call / Msg Tracking
            </li>

            {/* Add Admin Page link */}
            <li className="menu-item">
              <Link to="/admin" className="menu-link">
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Call / Msg Tracking</h1>

        {/* Tabs for Calls and Messages */}
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'calls' ? 'active' : ''}`}
            onClick={() => setActiveTab('calls')}
          >
            Calls
          </button>
          <button
            className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </div>

        {/* Conditional rendering for Calls and Messages Table */}
        {activeTab === 'calls' ? <CallsTable /> : <MessagesTable />}
      </div>
    </div>
  );
};

// CallsTable and MessagesTable components (unchanged)
const CallsTable = () => {
  return (
    <table className="tracking-table">
      <thead>
        <tr>
          <th>Imported By</th>
          <th>From</th>
          <th>Call Type</th>
          <th>Start Date Time</th>
          <th>End Date Time</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="6">No data available</td>
        </tr>
      </tbody>
    </table>
  );
};

const MessagesTable = () => {
  return (
    <table className="tracking-table">
      <thead>
        <tr>
          <th>Imported By</th>
          <th>From</th>
          <th>Sent Date Time</th>
          <th>Word Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="4">No data available</td>
        </tr>
      </tbody>
    </table>
  );
};

export default HomePage;
