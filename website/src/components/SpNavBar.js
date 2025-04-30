import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, signOut } from '../AuthProvider';

function SpNavbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (event) => {
    event.preventDefault();
    await signOut();
    navigate('/login');
  };

  const handleHelp = () => {
    navigate('/help');
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/">CAMTT</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/request">Requests</Nav.Link>
          </Nav>
          <Nav className="ml-auto d-flex align-items-center">
            {currentUser ? (
              <>
                <Navbar.Text className="me-2">
                  Logged in as: {currentUser.email}
                </Navbar.Text>
                <Button variant="danger" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button variant="outline-info" onClick={handleHelp}>Help</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default SpNavbar;
