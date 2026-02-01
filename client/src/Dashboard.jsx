import { useState, useEffect } from "react";
import { Container, Navbar, Nav, Button, Modal, ListGroup, Badge } from "react-bootstrap";
import Compose from "./Compose";
import Inbox from "./Inbox";
import Sentbox from "./Sentbox";

export default function Dashboard({ onLogout }) {
    const [activeView, setActiveView] = useState("inbox");
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/mail/inbox", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const unread = data.mails.filter(mail => !mail.isRead).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Failed to fetch unread count:", err);
        }
    };

    const handleMailRead = () => {
        fetchUnreadCount();
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        onLogout();
    };

    const handleMailSent = () => {
        setShowComposeModal(false);
        setActiveView("sent");
    };

    return (
        <div className="dashboard-page">
            <Navbar className="mail-navbar" expand="md">
                <Container fluid>
                    <Navbar.Brand className="brand">MyWebLink Mail</Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-nav" />
                    <Navbar.Collapse id="main-nav">
                        <Nav className="ms-auto">
                            <span className="user-email-nav">{user.email}</span>
                            <Button
                                variant="outline-light"
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

            <div className="mail-layout">
                <div className="mail-sidebar">
                    <Button
                        className="compose-btn-sidebar"
                        onClick={() => setShowComposeModal(true)}
                    >
                        Compose
                    </Button>

                    <ListGroup variant="flush" className="folder-list">
                        <ListGroup.Item
                            action
                            active={activeView === "inbox"}
                            onClick={() => setActiveView("inbox")}
                            className="folder-item"
                        >
                            <i className="bi bi-inbox-fill me-2"></i>
                            Inbox
                            {unreadCount > 0 && (
                                <Badge bg="primary" pill className="ms-2">
                                    {unreadCount > 999 ? "999+" : unreadCount}
                                </Badge>
                            )}
                        </ListGroup.Item>
                        <ListGroup.Item
                            action
                            active={activeView === "sent"}
                            onClick={() => setActiveView("sent")}
                            className="folder-item"
                        >
                            <i className="bi bi-send-fill me-2"></i>
                            Sent
                        </ListGroup.Item>
                    </ListGroup>
                </div>

                <div className="mail-content">
                    <div className="mail-header">
                        <h4>{activeView === "inbox" ? "Inbox" : "Sent"}</h4>
                    </div>
                    <div className="mail-body">
                        {activeView === "inbox" && <Inbox userEmail={user.email} onMailRead={handleMailRead} />}
                        {activeView === "sent" && <Sentbox userEmail={user.email} />}
                    </div>
                </div>
            </div>

            <Modal
                show={showComposeModal}
                onHide={() => setShowComposeModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Compose New Email</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Compose
                        userEmail={user.email}
                        onMailSent={handleMailSent}
                        onClose={() => setShowComposeModal(false)}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
}
