import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, signOut } from "../AuthProvider";
import Swal from "sweetalert2";
import "../styles/Navbar.css";

function SpNavbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (event) => {
    event.preventDefault();
    await signOut();
    navigate("/login");
  };

  const handleHelp = () => {
    Swal.fire({
      icon: "info",
      title: "Need Help?",
      html: `
        <p>If you're having any issues, please contact us:</p>
        <p><strong>vgm1309@autuni.ac.nz</strong></p>
      `,
      confirmButtonText: "Got it!",
      confirmButtonColor: "#a675b0",
      background: "#fdf7ff",
      color: "#4a235a",
    });
  };

  return (
    <Navbar expand="lg" className="pastel-navbar">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="brand-title d-flex align-items-center"
        >
          <img
            src="/CAMTT-icon02.png"
            alt="CAMTT Logo"
            style={{
              height: "30px",
              marginRight: "10px",
            }}
          />
          CAMTT
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto"></Nav>
          <Nav className="ml-auto d-flex align-items-center">
            {currentUser ? (
              <>
                <Navbar.Text className="me-3 pastel-user">
                  Logged in as: <strong>{currentUser.email}</strong>
                </Navbar.Text>
                <Button className="pastel-logout-button" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button className="pastel-help-button" onClick={handleHelp}>
                Help
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default SpNavbar;
