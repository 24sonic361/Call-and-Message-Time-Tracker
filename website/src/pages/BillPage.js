import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import '../styles/HomePage.css'; // Reuse HomePage.css for consistent styling

const BillPage = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: calls, error: callError } = await supabase
        .from('CallLogs')
        .select('*')
        .order('starttime', { ascending: false });
      if (callError) throw callError;

      const { data: messages, error: msgError } = await supabase
        .from('MessageLogs')
        .select('*')
        .order('senttime', { ascending: false });
      if (msgError) throw msgError;

      setCallLogs(calls || []);
      setMessageLogs(messages || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }

  // Combine and group logs by client
  const groupByClient = () => {
    const grouped = {};

    // Process call logs
    callLogs.forEach((call) => {
      const client = call.name || 'Unknown';
      if (!grouped[client]) {
        grouped[client] = { calls: [], messages: [], totalDuration: 0 };
      }
      grouped[client].calls.push(call);
      grouped[client].totalDuration += call.duration || 0;
    });

    // Process message logs
    messageLogs.forEach((msg) => {
      const client = msg.whomessaged || 'Unknown';
      if (!grouped[client]) {
        grouped[client] = { calls: [], messages: [], totalDuration: 0 };
      }
      grouped[client].messages.push(msg);
    });

    return grouped;
  };

  // Filter logs by search term
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
      if (matchesClient || filteredCalls.length > 0 || filteredMessages.length > 0) {
        filtered[client] = {
          calls: filteredCalls,
          messages: filteredMessages,
          totalDuration: filteredCalls.reduce((sum, call) => sum + (call.duration || 0), 0),
        };
      }
    });
    return filtered;
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-GB');
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const groupedLogs = filteredGroupedLogs();
  const totalBillableTime = Object.values(groupedLogs).reduce(
    (sum, group) => sum + group.totalDuration,
    0
  );

  return (
    <Container fluid className="homepage-container">
      <Row>
        <Col md={2}>
          <Sidebar />
        </Col>
        <Col md={10}>
          <main className="main-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title">Billing and Time Tracking</h1>
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                className="gradient-button"
              >
                Back to Home
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
                    <h2 className="text-xl font-semibold mb-3">Time Allocation Summary</h2>
                    <Row>
                      {Object.entries(groupedLogs).map(([client, { totalDuration }]) => (
                        <Col key={client} md={4} className="mb-3">
                          <Card className="shadow-sm">
                            <Card.Body>
                              <Card.Title className="text-lg">{client}</Card.Title>
                              <Card.Text>
                                Total Time: {formatDuration(totalDuration)}
                              </Card.Text>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                    <p className="mt-3 font-semibold">
                      Total Billable Time: {formatDuration(totalBillableTime)}
                    </p>
                  </Card.Body>
                </Card>

                {/* Client Interaction Logs */}
                <Card className="shadow-sm">
                  <Card.Body>
                    <h2 className="text-xl font-semibold mb-3">Client Interaction Logs</h2>
                    {Object.entries(groupedLogs).map(([client, { calls, messages }]) => (
                      <div key={client} className="mb-5">
                        <h3 className="text-lg font-medium mb-2">{client}</h3>
                        <Table striped bordered hover className="styled-table">
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
                        </Table>
                      </div>
                    ))}
                    {Object.keys(groupedLogs).length === 0 && (
                      <p className="text-center">No logs found.</p>
                    )}
                  </Card.Body>
                </Card>
              </>
            )}
          </main>
        </Col>
      </Row>
    </Container>
  );
};

export default BillPage;