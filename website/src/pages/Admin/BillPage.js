// BillPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Card, Row, Col } from "react-bootstrap";
import { supabase } from "../../supabaseClient";
import Sidebar from "../../components/Sidebar";
import "../../styles/HomePage.css"; // Importing HomePage.css for general styles (e.g., homepage-container)
import "../../styles/BillPage.css"; // Importing BillPage.css for specific layout/overrides
import Swal from "sweetalert2"; // For user-friendly alerts
import { useAuth } from "../../AuthProvider"; // Assuming AuthProvider gives access to current user details

const BillPage = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [allCustomerNames, setAllCustomerNames] = useState([]); // 存储所有客户姓名
  const [showSuggestions, setShowSuggestions] = useState(false); // 控制建议列表显示
  const [filteredSuggestions, setFilteredSuggestions] = useState([]); // 过滤后的建议列表

  // Filter states for UI inputs
  const [customerName, setCustomerName] = useState(""); // For "Customer Name" input
  const [phoneNumberFilter, setPhoneNumberFilter] = useState(""); // For "Phone Number" input
  const [startDate, setStartDate] = useState(""); // For "Start Time" input
  const [endDate, setEndDate] = useState(""); // For "End Time" input


  const navigate = useNavigate();
  const billingRatePerMinute = 4.0; // $4.00 per minute for calls
  const billingRatePerWord = 4.0; // $4.00 per word for messages

  const { currentUser } = useAuth(); // Get current user from AuthProvider (if needed for user-specific data)

  // useEffect hook to fetch data when component mounts or filter states change
  // This ensures data is fetched on initial load and whenever filter values change.
useEffect(() => {
  console.log("useEffect triggered. Fetching data...");
  fetchData();
}, [customerName, phoneNumberFilter, startDate, endDate]);

useEffect(() => {
  const fetchCustomerNames = async () => {
    const { data, error } = await supabase
      .from("Customers")
      .select("fullname, phonenumber");
    
    if (error) {
      console.error("Error fetching customer names:", error);
      return;
    }
    
    const uniqueNames = [...new Map(data.map(item => 
       [item.fullname, item.phonenumber]))].map(([fullname, phonenumber]) => ({
        fullname,
        phonenumber
      })).sort((a, b) => a.fullname.localeCompare(b.fullname));
    
    setAllCustomerNames(uniqueNames);
  };

  fetchCustomerNames();
}, []);

  // Fetch all calls and messages from customers
  const fetchData = async () => {
    setLoading(true);
    try {
      let targetPhoneNumbers = [];
      let customerPhoneToNameMap = {}; // Map to store phone number -> fullname

      console.log("--- Starting fetchData ---");
      console.log("Current Filters:", {
        customerName,
        phoneNumberFilter,
        startDate,
        endDate,
      });

      // --- Step 1: Get a mapping of all customer phone numbers to their full names ---
      console.log("Fetching all customers for phone-to-name mapping...");
      const { data: allCustomers, error: allCustomersError } = await supabase
        .from("Customers")
        .select("phonenumber, fullname");

      if (allCustomersError) {
        console.error(
          "Error fetching all customer names for mapping:",
          allCustomersError
        );
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to retrieve customer names. Please try again.",
          confirmButtonColor: "#a675b0",
        });
        setCallLogs([]);
        setMessageLogs([]);
        setLoading(false);
        return;
      }
      console.log("All Customers fetched:", allCustomers);

      allCustomers.forEach((cust) => {
        customerPhoneToNameMap[cust.phonenumber] = cust.fullname;
      });
      console.log("Customer Phone to Name Map:", customerPhoneToNameMap);

      // --- Step 2: Determine which specific phone numbers to filter logs by, based on user input ---
      if (customerName || phoneNumberFilter) {
        console.log("Filtering customers based on input...");
        let filteredCustomerQuery = supabase
          .from("Customers")
          .select("phonenumber");

        if (customerName) {
          filteredCustomerQuery = filteredCustomerQuery.eq(
            "fullname",
            customerName
          );
          console.log("Filtering by fullname:", customerName);
        }
        if (phoneNumberFilter) {
          filteredCustomerQuery = filteredCustomerQuery.eq(
            "phonenumber",
            phoneNumberFilter
          );
          console.log("Filtering by phonenumber:", phoneNumberFilter);
        }

        const { data: filteredCustomerData, error: filteredCustomerError } =
          await filteredCustomerQuery;

        if (filteredCustomerError) {
          console.error(
            "Error fetching filtered customer phone numbers:",
            filteredCustomerError
          );
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch filtered customer details. Please try again.",
            confirmButtonColor: "#a675b0",
          });
          setCallLogs([]);
          setMessageLogs([]);
          setLoading(false);
          return;
        }
        console.log("Filtered Customer Data:", filteredCustomerData);

        targetPhoneNumbers = filteredCustomerData.map(
          (customer) => customer.phonenumber
        );

        // If a specific customer was searched but no match was found, clear logs and return
        if (targetPhoneNumbers.length === 0) {
          console.warn(
            "No matching customers found for the given filters. Clearing logs."
          );
          setCallLogs([]);
          setMessageLogs([]);
          setLoading(false);
          return;
        }
      } else {
        console.log(
          "No specific customer filter provided. Using all customer phone numbers."
        );
        // If no specific filter is provided, use all customer phone numbers from the map
        targetPhoneNumbers = Object.keys(customerPhoneToNameMap);
      }
      console.log("Target Phone Numbers for logs:", targetPhoneNumbers);

      // --- Step 3: Fetch Call Logs using the determined targetPhoneNumbers and date filters ---
      let callQuery = supabase
        .from("CallLogs")
        .select("*")
        .order("starttime", { ascending: false });

      if (targetPhoneNumbers.length > 0) {
        callQuery = callQuery.in("whocalled", targetPhoneNumbers); // Filter by the numbers
        console.log("CallLogs query with 'whocalled' in:", targetPhoneNumbers);
      } else {
        // This case should ideally be caught by the previous check, but as a fallback
        console.warn(
          "No target phone numbers for CallLogs. Clearing call logs."
        );
        setCallLogs([]);
        setMessageLogs([]); // Clear messages too if no calls
        setLoading(false);
        return;
      }

      if (startDate) {
        callQuery = callQuery.gte("starttime", startDate);
        console.log("CallLogs query with starttime GTE:", startDate);
      }
      if (endDate) {
        callQuery = callQuery.lte("endtime", endDate);
        console.log("CallLogs query with endtime LTE:", endDate);
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
      console.log("Fetched Call Logs:", calls);

      // --- Step 4: Fetch Message Logs using the determined targetPhoneNumbers and date filters ---
      let messageQuery = supabase
        .from("MessageLogs")
        .select("*")
        .order("senttime", { ascending: false });

      if (targetPhoneNumbers.length > 0) {
        messageQuery = messageQuery.in("whomessaged", targetPhoneNumbers); // Filter by the numbers
        console.log(
          "MessageLogs query with 'whomessaged' in:",
          targetPhoneNumbers
        );
      } else {
        // This case should ideally be caught by the previous check, but as a fallback
        console.warn(
          "No target phone numbers for MessageLogs. Clearing message logs."
        );
        setCallLogs([]);
        setMessageLogs([]); // Clear calls too if no messages
        setLoading(false);
        return;
      }

      if (startDate) {
        messageQuery = messageQuery.gte("senttime", startDate);
        console.log("MessageLogs query with senttime GTE:", startDate);
      }
      if (endDate) {
        messageQuery = messageQuery.lte("senttime", endDate);
        console.log("MessageLogs query with senttime LTE:", endDate);
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
      console.log("Fetched Message Logs:", messages);

      // Pass the customerPhoneToNameMap to groupByClient
      const mappedCalls = calls
        ? calls.map((call) => ({
            ...call,
            customerNameFromMap: customerPhoneToNameMap[call.whocalled],
          }))
        : [];
      const mappedMessages = messages
        ? messages.map((msg) => ({
            ...msg,
            customerNameFromMap: customerPhoneToNameMap[msg.whomessaged],
          }))
        : [];

      console.log("Mapped Call Logs (with customerNameFromMap):", mappedCalls);
      console.log(
        "Mapped Message Logs (with customerNameFromMap):",
        mappedMessages
      );

      setCallLogs(mappedCalls);
      setMessageLogs(mappedMessages);
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
      console.log("--- fetchData finished ---");
    }
  };

    const handleCustomerNameChange = (e) => {
  const input = e.target.value;
  setCustomerName(input);
  
  if (input.length > 0) {
    const filtered = allCustomerNames.filter(customer => 
      customer.fullname.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
  } else {
    setShowSuggestions(false);
  }
};

const handleSuggestionClick = (customer) => {
  setCustomerName(customer.fullname);
  setPhoneNumberFilter(customer.phonenumber);
  setShowSuggestions(false);
};


  const groupByClient = () => {
    const grouped = {};

    callLogs.forEach((call) => {
      // Use the name from the map, falling back to 'Unknown' if not found
      const clientNameForGrouping =
        call.customerNameFromMap || call.name || "Unknown";
      const clientPhoneNumber = call.whocalled || "N/A";

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
        (grouped[clientNameForGrouping].totalCallDuration / 60) *
        billingRatePerMinute;
      // Ensure phoneNumber is updated if a call log has a more specific number
      if (
        grouped[clientNameForGrouping].phoneNumber === "N/A" ||
        grouped[clientNameForGrouping].phoneNumber !== clientPhoneNumber
      ) {
        grouped[clientNameForGrouping].phoneNumber = clientPhoneNumber;
      }
    });

  
    messageLogs.forEach((msg) => {
      // Use the name from the map, falling back to 'Unknown' if not found
      const clientNameForGrouping =
        msg.customerNameFromMap || msg.whomessaged || "Unknown";
      const clientPhoneNumber = msg.whomessaged || "N/A"; // Assuming whomessaged is the phone number

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
      if (
        grouped[clientNameForGrouping].phoneNumber === "N/A" ||
        grouped[clientNameForGrouping].phoneNumber !== clientPhoneNumber
      ) {
        grouped[clientNameForGrouping].phoneNumber = clientPhoneNumber;
      }
    });

    // Calculate total fees for each client
    Object.keys(grouped).forEach((client) => {
      grouped[client].totalFees =
        grouped[client].callBillableAmount +
        grouped[client].messageBillableAmount;
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
  // The groupedLogs will now always reflect the data fetched by fetchData
  const groupedLogs = groupByClient();

  const handleApplyFilters = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Date Range",
        text: "End date cannot be earlier than start date.",
        confirmButtonColor: "#a675b0",
      });
      return;
    }
    // Explicitly call fetchData to ensure a refresh when "Apply" is clicked
    // This is important because useEffect only triggers on state changes,
    // but if the user clicks Apply without changing inputs, fetchData won't run.
    fetchData();
  };

  const handleClearFilters = () => {
    setCustomerName("");
    setPhoneNumberFilter("");
    setStartDate("");
    setEndDate("");
    setShowSuggestions(false); 
    // No need to call fetchData explicitly here, useEffect will handle it
    // because the state changes will trigger the useEffect.
  };

  return (
    <div className="homepage-container">
      {" "}
      {/* Uses homepage-container from HomePage.css */}
      <Sidebar />
      <main className="billmain-section centered-content">
        {" "}
        {/* main-section for content area, centered-content for centering */}
        <div className="billpage-header-area">
          <h1 className="billpage-title">Admin - Bill Calculation</h1>
          <div className="billbutton-group">
            <button
              variant="primary"
              onClick={() => navigate("/")}
              className="home-button"
            >
              Home
            </button>
            <button
              variant="primary"
              onClick={() => navigate("/user")}
              className="user-button"
            >
              User Management Page
            </button>
          </div>
        </div>
        <Card className="filter-card shadow-sm mb-4">
          <Card.Body>
            <h2 className="bill-summary-title">Filtering</h2>
            <Row className="mb-3">
<Col md={6}>
  <Form.Group className="position-relative">
    <Form.Label>Customer Name:</Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter customer name"
      value={customerName}
      onChange={handleCustomerNameChange}
      className="form-input"
      autoComplete="off"
    />
    {showSuggestions && filteredSuggestions.length > 0 && (
      <div className="suggestion-list">
        {filteredSuggestions.map((customer, index) => (
          <div 
            key={index}
            className="suggestion-item"
            onClick={() => handleSuggestionClick(customer)}
          >
            {customer.fullname} ({customer.phonenumber})
          </div>
        ))}
      </div>
    )}
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
            <div className="billbutton-group">
              <button onClick={handleApplyFilters} className="apply-button">
                Apply
              </button>
              <button
                variant="outline-secondary"
                onClick={handleClearFilters}
                className="clear-button"
              >
                Clear
              </button>
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
                <h2 className="bill-summary-title">Bill Summary</h2>
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
                        <p className="summary-item">
                          Name: <span className="summary-value">{client}</span>
                        </p>
                        <p className="summary-item">
                          Phone Number:{" "}
                          <span className="summary-value">
                            {clientPhoneNumber}
                          </span>
                        </p>
                        <p className="summary-item">
                          Total Time Calling:{" "}
                          <span className="summary-value">
                            {formatDuration(totalCallDuration)}
                          </span>
                        </p>
                        <p className="summary-item">
                          Total Message:{" "}
                          <span className="summary-value">
                            {totalMessageWords} words
                          </span>
                        </p>
                        <p className="summary-item">
                          Fees:{" "}
                          <span className="summary-value">
                            ${totalFees.toFixed(2)}
                          </span>
                        </p>
                        <div className="bills-divider"></div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-center">
                    No billing data found for the selected criteria.
                  </p>
                )}
              </Card.Body>
            </Card>
          </>
        )}
        {/* Client Interaction Logs section removed as requested */}
      </main>
    </div>
  );
};

export default BillPage;
