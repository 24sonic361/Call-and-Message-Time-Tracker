// BillPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import "../styles/HomePage.css"; // Importing HomePage.css for general styles
import "../styles/BillPage.css"; // Importing BillPage.css for specific layout

const BillPage = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const billingRatePerMinute = 4.0; // $4.00 per minute for calls
  const billingRatePerWord = 2.0; // $2.00 per word for messages

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

      if (clientName) callQuery = callQuery.eq("name", clientName);
      if (phoneNumber) callQuery = callQuery.eq("phone_number", phoneNumber);
      if (startDate) callQuery = callQuery.gte("starttime", startDate);
      if (endDate) callQuery = callQuery.lte("endtime", endDate);

      const { data: calls, error: callError } = await callQuery;
      if (callError) throw callError;

      let messageQuery = supabase
        .from("MessageLogs")
        .select("*")
        .order("senttime", { ascending: false });

      if (clientName) messageQuery = messageQuery.eq("whomessaged", clientName);
      if (phoneNumber) messageQuery = messageQuery.eq("phone_number", phoneNumber);
      if (startDate) messageQuery = messageQuery.gte("senttime", startDate);
      if (endDate) messageQuery = messageQuery.lte("senttime", endDate);

      const { data: messages, error: msgError } = await messageQuery;
      if (msgError) throw msgError;

      setCallLogs(calls || []);
      setMessageLogs(messages || []);
    } catch (error) {
      console.error("Error fetching data:", error);
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
          totalMessageWords: 0,
          messageBillableAmount: 0,
          totalFees: 0,
          phoneNumber: call.phone_number || "N/A",
        };
      }
      grouped[client].calls.push(call);
      grouped[client].totalCallDuration += call.duration || 0;
      grouped[client].callBillableAmount =
        (grouped[client].totalCallDuration / 60) * billingRatePerMinute;
    });

    messageLogs.forEach((msg) => {
      const client = msg.whomessaged || "Unknown";
      if (!grouped[client]) {
        grouped[client] = {
          calls: [],
          messages: [],
          totalCallDuration: 0,
          callBillableAmount: 0,
          totalMessageWords: 0,
          messageBillableAmount: 0,
          totalFees: 0,
          phoneNumber: msg.phone_number || "N/A",
        };
      }
      grouped[client].messages.push(msg);
      grouped[client].totalMessageWords += msg.wordcount || 0;
      grouped[client].messageBillableAmount =
        grouped[client].totalMessageWords * billingRatePerWord;
    });

    Object.keys(grouped).forEach((client) => {
      grouped[client].totalFees =
        grouped[client].callBillableAmount + grouped[client].messageBillableAmount;
    });

    return grouped;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0 minute 0 second";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute ${remainingSeconds} second`;
  };

  const groupedLogs = groupByClient();

  return (
    <div className="homepage-container">
      <Sidebar />
      <main className="main-section centered-content">
        <div className="page-header-area">
          <h1 className="page-title">Billing:</h1>
          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="home-button"
          >
            Home
          </Button>
        </div>

        <Card className="filter-card shadow-sm mb-4">
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="form-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone Number:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Time:</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Time:</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="button-group">
              <Button onClick={fetchData} className="apply-button">
                Apply
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setClientName("");
                  setPhoneNumber("");
                  setStartDate("");
                  setEndDate("");
                  fetchData(); // Refetch data with cleared filters
                }}
                className="clear-button"
              >
                Clear
              </Button>
            </div>
          </Card.Body>
        </Card>

        {loading ? (
          <p className="text-center">Loading bill summary...</p>
        ) : (
          <Card className="bill-summary-card shadow-sm">
            <Card.Body>
              <h2 className="bill-summary-title">Bill Summary</h2>
              {Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(
                  ([
                    client,
                    {
                      totalCallDuration,
                      totalMessageWords,
                      totalFees,
                      phoneNumber: clientPhoneNumber,
                    },
                  ]) => (
                    <div key={client} className="client-bill-details mb-4">
                      <p className="summary-item">
                        Name: <span className="summary-value">{client}</span>
                      </p>
                      <p className="summary-item">
                        Phone Number:{" "}
                        <span className="summary-value">{clientPhoneNumber}</span>
                      </p>
                      <p className="summary-item">
                        Total Time Calling:{" "}
                        <span className="summary-value">
                          {formatDuration(totalCallDuration)}
                        </span>
                      </p>
                      <p className="summary-item">
                        Total Message:{" "}
                        <span className="summary-value">{totalMessageWords} words</span>
                      </p>
                      <p className="summary-item">
                        Fees: <span className="summary-value">${totalFees.toFixed(2)}</span>
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-center">No billing data found for the selected criteria.</p>
              )}
            </Card.Body>
          </Card>
        )}
      </main>
    </div>
  );
};

export default BillPage;