// BillPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import "../styles/HomePage.css"; // Importing HomePage.css for general styles (e.g., homepage-container)
import "../styles/BillPage.css"; // Importing BillPage.css for specific layout/overrides
import Swal from "sweetalert2"; // For user-friendly alerts
import { useAuth } from '../AuthProvider'; // Assuming AuthProvider gives access to current user details

const BillPage = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states for UI inputs
  const [customerName, setCustomerName] = useState(""); // For "Name" input
  const [phoneNumberFilter, setPhoneNumberFilter] = useState(""); // For "Phone Number" input
  const [startDate, setStartDate] = useState(""); // For "Start Time" input
  const [endDate, setEndDate] = useState(""); // For "End Time" input

  const navigate = useNavigate();
  const billingRatePerMinute = 4.0; // $4.00 per minute for calls
  const billingRatePerWord = 4.0; // $4.00 per word for messages

  const { currentUser } = useAuth(); // Get current user from AuthProvider (if needed for user-specific data)

  // useEffect hook to fetch data when component mounts or filter states change
  useEffect(() => {
    fetchData();
  }, [customerName, phoneNumberFilter, startDate, endDate]); // Dependencies for re-fetching

  // Fetch all calls and messages from customers
  const fetchData = async () => {
    setLoading(true);
    try {
      let targetPhoneNumbers = [];
      let customerPhoneToNameMap = {}; // Map to store phone number -> fullname

      // --- Step 1: Get a mapping of all customer phone numbers to their full names ---
      const { data: allCustomers, error: allCustomersError } = await supabase
        .from('Customers')
        .select('phonenumber, fullname');

      if (allCustomersError) {
        console.error('Error fetching all customer names for mapping:', allCustomersError);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to retrieve customer names. Please try again.',
          confirmButtonColor: '#a675b0',
        });
        setCallLogs([]);
        setMessageLogs([]);
        setLoading(false);
        return;
      }

      allCustomers.forEach(cust => {
        customerPhoneToNameMap[cust.phonenumber] = cust.fullname;
      });

      // --- Step 2: Determine which specific phone numbers to filter logs by, based on user input ---
      if (customerName || phoneNumberFilter) {
        // If specific customer name or phone number is provided, filter the Customers table
        let filteredCustomerQuery = supabase.from('Customers').select('phonenumber');

        if (customerName) {
          filteredCustomerQuery = filteredCustomerQuery.eq('fullname', customerName);
        }
        if (phoneNumberFilter) {
          filteredCustomerQuery = filteredCustomerQuery.eq('phonenumber', phoneNumberFilter);
        }

        const { data: filteredCustomerData, error: filteredCustomerError } = await filteredCustomerQuery;

        if (filteredCustomerError) {
          console.error('Error fetching filtered customer phone numbers:', filteredCustomerError);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch filtered customer details. Please try again.',
            confirmButtonColor: '#a675b0',
          });
          setCallLogs([]);
          setMessageLogs([]);
          setLoading(false);
          return;
        }

        targetPhoneNumbers = filteredCustomerData.map((customer) => customer.phonenumber);

        // If a specific customer was searched but no match was found, clear logs and return
        if (targetPhoneNumbers.length === 0) {
            setCallLogs([]);
            setMessageLogs([]);
            setLoading(false);
            return;
        }

      } else {
        // If no specific filter is provided, use all customer phone numbers from the map
        targetPhoneNumbers = Object.keys(customerPhoneToNameMap);
      }

      // --- Step 3: Fetch Call Logs using the determined targetPhoneNumbers and date filters ---
      let callQuery = supabase
        .from("CallLogs")
        .select("*")
        .order("starttime", { ascending: false });

      if (targetPhoneNumbers.length > 0) {
        callQuery = callQuery.in('whocalled', targetPhoneNumbers); // Filter by the numbers
      } else { // No phone numbers to filter by, so no logs will be found
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

      const { data: calls, error: callError } = await callQuery;
      if (callError) {
        console.error("Error fetching call logs:", callError);
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

      // --- Step 4: Fetch Message Logs using the determined targetPhoneNumbers and date filters ---
      let messageQuery = supabase
        .from("MessageLogs")
        .select("*")
        .order("senttime", { ascending: false });

      if (targetPhoneNumbers.length > 0) {
        messageQuery = messageQuery.in('whomessaged', targetPhoneNumbers); // Filter by the numbers
      } else { // No phone numbers to filter by, so no logs will be found
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

      const { data: messages, error: msgError } = await messageQuery;
      if (msgError) {
        console.error("Error fetching message logs:", msgError);
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

      // Pass the customerPhoneToNameMap to groupByClient
      setCallLogs(calls ? calls.map(call => ({ ...call, customerNameFromMap: customerPhoneToNameMap[call.whocalled] })) : []);
      setMessageLogs(messages ? messages.map(msg => ({ ...msg, customerNameFromMap: customerPhoneToNameMap[msg.whomessaged] })) : []);


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
      // Use the name from the map, falling back to 'Unknown' if not found
      const clientNameForGrouping = call.customerNameFromMap || call.name || "Unknown";
      const clientPhoneNumber = call.whocalled || 'N/A';

      if (!grouped[clientNameForGrouping]) {
        grouped[clientNameForGrouping] = {
          calls: [],
          messages: [],
          totalCallDuration: 0,
          callBillableAmount: 0,
          totalMessageWords: 0,
          messageBillableAmount: 0,
          totalFees: 0,
          phoneNumber: clientPhoneNumber,
        };
      }
      grouped[clientNameForGrouping].calls.push(call);
      grouped[clientNameForGrouping].totalCallDuration += call.duration || 0;
      grouped[clientNameForGrouping].callBillableAmount =
        (grouped[clientNameForGrouping].totalCallDuration / 60) * billingRatePerMinute;
      // Ensure phoneNumber is updated if a call log has a more specific number
      if (grouped[clientNameForGrouping].phoneNumber === 'N/A' || grouped[clientNameForGrouping].phoneNumber !== clientPhoneNumber) {
        grouped[clientNameForGrouping].phoneNumber = clientPhoneNumber;
      }
    });

    messageLogs.forEach((msg) => {
      // Use the name from the map, falling back to 'Unknown' if not found
      const clientNameForGrouping = msg.customerNameFromMap || msg.whomessaged || "Unknown";
      const clientPhoneNumber = msg.whomessaged || 'N/A'; // Assuming whomessaged is the phone number

      if (!grouped[clientNameForGrouping]) {
        grouped[clientNameForGrouping] = {
          calls: [],
          messages: [],
          totalCallDuration: 0,
          callBillableAmount: 0,
          totalMessageWords: 0,
          messageBillableAmount: 0,
          totalFees: 0,
          phoneNumber: clientPhoneNumber,
        };
      }
      grouped[clientNameForGrouping].messages.push(msg);
      grouped[clientNameForGrouping].totalMessageWords += msg.wordcount || 0;
      grouped[clientNameForGrouping].messageBillableAmount =
        grouped[clientNameForGrouping].totalMessageWords * billingRatePerWord;
      // Ensure phoneNumber is updated if a message log has a more specific number
      if (grouped[clientNameForGrouping].phoneNumber === 'N/A' || grouped[clientNameForGrouping].phoneNumber !== clientPhoneNumber) {
        grouped[clientNameForGrouping].phoneNumber = clientPhoneNumber;
      }
    });

    // Calculate total fees for each client
    Object.keys(grouped).forEach(client => {
      grouped[client].totalFees = grouped[client].callBillableAmount + grouped[client].messageBillableAmount;
    });

    return grouped;
  };

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return "0 minute 0 second";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute ${remainingSeconds} second`;
  };

  // Removed searchTerm state and filteredGroupedLogs function
  const groupedLogs = groupByClient();


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
    // fetchData is already triggered by useEffect when filter states change,
    // so simply letting the state updates trigger it is sufficient.
    // This button primarily validates dates and then relies on useEffect.
  };

  const handleClearFilters = () => {
    setCustomerName("");
    setPhoneNumberFilter("");
    setStartDate("");
    setEndDate("");
    // Removed setSearchTerm('') as searchTerm state is removed
    // No need to call fetchData explicitly here, useEffect will handle it
  };


  return (
    <div className="homepage-container"> {/* Uses homepage-container from HomePage.css */}
      <Sidebar />
      <main className="main-section centered-content"> {/* main-section for content area, centered-content for centering */}
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
                  <Form.Label>Customer Name:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone Number:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter phone number"
                    value={phoneNumberFilter}
                    onChange={(e) => setPhoneNumberFilter(e.target.value)}
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
              <Button onClick={handleApplyFilters} className="apply-button">
                Apply
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleClearFilters}
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
                      client, // This is the customer's fullname from the map
                      {
                        totalCallDuration,
                        totalMessageWords,
                        totalFees,
                        phoneNumber: clientPhoneNumber, // This is the phone number associated with the logs
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
        {/* Removed Client Interaction Logs section as requested */}
      </main>
    </div>
  );
};

export default BillPage;
