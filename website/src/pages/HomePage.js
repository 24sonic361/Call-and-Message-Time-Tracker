import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import '../styles/HomePage.css';
import { supabase } from '../supabaseClient';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('calls');
  const [callLogs, setCallLogs] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: calls, error: callError } = await supabase
      .from('call_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    const { data: messages, error: messageError } = await supabase
      .from('message_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (callError) {
      console.error('Call logs error:', callError);
    } else {
      setCallLogs(calls);
    }

    if (messageError) {
      console.error('Message logs error:', messageError);
    } else {
      setMessageLogs(messages);
    }
  }

  return (
    <div className="homepage-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="law-firm-title">CAMTT</h2>
        <nav className="menu">
          <ul>
            <li className="menu-item">
              Call / Message Tracking
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
        <h1>Call / Message List</h1>

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
        {activeTab === 'calls' ? <CallsTable callLogs={callLogs} /> : <MessagesTable messageLogs={messageLogs} />}
      </div>
    </div>
  );
};

// CallsTable and MessagesTable components (รับ props)

const CallsTable = ({ callLogs }) => {
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
        {callLogs.length === 0 ? (
          <tr>
            <td colSpan="6">No call data available</td>
          </tr>
        ) : (
          callLogs.map((call) => ( // Map through call logs
            // Assuming call has properties: id, imported_by, phone_number, call_type, start_timestamp, end_timestamp, duration
            <tr key={call.id}> 
              <td>{call.imported_by}</td>
              <td>{call.phone_number}</td>
              <td>{call.call_type}</td>
              <td>{new Date(call.start_timestamp).toLocaleString()}</td>
              <td>{new Date(call.end_timestamp).toLocaleString()}</td>
              <td>{call.duration} sec</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

const MessagesTable = ({ messageLogs }) => {
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
        {messageLogs.length === 0 ? (
          <tr>
            <td colSpan="4">No message data available</td>
          </tr>
        ) : (
          messageLogs.map((msg) => ( // Map through message logs
            // Assuming msg has properties: id, imported_by, phone_number, sent_timestamp, word_count
            <tr key={msg.id}>
              <td>{msg.imported_by}</td>
              <td>{msg.phone_number}</td>
              <td>{new Date(msg.sent_timestamp).toLocaleString()}</td>
              <td>{msg.word_count}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default HomePage;
