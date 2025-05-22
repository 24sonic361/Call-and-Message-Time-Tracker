import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Table,Form,Button,Card,Row,Col,} from "react-bootstrap";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import "../styles/BillPage.css";
import Swal from "sweetalert2";
import { useAuth } from "../AuthProvider"; // Import useAuth

const BillPage = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullname, setCustomername] = useState(""); // Changed from clientName to fullname
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const billingRate = 4.0; // $4.00 per minute

  const { currentUser } = useAuth(); // Get current user from AuthProvider

  useEffect(() => {
    fetchData();
  }, [fullname, phoneNumber, startDate, endDate]); // Updated dependency from clientName to fullname

  // Fetch all calls and messages from customers
  const fetchData = async () => {
    setLoading(true);
    try {
      let phoneNumbers = [];

      // Logic to fetch phone numbers based on fullname or phoneNumber filter
      if (fullname || phoneNumber) { // Changed from clientName to fullname
        let customerQuery = supabase.from('Customers').select('phonenumber');
        if (fullname) { // Changed from clientName to fullname
          customerQuery = customerQuery.eq('fullname', fullname); // Filtering by 'fullname' in Customers table
        }
        if (phoneNumber) {
          customerQuery = customerQuery.eq('phonenumber', phoneNumber);
        }

        const { data: customerData, error: customerError } = await customerQuery;

        if (customerError) {
          console.error('Error fetching customer phone numbers:', customerError);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch customer details. Please try again.',
            confirmButtonColor: '#a675b0',
          });
          setCallLogs([]);
          setMessageLogs([]);
          setLoading(false);
          return;
        }
        phoneNumbers = customerData.map((customer) => customer.phonenumber);
      } else {
        // If no specific fullname or phoneNumber is provided, fetch all customer phone numbers
        const { data: allCustomerPhones, error: allCustomerError } = await supabase
          .from('Customers')
          .select('phonenumber');

        if (allCustomerError) {
          console.error('Error fetching all customer phone numbers:', allCustomerError);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch all customer phone numbers. Please try again.',
            confirmButtonColor: '#a675b0',
          });
          setCallLogs([]);
          setMessageLogs([]);
          setLoading(false);
          return;
        }
        phoneNumbers = allCustomerPhones.map((customer) => customer.phonenumber);
      }

      // Fetch all client calls using the determined phoneNumbers
      let callQuery = supabase
        .from("CallLogs")
        .select("*")
        .order("starttime", { ascending: false });

      if (phoneNumbers.length > 0) {
        callQuery = callQuery.in('whocalled', phoneNumbers);
      } else if (fullname || phoneNumber) { // Changed from clientName to fullname
        // If specific client/phone was searched but no matching phoneNumbers found
        setCallLogs([]);
        setMessageLogs([]);
        setLoading(false);
        return;
      }


      if (startDate) {
        callQuery = callQuery.gte("starttime", startDate);
      }
      if (endDate) {
        callQuery = callQuery.lte("endtime", endDate);
      }

      const { data: calls, error: callsError } = await callQuery;
      if (callsError) {
        console.error("Error fetching call logs:", callsError);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch call logs. Please try again.",
          confirmButtonColor: "#a675b0",
        });
        setCallLogs([]);
        setMessageLogs([]);
        setLoading(false);
        return;
      }

      // Fetch all client messages using the determined phoneNumbers
      let messageQuery = supabase
        .from("MessageLogs")
        .select("*")
        .order("senttime", { ascending: false });

      if (phoneNumbers.length > 0) {
        messageQuery = messageQuery.in('whomessaged', phoneNumbers);
      } else if (fullname || phoneNumber) { // Changed from clientName to fullname
        // If specific client/phone was searched but no matching phoneNumbers found
        setCallLogs([]);
        setMessageLogs([]);
        setLoading(false);
        return;
      }

      if (startDate) {
        messageQuery = messageQuery.gte("senttime", startDate);
      }
      if (endDate) {
        messageQuery = messageQuery.lte("senttime", endDate);
      }

      const { data: messages, error: messagesError } = await messageQuery;
      if (messagesError) {
        console.error("Error fetching message logs:", messagesError);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch message logs. Please try again.",
          confirmButtonColor: "#a675b0",
        });
        setCallLogs([]);
        setMessageLogs([]);
        setLoading(false);
        return;
      }

      setCallLogs(calls || []);
      setMessageLogs(messages || []);

    } catch (error) {
      console.error("An unexpected error occurred in fetchData:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        confirmButtonColor: "#a675b0",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupByClient = () => {
    const grouped = {};

    callLogs.forEach((call) => {
      const client = call.name || "Unknown"; // 'name' from CallLogs is assumed to be the customer's full name
      if (!grouped[client]) {
        grouped[client] = {
          calls: [],
          messages: [],
          totalCallDuration: 0,
          callBillableAmount: 0,
          totalMessageCount: 0,
        };
      }
      grouped[client].calls.push(call);
      grouped[client].totalCallDuration += call.duration || 0;
      grouped[client].callBillableAmount =
        (grouped[client].totalCallDuration / 60) * billingRate;
    });

    messageLogs.forEach((msg) => {
      const client = msg.whomessaged || "Unknown"; // 'whomessaged' from MessageLogs is assumed to be the customer's full name
      if (!grouped[client]) {
        grouped[client] = {
          calls: [],
          messages: [],
          totalCallDuration: 0,
          callBillableAmount: 0,
          totalMessageCount: 0,
        };
      }
      grouped[client].messages.push(msg);
      grouped[client].totalMessageCount += 1;
    });
    return grouped;
  };

  const filteredGroupedLogs = () => {
    const grouped = groupByClient();
    const filtered = {};
    Object.entries(grouped).forEach(([client, data]) => {
      const matchesClient = client.toLowerCase().includes(searchTerm.toLowerCase());
      const filteredCalls = data.calls.filter((call) =>
        call.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filteredMessages = data.messages.filter((msg) =>
        msg.whomessaged?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (
        matchesClient ||
        filteredCalls.length > 0 ||
        filteredMessages.length > 0
      ) {
        filtered[client] = {
          calls: filteredCalls,
          messages: filteredMessages,
          totalCallDuration: filteredCalls.reduce(
            (sum, call) => sum + (call.duration || 0),
            0
          ),
          callBillableAmount: filteredCalls.reduce(
            (sum, call) => sum + ((call.duration || 0) / 60) * billingRate,
            0
          ),
          totalMessageCount: data.messages.length,
        };
      }
    });
    return filtered;
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-GB");
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleApplyFilters = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Date Range',
        text: 'End date cannot be earlier than start date.',
        confirmButtonColor: '#a675b0',
      });
      return;
    }
    fetchData(); // Trigger data fetch with current filter states
  };

  const handleClearFilters = () => {
    setCustomername(''); // Changed from setClientName to setCustomername
    setPhoneNumber('');
    setStartDate('');
    setEndDate('');
    setSearchTerm(''); // Clear search term as well
    // fetchData will be triggered by the useEffect due to state changes
  };

  const groupedLogs = filteredGroupedLogs();
  const totalBillableTime = Object.values(groupedLogs).reduce(
    (sum, group) => sum + group.totalCallDuration,
    0
  );
  const totalBillAmount = Object.values(groupedLogs).reduce(
    (sum, group) => sum + group.callBillableAmount,
    0
  );
  const totalMessages = Object.values(groupedLogs).reduce(
    (sum, group) => sum + group.totalMessageCount,
    0
  );

  return (
    <div className="billpage-container">
      <Sidebar />
      <main className="main-section">
        <div className="d-flex justify-content-between align-items-center mb-4 page-title-area">
          <h1 className="page-title">Billing and Time Tracking</h1>
          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="gradient-button"
          >
            Back to Home
          </Button>
        </div>

        <Row className="mb-4 filter-section">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Customer Name</Form.Label> {/* Label updated */}
              <Form.Control
                type="text"
                placeholder="Filter by Customer Name"
                value={fullname} // Changed from clientName to fullname
                onChange={(e) => setCustomername(e.target.value)} // Changed from setClientName to setCustomername
                className="pastel-input"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Filter by Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pastel-input"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pastel-input"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pastel-input"
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex mb-4">
            <Button onClick={handleApplyFilters} className="gradient-button me-2">
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="secondary">
              Clear Filters
            </Button>
        </div>


        <Form.Group className="mb-4 search-bar">
          <Form.Control
            type="text"
            placeholder="Search by customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pastel-input"
          />
        </Form.Group>

        {loading ? (
          <p className="text-center">Loading logs...</p>
        ) : (
          <>
            {/* Time Allocation Summary */}
            <Card className="mb-4 shadow-sm time-allocation-summary">
              <Card.Body>
                <h2 className="text-xl font-semibold mb-3">
                  Time Allocation Summary
                </h2>
                <Row>
                  {Object.entries(groupedLogs).map(
                    ([
                      client,
                      {
                        totalCallDuration,
                        callBillableAmount,
                        totalMessageCount,
                      },
                    ]) => (
                      <Col key={client} md={4} className="mb-3">
                        <Card className="client-summary-card shadow-sm">
                          <Card.Body>
                            <Card.Title className="text-lg">
                              {client}
                            </Card.Title>
                            <Card.Text>
                              Total Call Time:{" "}
                              {formatDuration(totalCallDuration)}
                            </Card.Text>
                            <Card.Text>
                              Call Billable Amount: $
                              {callBillableAmount.toFixed(2)}
                            </Card.Text>
                            <Card.Text>
                              Total Messages: {totalMessageCount}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  )}
                </Row>
                <p className="mt-3 font-semibold">
                  Total Billable Time: {formatDuration(totalBillableTime)}
                </p>
                <p className="mt-3 font-semibold">
                  Total Call Bill Amount: ${totalBillAmount.toFixed(2)}
                </p>
                <p className="mt-3 font-semibold">
                  Total Messages: {totalMessages}
                </p>
              </Card.Body>
            </Card>

            {/* Client Interaction Logs */}
            <Card className="shadow-sm client-interaction-logs">
              <Card.Body>
                <h2 className="text-xl font-semibold mb-3">
                  Client Interaction Logs
                </h2>
                {Object.entries(groupedLogs).map(
                  ([client, { calls, messages }]) => (
                    <div key={client} className="mb-5">
                      <h3 className="text-lg font-medium mb-2">{client}</h3>
                      <div className="table-container">
                        <table className="client-interaction-table">
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Customer</th>
                              <th>Timestamp</th>
                              <th>Duration</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {calls.map((call) => (
                              <tr key={call.cid}>
                                <td>Call</td>
                                <td>{call.name}</td>
                                <td>{formatDateTime(call.starttime)}</td>
                                <td>{formatDuration(call.duration)}</td>
                                <td>{call.type}</td>
                              </tr>
                            ))}
                            {messages.map((msg) => (
                              <tr key={msg.cmid}>
                                <td>Message</td>
                                <td>{msg.whomessaged}</td>
                                <td>{formatDateTime(msg.senttime)}</td>
                                <td>N/A</td>
                                <td>Word Count: {msg.wordcount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                )}
                {Object.keys(groupedLogs).length === 0 && (
                  <p className="text-center no-logs-message">No logs found.</p>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default BillPage;
