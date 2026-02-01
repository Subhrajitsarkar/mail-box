import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Container, Form, Navbar, Nav } from "react-bootstrap";
import Login from "./Login";
import Dashboard from "./Dashboard";

const initialState = {
    email: "",
    password: "",
    confirmPassword: ""
};

export default function App() {
    const [page, setPage] = useState("signup"); // signup, login, dashboard
    const [form, setForm] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setPage("dashboard");
        }
    }, []);

    const isComplete = useMemo(() => {
        return form.email.trim() && form.password.trim() && form.confirmPassword.trim();
    }, [form]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!isComplete) {
            setError("All fields are required.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch("http://localhost:5000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    confirmPassword: form.confirmPassword
                })
            });

            const payload = await response.json();

            if (!response.ok) {
                setError(payload?.message || "Signup failed. Please try again.");
                return;
            }

            setSuccess("Account created successfully. You can now login.");
            console.log("User has successfully signed up");
            setForm(initialState);
            setTimeout(() => {
                setPage("login");
                setSuccess("");
            }, 2000);
        } catch (err) {
            setError("Unable to sign up right now. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (page === "dashboard") {
        return <Dashboard onLogout={() => setPage("signup")} />;
    }

    if (page === "login") {
        return (
            <div className="signup-page">
                <Navbar className="top-nav" expand="md">
                    <Container>
                        <Navbar.Brand className="brand">MyWebLink</Navbar.Brand>
                        <Navbar.Toggle aria-controls="main-nav" />
                        <Navbar.Collapse id="main-nav">
                            <Nav className="ms-auto">
                                <Nav.Link className="nav-link">Home</Nav.Link>
                                <Nav.Link className="nav-link">Products</Nav.Link>
                                <Nav.Link className="nav-link">About Us</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <div className="blue-wave" aria-hidden="true" />

                <Login
                    onLoginSuccess={() => {
                        setPage("dashboard");
                    }}
                />

                <div className="text-center mt-3">
                    <button
                        className="btn btn-link"
                        onClick={() => {
                            setPage("signup");
                            setError("");
                            setSuccess("");
                        }}
                    >
                        Don't have an account? Sign up
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="signup-page">
            <Navbar className="top-nav" expand="md">
                <Container>
                    <Navbar.Brand className="brand">MyWebLink</Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-nav" />
                    <Navbar.Collapse id="main-nav">
                        <Nav className="ms-auto">
                            <Nav.Link className="nav-link">Home</Nav.Link>
                            <Nav.Link className="nav-link">Products</Nav.Link>
                            <Nav.Link className="nav-link">About Us</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="blue-wave" aria-hidden="true" />

            <Container className="form-wrapper">
                <Card className="signup-card">
                    <Card.Body>
                        <h4 className="text-center mb-4">SignUp</h4>

                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="password">
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="confirmPassword">
                                <Form.Control
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Button
                                className="w-100 primary-btn"
                                type="submit"
                                disabled={!isComplete || isSubmitting}
                            >
                                {isSubmitting ? "Signing up..." : "Sign up"}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>

                <Button
                    className="login-btn"
                    variant="outline-secondary"
                    onClick={() => {
                        setPage("login");
                        setError("");
                        setSuccess("");
                    }}
                >
                    Have an account? Login
                </Button>
            </Container>
        </div>
    );
}
