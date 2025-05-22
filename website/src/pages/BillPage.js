// BillPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Form,Button,Card,Row,Col,} from "react-bootstrap";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import  "../styles/HomePage.css"; // Importing HomePage.css for general styles (e.g., homepage-container)
import  "../styles/BillPage.css"; // Importing BillPage.css for specific layout/overrides

const BillPage = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setname] = useState("");
  const [whocalled, setPhoneNumber] = useState("");
  const [starttime, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const billingRatePerMinute = 4.0; // $4.00 per minute for calls
  const [messageLogs, setMessageLogs] = useState([]);
  const billingRatePerWord = 4.0; // $4.00 per word for messages
  const [whomessaged, setPhNumber] = useState("");
  const [senttime, setsenttime] = useState("");

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

      if (starttime) {
        callQuery = callQuery.gte("starttime", starttime);
      }
      //if (endDate) {
      //  callQuery = callQuery.lte("endtime", endDate);
      //}

      if (name) {
        callQuery = callQuery.eq("name", name);
      }
      if (whocalled) {
        callQuery = callQuery.eq("phone_number", whocalled);
      }

      const { data: calls, error: callError } = await callQuery;
      if (callError) {
        console.error("Error fetching call logs:", callError);
        throw callError;
      }

      let messageQuery = supabase
        .from("MessageLogs")
        .select("*")
        .order("senttime", { ascending: false });

      if (senttime) {
        messageQuery = messageQuery.gte("senttime", senttime);
      }
      if (endDate) {
        messageQuery = messageQuery.lte("senttime", endDate);
      }

      if (whomessaged) {
        messageQuery = messageQuery.eq("whomessaged", PhNumber);
      }
      //if () {
      //  messageQuery = messageQuery.eq("phone_number", phoneNumber);
      //}

      const { data: messages, error: msgError } = await messageQuery;
      if (msgError) {
        console.error("Error fetching message logs:", msgError);
        throw msgError;
      }

      setCallLogs(calls || []);
      setMessageLogs(messages || []);
    } catch (error) {
      // General error handling if needed
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
          totalMessageWords: 0, // New: to store total words from messages
          messageBillableAmount: 0, // New: to store billable amount for messages
          totalFees: 0, // New: combined fees
          phoneNumber: call.phone_number || 'N/A'
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
          phoneNumber: msg.phone_number || 'N/A'
        };
      }
      grouped[client].messages.push(msg);
      grouped[client].totalMessageWords += msg.wordcount || 0; // Sum word count
      grouped[client].messageBillableAmount =
        grouped[client].totalMessageWords * billingRatePerWord; // Calculate message fees
    });

    // Calculate total fees for each client
    Object.keys(grouped).forEach(client => {
        grouped[client].totalFees = grouped[client].callBillableAmount + grouped[client].messageBillableAmount;
    });

    return grouped;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0 minute 0 second"; // Changed N/A to 0 minute 0 second
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute ${remainingSeconds} second`;
  };

  const groupedLogs = groupByClient();

  return (
    <div className="homepage-container"> {/* Uses homepage-container from HomePage.css */}
      <Sidebar />
      <main className="main-section centered-content"> {/* main-section for content area, centered-content for centering */}
        <div className="page-header-area">
          <h1 className="page-title">Billing:</h1> {/* Updated title as per image */}
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
                  <Form.Label>Name:</Form.Label> {/* Label as per image */}
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
                  <Form.Label>Phone Number:</Form.Label> {/* Label as per image */}
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
                  <Form.Label>Start Time:</Form.Label> {/* Label as per image */}
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
                  <Form.Label>End Time:</Form.Label> {/* Label as per image */}
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
                  fetchData(); // Re-fetch data after clearing filters
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
          <>
            {/* Bill Summary Section */}
            <Card className="bill-summary-card shadow-sm">
              <Card.Body>
                <h2 className="bill-summary-title">
                  Bill Summary
                </h2>
                {Object.keys(groupedLogs).length > 0 ? (
                  Object.entries(groupedLogs).map(
                    ([
                      client,
                      {
                        totalCallDuration,
                        totalMessageWords, // Use totalMessageWords
                        totalFees, // Use totalFees
                        phoneNumber: clientPhoneNumber
                      },
                    ]) => (
                      <div key={client} className="client-bill-details mb-4">
                        <p className="summary-item">Name: <span className="summary-value">{client}</span></p>
                        <p className="summary-item">Phone Number: <span className="summary-value">{clientPhoneNumber}</span></p>
                        <p className="summary-item">Total Time Calling: <span className="summary-value">{formatDuration(totalCallDuration)}</span></p>
                        <p className="summary-item">Total Message: <span className="summary-value">{totalMessageWords} words</span></p>
                        <p className="summary-item">Fees: <span className="summary-value">${totalFees.toFixed(2)}</span></p>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-center">No billing data found for the selected criteria.</p>
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