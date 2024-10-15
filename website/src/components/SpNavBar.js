import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useAuth, signOut } from '../AuthProvider';

function LoginBtn () {
  const { currentUser } = useAuth();
  console.log({currentUser});

  const logout = async (event) => {
    event.preventDefault(); // Prevents the default button behavior
    console.log("Button clicked!");
    await signOut();
  };

  return currentUser ? (
      <>
        <Navbar.Text>Logged in as: {currentUser.email} </Navbar.Text>
        <Button variant="danger" onClick={logout}>Logout</Button>
      </>
    ) : (
      <Nav.Link href="/login">Login</Nav.Link>
    );
}

function SpNavbar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/" >CAMTT</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/items">Requests</Nav.Link>
          </Nav>
          <Nav className="ml-auto">
            <LoginBtn/>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default SpNavbar;