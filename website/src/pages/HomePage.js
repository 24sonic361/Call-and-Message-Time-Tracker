import React, { useState, useEffect, useRef } from 'react';
import '../styles/HomePage.css';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../AuthProvider';
import { supabase } from '../supabaseClient';
import '../styles/Common.css';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('calls');
  const [callLogs, setCallLogs] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [currentCallPage, setCurrentCallPage] = useState(1);
  const [currentMessagePage, setCurrentMessagePage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [animationState, setAnimationState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const dropdownRef = useRef(null);
  const { currentUser } = useAuth();
  const adminEmail = String(currentUser.email || "Admin");

  useEffect(() => {
    fetchData();
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchData() {
    const { data: clientEmails, error: emailError } = await supabase
      .from('Clients')
      .select('email')
      .eq('email', adminEmail);

    if (emailError) {
      console.error('Error fetching client email:', emailError);
      setCallLogs([]);
      setMessageLogs([]);
      return;
    }

    let phoneNumbers = [];
    let customerMap = {};

    if (clientEmails && clientEmails.length > 0) {
      const { data: customerData, error: customerError } = await supabase
        .from('Customers')
        .select('phonenumber, fullname')
        .eq('managedby', clientEmails[0].email);

      if (customerError) {
        console.error('Error fetching customer data:', customerError);
        setCallLogs([]);
        setMessageLogs([]);
        return;
      }

      phoneNumbers = customerData.map((customer) => customer.phonenumber);
      customerMap = customerData.reduce((map, customer) => {
        map[customer.phonenumber] = customer.fullname;
        return map;
      }, {});
    } else {
      const { data: allCustomerData, error: allCustomerError } = await supabase
        .from('Customers')
        .select('phonenumber, fullname');

      if (allCustomerError) {
        console.error('Error fetching all customer data:', allCustomerError);
        setCallLogs([]);
        setMessageLogs([]);
        return;
      }

      phoneNumbers = allCustomerData.map((customer) => customer.phonenumber);
      customerMap = allCustomerData.reduce((map, customer) => {
        map[customer.phonenumber] = customer.fullname;
        return map;
      }, {});
    }

    const { data: calls, error: callsError } = await supabase
      .from('CallLogs')
      .select('*')
      .in('whocalled', phoneNumbers)
      .order('starttime', { ascending: false });

    const { data: messages, error: messagesError } = await supabase
      .from('MessageLogs')
      .select('*')
      .in('whomessaged', phoneNumbers)
      .order('senttime', { ascending: false });

    if (callsError) {
      console.error('Error fetching call logs:', callsError);
      setCallLogs([]);
    } else {
      const enrichedCalls = calls.map(call => ({
        ...call,
        fullname: customerMap[call.whocalled] || 'Unknown'
      }));
      setCallLogs(enrichedCalls || []);
    }

    if (messagesError) {
      console.error('Error fetching message logs:', messagesError);
      setMessageLogs([]);
    } else {
      const enrichedMessages = messages.map(msg => ({
        ...msg,
        fullname: customerMap[msg.whomessaged] || 'Unknown'
      }));
      setMessageLogs(enrichedMessages || []);
    }
  }

  const sortData = (data, isCalls) => {
    const sorted = [...data];
    if (isCalls) {
      if (sortOption === 'newest') {
        sorted.sort((a, b) => new Date(b.starttime) - new Date(a.starttime));
      } else if (sortOption === 'oldest') {
        sorted.sort((a, b) => new Date(a.starttime) - new Date(b.starttime));
      } else if (sortOption === 'longest') {
        sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0));
      } else if (sortOption === 'shortest') {
        sorted.sort((a, b) => (a.duration || 0) - (b.duration || 0));
      }
    } else {
      if (sortOption === 'newest') {
        sorted.sort((a, b) => new Date(b.senttime) - new Date(a.senttime));
      } else if (sortOption === 'oldest') {
        sorted.sort((a, b) => new Date(a.senttime) - new Date(b.senttime));
      } else if (sortOption === 'longest') {
        sorted.sort((a, b) => (b.wordcount || 0) - (a.wordcount || 0));
      } else if (sortOption === 'shortest') {
        sorted.sort((a, b) => (a.wordcount || 0) - (b.wordcount || 0));
      }
    }
    return sorted;
  };

  const filterData = (data) => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      item.fullname && item.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const sortedCallLogs = sortData(callLogs, true);
  const sortedMessageLogs = sortData(messageLogs, false);
  const filteredCallLogs = filterData(sortedCallLogs);
  const filteredMessageLogs = filterData(sortedMessageLogs);

  const totalCallPages = Math.ceil(filteredCallLogs.length / itemsPerPage);
  const totalMessagePages = Math.ceil(filteredMessageLogs.length / itemsPerPage);

  const paginatedCallLogs = filteredCallLogs.slice(
    (currentCallPage - 1) * itemsPerPage,
    currentCallPage * itemsPerPage
  );

  const paginatedMessageLogs = filteredMessageLogs.slice(
    (currentMessagePage - 1) * itemsPerPage,
    currentMessagePage * itemsPerPage
  );

  useEffect(() => {
    setCurrentCallPage(1);
    setCurrentMessagePage(1);
  }, [searchQuery]);

  const handleSortSelect = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
    setCurrentCallPage(1);
    setCurrentMessagePage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleNextCallPage = () => {
    if (currentCallPage < totalCallPages) {
      setAnimationState('slide-out-left');
      setTimeout(() => {
        setCurrentCallPage((prev) => prev + 1);
        setAnimationState('slide-in-right');
        setTimeout(() => setAnimationState(''), 300);
      }, 300);
    }
  };

  const handleNextMessagePage = () => {
    if (currentMessagePage < totalMessagePages) {
      setAnimationState('slide-out-left');
      setTimeout(() => {
        setCurrentMessagePage((prev) => prev + 1);
        setAnimationState('slide-in-right');
        setTimeout(() => setAnimationState(''), 300);
      }, 300);
    }
  };

  const handlePrevCallPage = () => {
    if (currentCallPage > 1) {
      setAnimationState('slide-out-right');
      setTimeout(() => {
        setCurrentCallPage((prev) => prev - 1);
        setAnimationState('slide-in-left');
        setTimeout(() => setAnimationState(''), 300);
      }, 300);
    }
  };

  const handlePrevMessagePage = () => {
    if (currentMessagePage > 1) {
      setAnimationState('slide-out-right');
      setTimeout(() => {
        setCurrentMessagePage((prev) => prev - 1);
        setAnimationState('slide-in-left');
        setTimeout(() => setAnimationState(''), 300);
      }, 300);
    }
  };

  return (
    <div className="homepage-container">
      <Sidebar />

      <main className="main-section">
        <h1 className="page-title">Call & Message Logs</h1>

        <div className="tab-buttons-container">
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
          <div className="sort-container" ref={dropdownRef}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              title="Search by customer name"
            />
            <button
              className="sort-button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              title="Sort Options"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4a235a" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M7 12h14" />
                <path d="M11 18h10" />
              </svg>
            </button>
            {showSortDropdown && (
              <div className="sort-dropdown">
                <button onClick={() => handleSortSelect('newest')}>Newest</button>
                <button onClick={() => handleSortSelect('oldest')}>Oldest</button>
                <button onClick={() => handleSortSelect('longest')}>Longest</button>
                <button onClick={() => handleSortSelect('shortest')}>Shortest</button>
              </div>
            )}
          </div>
        </div>

        <div className="table-container">
          {activeTab === 'calls' ? (
            <>
              <div className={`table-wrapper ${animationState}`}>
                <CallsTable callLogs={paginatedCallLogs} />
              </div>
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={handlePrevCallPage}
                  disabled={currentCallPage === 1}
                >
                  Prev
                </button>
                <span className="pagination-info">
                  Page {currentCallPage} of {totalCallPages || 1}
                </span>
                <button
                  className="pagination-button"
                  onClick={handleNextCallPage}
                  disabled={currentCallPage === totalCallPages || totalCallPages === 0}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={`table-wrapper ${animationState}`}>
                <MessagesTable messageLogs={paginatedMessageLogs} />
              </div>
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={handlePrevMessagePage}
                  disabled={currentMessagePage === 1}
                >
                  Prev
                </button>
                <span className="pagination-info">
                  Page {currentMessagePage} of {totalMessagePages || 1}
                </span>
                <button
                  className="pagination-button"
                  onClick={handleNextMessagePage}
                  disabled={currentMessagePage === totalMessagePages || totalMessagePages === 0}
                >
                  Next
                </button>
              </div>
            </>
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
        <th>Phone</th>
        <th>Type</th>
        <th>Start</th>
        <th>End</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      {callLogs.length === 0 ? (
        <tr>
          <td colSpan="7" className="empty-message">
            No call data available
          </td>
        </tr>
      ) : (
        callLogs.map((call) => (
          <tr key={call.cid}>
            <td>{call.createdby}</td>
            <td>{call.fullname}</td>
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
        <th>Phone</th>
        <th>Sent Time</th>
        <th>Word Count</th>
      </tr>
    </thead>
    <tbody>
      {messageLogs.length === 0 ? (
        <tr>
          <td colSpan="5" className="empty-message">
            No message data available
          </td>
        </tr>
      ) : (
        messageLogs.map((msg) => (
          <tr key={msg.cmid}>
            <td>{msg.createdby}</td>
            <td>{msg.fullname}</td>
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