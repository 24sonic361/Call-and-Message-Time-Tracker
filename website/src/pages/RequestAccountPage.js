import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';

const RequestAccountPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ success: null, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/request-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ success: true, message: 'Request sent to admin. Please wait for approval.' });
        setEmail('');
      } else {
        throw new Error(data.message || 'Request failed');
      }
    } catch (error) {
      setStatus({ success: false, message: error.message });
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          <h2>Request New Account</h2>
          {status.message && (
            <Alert variant={status.success ? 'success' : 'danger'}>{status.message}</Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="email">
              <Form.Label>Your Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" className="mt-3">Submit Request</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default RequestAccountPage;
