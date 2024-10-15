import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthProvider';

const ItemAddPage = () => {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [journalName, setJournalName] = useState('');
  const [yearOfPublication, setYearOfPublication] = useState('');
  const [volume, setVolume] = useState('');
  const [number, setNumber] = useState('');
  const [pages, setPages] = useState('');
  const [doi, setDoi] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title,
        authors,
        journalName,
        yearOfPublication,
        volume,
        number,
        pages,
        doi,
        createdAt: new Date(),
        modifiedAt: new Date(),
        createdBy: currentUser.uid,
        modifiedBy: currentUser.uid,
      }
      console.log({data})
      await addDoc(collection(db, 'request'), data);
      navigate('/items'); // Navigate to item list after adding an item
    } catch (error) {
      console.error('Error adding item: ', error);
    }
  };

  return (
    <Container>
      <h1 className="my-4">Finding Articles Request</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formAuthors">
          <Form.Label>Authors</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Authors"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formJournalName">
          <Form.Label>Journal Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Journal Name"
            value={journalName}
            onChange={(e) => setJournalName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formYearOfPublication">
          <Form.Label>Year of Publication</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Year of Publication"
            value={yearOfPublication}
            onChange={(e) => setYearOfPublication(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formVolume">
          <Form.Label>Volume</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formNumber">
          <Form.Label>Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formPages">
          <Form.Label>Pages</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Pages"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formDoi">
          <Form.Label>DOI</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter DOI"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
          />
        </Form.Group>


        <Button variant="primary" type="submit" className="mt-3">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default ItemAddPage;