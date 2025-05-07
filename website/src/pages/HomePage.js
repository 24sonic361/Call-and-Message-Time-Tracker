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
    const { data: calls } = await supabase
      .from('call_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    const { data: messages } = await supabase
      .from('message_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    setCallLogs(calls || []);
    setMessageLogs(messages || []);
  }

  return (
    <div className="homepage-container">
      <aside className="sidebar">
        <h2 className="brand">📞 CAMTT</h2>
        <nav>
          <ul>
            <li>
              <Link to="/" className="menu-link active">Tracking</Link>
            </li>
            <li>
              <Link to="/admin" className="menu-link">Admin</Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-section">
        <h1 className="page-title">Call & Message Logs</h1>

        <div className="tab-buttons">
          <button
            className={activeTab === 'calls' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('calls')}
          >
            Call Logs
          </button>
          <button
            className={activeTab === 'messages' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('messages')}
          >
            Message Logs
          </button>
        </div>

        <div className="table-container">
          {activeTab === 'calls' ? (
            <CallsTable callLogs={callLogs} />
          ) : (
            <MessagesTable messageLogs={messageLogs} />
          )}
        </div>
      </main>
    </div>
  );
};

const CallsTable = ({ callLogs }) => (
  <table className="styled-table">
    <thead>
      <tr>
        <th>Imported By</th>
        <th>From</th>
        <th>Type</th>
        <th>Start</th>
        <th>End</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      {callLogs.length === 0 ? (
        <tr><td colSpan="6" className="empty-message">No call data available</td></tr>
      ) : (
        callLogs.map((call) => (
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

const MessagesTable = ({ messageLogs }) => (
  <table className="styled-table">
    <thead>
      <tr>
        <th>Imported By</th>
        <th>From</th>
        <th>Sent Time</th>
        <th>Word Count</th>
      </tr>
    </thead>
    <tbody>
      {messageLogs.length === 0 ? (
        <tr><td colSpan="4" className="empty-message">No message data available</td></tr>
      ) : (
        messageLogs.map((msg) => (
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

export default HomePage;
