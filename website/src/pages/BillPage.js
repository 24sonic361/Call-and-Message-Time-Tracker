import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Table,Form,Button,Card,Row,Col,} from "react-bootstrap";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import  "../styles/HomePage.css";
import "../styles/BillPage.css";



const BillPage = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const billingRate = 4.0;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let callQuery = supabase
        .from("CallLogs")
        .select("*")
        .order("starttime", { ascending: false });

      if (startDate) {
        callQuery = callQuery.gte("starttime", startDate);
      }
      if (endDate) {
        callQuery = callQuery.lte("endtime", endDate);
      }

      if (clientName) {
        callQuery = callQuery.eq("name", clientName);
      }
      if (phoneNumber) {
        callQuery = callQuery.eq("phone_number", phoneNumber);
      }

      const { data: calls, error: callError } = await callQuery;
      if (callError) {
        console.error("Error fetching call logs:", callError);
        // Swal.fire({  //Removed Swal
        //   icon: "error",
        //   title: "Error",
        //   text: "Failed to fetch call logs. Please try again.",
        //   confirmButtonColor: "#a675b0",
        // });
        throw callError;
      }

      let messageQuery = supabase
        .from("MessageLogs")
        .select("*")
        .order("senttime", { ascending: false });
      if (startDate) {
        messageQuery = messageQuery.gte("senttime", startDate);
      }
      if (endDate) {
        messageQuery = messageQuery.lte("senttime", endDate);
      }

      if (clientName) {
        messageQuery = messageQuery.eq("whomessaged", clientName);
      }
      if (phoneNumber) {
        messageQuery = messageQuery.eq("phone_number", phoneNumber);
      }

      const { data: messages, error: msgError } = await messageQuery;
      if (msgError) {
        console.error("Error fetching message logs:", msgError);
        // Swal.fire({  //Removed Swal
        //   icon: "error",
        //   title: "Error",
        //   text: "Failed to fetch message logs. Please try again.",
        //   confirmButtonColor: "#a675b0",
        // });
        throw msgError;
      }

      setCallLogs(calls || []);
      setMessageLogs(messages || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const groupByClient = () => {
    const grouped = {};

    callLogs.forEach((call) => {
      const client = call.name || "Unknown";
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
      const client = msg.whomessaged || "Unknown";
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
      const matchesClient =
        client.toLowerCase().includes(searchTerm.toLowerCase());
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
            (sum, call) =>
              sum + ((call.duration || 0) / 60) * billingRate,
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

        <Row className="mb-4">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Client Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Filter by Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
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
        <div className="button-group">
          <Button onClick={fetchData} className="mr-2 gradient-button">
            Apply Filters
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setClientName("");
              setPhoneNumber("");
              setStartDate("");
              setEndDate("");
              fetchData();
            }}
            className="clear-button"
          >
            Clear Filters
          </Button>
        </div>

        <Form.Group className="mb-4">
          <Form.Control
            type="text"
            placeholder="Search by client..."
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
            <Card className="mb-4 shadow-sm">
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
            <Card className="shadow-sm">
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
                              <th>Client</th>
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
                  <p className="text-center">No logs found.</p>
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