import { Container, Navbar, Nav, Button } from "react-bootstrap";

export default function Dashboard({ onLogout }) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        onLogout();
    };

    return (
        <div className="dashboard-page">
            <Navbar className="top-nav" expand="md">
                <Container>
                    <Navbar.Brand className="brand">MyWebLink</Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-nav" />
                    <Navbar.Collapse id="main-nav">
                        <Nav className="ms-auto">
                            <Nav.Link className="nav-link">Home</Nav.Link>
                            <Nav.Link className="nav-link">Products</Nav.Link>
                            <Nav.Link className="nav-link">About Us</Nav.Link>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleLogout}
                                className="ms-3"
                            >
                                Logout
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="dashboard-content">
                <div className="welcome-section">
                    <h2>Welcome to your mailbox</h2>
                    <p className="user-email">Logged in as: {user.email}</p>
                    <div className="mailbox-placeholder">
                        <p>Your mailbox is empty. Start composing or receiving emails!</p>
                    </div>
                </div>
            </Container>
        </div>
    );
}
