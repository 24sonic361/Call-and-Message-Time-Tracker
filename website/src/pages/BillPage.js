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
  const [messageLogs, setMessageLogs] = useState([]);
  // Removed searchTerm state as it's no longer used for UI filtering
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const billingRate = 4.0; // $4.00 per minute

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
          totalMessageCount: 0,
          phoneNumber: call.phone_number || 'N/A' // Store phone number with client group
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
          phoneNumber: msg.phone_number || 'N/A' // Store phone number with client group
        };
      }
      grouped[client].messages.push(msg);
      grouped[client].totalMessageCount += 1;
    });
    return grouped;
  };

  // Removed filteredGroupedLogs function as searchTerm is no longer used for UI filtering
  // const filteredGroupedLogs = () => {
  //   const grouped = groupByClient();
  //   return grouped;
  // };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const groupedLogs = groupByClient(); // Directly use groupByClient as filtering is done in fetchData
  // Total calculations are still useful for overall summary if needed, but not displayed in this version.
  // const totalBillableTime = Object.values(groupedLogs).reduce(
  //   (sum, group) => sum + group.totalCallDuration,
  //   0
  // );
  // const totalBillAmount = Object.values(groupedLogs).reduce(
  //   (sum, group) => sum + group.callBillableAmount,
  //   0
  // );
  // const totalMessages = Object.values(groupedLogs).reduce(
  //   (sum, group) => sum + group.totalMessageCount,
  //   0
  // );

  return (
    <div className="homepage-container"> {/* Uses homepage-container from HomePage.css */}
      <Sidebar />
      <main className="main-section centered-content"> {/* main-section for content area, centered-content for centering */}
        <div className="page-header-area">
          <h1 className="page-title">Bill</h1>
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
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Client Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="form-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Phone Number"
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
                  <Form.Label>Start Time</Form.Label>
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
                  <Form.Label>End Time</Form.Label>
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
                        callBillableAmount,
                        totalMessageCount,
                        phoneNumber: clientPhoneNumber // Destructure phone number from grouped data
                      },
                    ]) => (
                      <div key={client} className="client-bill-details mb-4">
                        <p className="summary-item">Name: <span className="summary-value">{client}</span></p>
                        <p className="summary-item">Phone Number: <span className="summary-value">{clientPhoneNumber}</span></p>
                        <p className="summary-item">Total Calling Time: <span className="summary-value">{formatDuration(totalCallDuration)}</span></p>
                        <p className="summary-item">Total Message: <span className="summary-value">{totalMessageCount} words</span></p>
                        <p className="summary-item">Fees: <span className="summary-value">${callBillableAmount.toFixed(2)}</span></p>
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