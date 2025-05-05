import React, { useRef } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';
import '../styles/LoginPage.css'; // ใช้ CSS เดียวกับ LoginPage

const SERVICE_ID = 'service_s6eng1c';
const TEMPLATE_ID = 'template_dvrj3at';
const PUBLIC_KEY = 'NpLhHiRe9zuuPabzQ';

const RequestAccountPage = () => {
  const formRef = useRef(null);

  const sendEmail = async (e) => {
    e.preventDefault();
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY);
      Swal.fire({
        icon: 'success',
        title: 'Request Sent!',
        text: 'Please wait for a response from the admin.',
        showConfirmButton: false,
        timer: 2000,
        background: '#fdf7ff',
        color: '#4a235a',
      });
      formRef.current.reset();
    } catch (error) {
      console.error('EmailJS Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Send Failed',
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
        <h2 className="tracker-title mb-4">Request New Account</h2>
        <Card className="login-card shadow-lg">
          <Card.Body>
            <Form ref={formRef} onSubmit={sendEmail}>
              <Form.Group controlId="user_name" className="mb-3">
                <Form.Label>Your Name</Form.Label>
                <Form.Control type="text" name="user_name" required className="pastel-input" />
              </Form.Group>

              <Form.Group controlId="user_email" className="mb-3">
                <Form.Label>Your Email</Form.Label>
                <Form.Control type="email" name="user_email" required className="pastel-input" />
              </Form.Group>

              <Form.Group controlId="message" className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="message"
                  defaultValue="I would like to request an account."
                  className="pastel-input"
                />
              </Form.Group>

              <Button type="submit" className="w-100 gradient-button mt-2">
                Submit Request
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default RequestAccountPage;
