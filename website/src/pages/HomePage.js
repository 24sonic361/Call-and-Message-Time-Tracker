import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('calls');
  const [callLogs, setCallLogs] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Fetch phonenumbers from Clients table
    const { data: clientPhones, error: clientError } = await supabase
      .from('Clients')
      .select('phonenumber');

    if (clientError) {
      console.error('Error fetching client phonenumbers:', clientError);
      setCallLogs([]);
      setMessageLogs([]);
      return;
    }

    const phoneNumbers = clientPhones.map((client) => client.phonenumber);

    // Fetch CallLogs where phonenumber is in Clients.phonenumber
    const { data: calls, error: callsError } = await supabase
      .from('CallLogs')
      .select('*')
      .in('whocalled', phoneNumbers)
      .order('starttime', { ascending: false });

    // Fetch MessageLogs where phonenumber is in Clients.phonenumber
    const { data: messages, error: messagesError } = await supabase
      .from('MessageLogs')
      .select('*')
      .in('whomessaged', phoneNumbers)
      .order('senttime', { ascending: false });

    if (callsError) {
      console.error('Error fetching call logs:', callsError);
      setCallLogs([]);
    } else {
      setCallLogs(calls || []);
    }

    if (messagesError) {
      console.error('Error fetching message logs:', messagesError);
      setMessageLogs([]);
    } else {
      setMessageLogs(messages || []);
    }
  }

  return (
    <div className="homepage-container">
      <Sidebar />

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
          <tr key={call.cid}>
            <td>{call.createdby}</td>
            <td>{call.whocalled}</td>
            <td>{call.type}</td>
            <td>{new Date(call.starttime).toLocaleString()}</td>
            <td>{new Date(call.endtime).toLocaleString()}</td>
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
          <tr key={msg.cmid}>
            <td>{msg.createdby}</td>
            <td>{msg.whomessaged}</td>
            <td>{new Date(msg.senttime).toLocaleString()}</td>
            <td>{msg.wordcount}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default HomePage;