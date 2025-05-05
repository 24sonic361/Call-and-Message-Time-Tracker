import React, { useState } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoginPage.css';
import { FiMail } from 'react-icons/fi';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: 'Check your inbox for password reset instructions.',
        showConfirmButton: false,
        timer: 2000,
        background: '#fdf7ff',
        color: '#4a235a',
      });
      setTimeout(() => navigate('/login'), 2100);
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Send',
        text: 'Please try again later.',
        confirmButtonColor: '#a675b0',
        background: '#fdf7ff',
        color: '#4a235a',
      });
    }
  };

  return (
    <div className="login-background">
      <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
        <h2 className="tracker-title mb-4">Reset Password</h2>
        <Card className="login-card shadow-lg">
          <Card.Body>
            <h4 className="text-center pastel-title mb-4">Enter your email</h4>
            <Form onSubmit={handleResetPassword}>
              <Form.Group controlId="formResetEmail">
                <Form.Label><FiMail className="me-2" /> Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pastel-input"
                  required
                />
              </Form.Group>

              <Button type="submit" className="mt-4 w-100 gradient-button">
                Send Reset Email
              </Button>

              <div className="text-center mt-3">
                <Link to="/login" className="pastel-link">Back to Login</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ResetPasswordPage;
