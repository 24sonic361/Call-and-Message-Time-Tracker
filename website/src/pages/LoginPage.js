import React, { useState } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/LoginPage.css';
import Swal from 'sweetalert2';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Swal.fire({
        icon: 'success',
        title: 'Welcome!',
        text: 'You have successfully logged in.',
        showConfirmButton: false,
        timer: 1500,
        background: '#fdf7ff',
        color: '#4a235a',
      });
      setTimeout(() => navigate('/'), 1600);
    } catch (error) {
      console.error('Error signing in:', error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Please check your email or password.',
        confirmButtonColor: '#a675b0',
        background: '#fdf7ff',
        color: '#4a235a',
      });
    }
  };

  return (
    <div className="login-background">
      <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
        <h2 className="tracker-title mb-4">Call and Message Time Tracker</h2>
        <Card className="login-card shadow-lg">
          <Card.Body>
            <h3 className="text-center pastel-title mb-4">Welcome Back</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label><FiMail className="me-2" /> Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pastel-input"
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label><FiLock className="me-2" /> Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pastel-input pe-5"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="position-absolute top-50 end-0 translate-middle-y me-3"
                    style={{ cursor: 'pointer', color: '#82489a' }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </Form.Group>

              <Button type="submit" className="mt-4 w-100 gradient-button">
                Login
              </Button>

              <div className="text-center mt-3">
                <Link to="/reset-password" className="pastel-link">
                  Forgot Password?
                </Link>
              </div>

              <div className="text-center mt-2">
                <Link to="/request" className="request-account-button">
                  Request Account
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginPage;
