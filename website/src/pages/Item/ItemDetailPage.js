import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const ItemDetailPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const itemRef = doc(db, 'request', id);
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          console.log('request loaded', {data: itemSnap.data()})
          setItem({ id: itemSnap.id, ...itemSnap.data() });
        } else {
          console.error('No such item!');
        }
      } catch (error) {
        console.error('Error fetching item details: ', error);
      }
    };

    fetchItem();
  }, [id]);

  if (!item) return <p>Loading request details...</p>;

  return (
    <Container>
      <h1 className="my-4">{item.title}</h1>
      <Card>
        <Card.Body>
          <Card.Text><strong>Authors:</strong> {item.authors}</Card.Text>
          <Card.Text><strong>Journal Name:</strong> {item.journalName}</Card.Text>
          <Card.Text><strong>Year of Publication:</strong> {item.yearOfPublication}</Card.Text>
          <Card.Text><strong>Volume:</strong> {item.volume}</Card.Text>
          <Card.Text><strong>Number:</strong> {item.number}</Card.Text>
          <Card.Text><strong>Pages:</strong> {item.pages}</Card.Text>
          <Card.Text><strong>DOI:</strong> {item.doi}</Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ItemDetailPage;