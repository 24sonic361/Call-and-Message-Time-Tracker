import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';


const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Please check your inbox.');
      navigate('/login'); // Navigate back to Login after sending email
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
      alert('Failed to send reset email. Please try again.');
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h1 className="text-center">Reset Password</h1>
          <Form onSubmit={handleResetPassword}>
            <Form.Group controlId="formResetEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3 w-100">
              Send Reset Email
            </Button>

            <div className="text-center mt-3">
              <Link to="/login">Back to Login</Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;
