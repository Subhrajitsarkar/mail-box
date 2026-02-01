import { useState, useMemo } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import useApiClient from "./hooks/useApiClient";

export default function Login({ onLoginSuccess }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const api = useApiClient();

    const isComplete = useMemo(() => {
        return form.email.trim() && form.password.trim();
    }, [form]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!isComplete) {
            setError("All fields are required.");
            return;
        }

        try {
            setIsSubmitting(true);
            const { response, payload } = await api.login({
                email: form.email,
                password: form.password
            });

            if (!response.ok) {
                setError(payload?.message || "Login failed. Please try again.");
                return;
            }

            localStorage.setItem("token", payload.token);
            localStorage.setItem("user", JSON.stringify(payload.user));
            console.log("User has successfully logged in");
            onLoginSuccess();
        } catch (err) {
            setError("Unable to login right now. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="form-wrapper">
            <Card className="signup-card">
                <Card.Body>
                    <h4 className="text-center mb-4">Login</h4>

                    {error && <Alert variant="danger">{error}</Alert>}

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
                        <Button
                            className="w-100 primary-btn"
                            type="submit"
                            disabled={!isComplete || isSubmitting}
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        <a href="#forgot" className="forgot-link">
                            Forgot password
                        </a>
                    </div>
                </Card.Body>
            </Card>

            <Button className="login-btn" variant="outline-secondary">
                Don't have an account? Sign up
            </Button>
        </Container>
    );
}
