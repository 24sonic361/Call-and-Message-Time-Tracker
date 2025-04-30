import React, { useRef, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import emailjs from '@emailjs/browser';

// Direct import from EmailJS to test if it works
const SERVICE_ID = 'service_s6eng1c';
const TEMPLATE_ID = 'template_dvrj3at';
const PUBLIC_KEY = 'NpLhHiRe9zuuPabzQ';

const RequestAccountPage = () => {
  const formRef = useRef(null);
  const [status, setStatus] = useState({ success: null, message: '' });

  const sendEmail = async (e) => {
    e.preventDefault();

    try {
      await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        formRef.current,
        PUBLIC_KEY // ✅ ใส่ key ตรงนี้ ไม่ต้องใช้ object
      );

      setStatus({
        success: true,
        message: '✅ Your request has been sent. Please wait for a response from the admin.',
      });

      formRef.current.reset(); // ✅ ล้างฟอร์มหลังส่งเสร็จ
    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus({
        success: false,
        message: '❌ Failed to send request. Please try again later.',
      });
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          <h2>Request New Account</h2>

          {status.message && (
            <Alert variant={status.success ? 'success' : 'danger'}>
              {status.message}
            </Alert>
          )}

          <Form ref={formRef} onSubmit={sendEmail}>
            <Form.Group controlId="user_name">
              <Form.Label>Your Name</Form.Label>
              <Form.Control type="text" name="user_name" required />
            </Form.Group>

            <Form.Group controlId="user_email">
              <Form.Label>Your Email</Form.Label>
              <Form.Control type="email" name="user_email" required />
            </Form.Group>

            <Form.Group controlId="message">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                defaultValue="I would like to request an account."
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              Submit Request
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default RequestAccountPage;
