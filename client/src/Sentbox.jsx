import { useEffect, useState } from "react";
import { Alert, Button, ListGroup, Spinner } from "react-bootstrap";

export default function Sentbox({ userEmail }) {
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMail, setSelectedMail] = useState(null);

    useEffect(() => {
        fetchSentboxMails();
    }, []);

    const fetchSentboxMails = async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/api/mail/sentbox", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const payload = await response.json();

            if (!response.ok) {
                setError(payload?.message || "Failed to fetch sentbox.");
                return;
            }

            setMails(payload.mails || []);
        } catch (err) {
            setError("Unable to fetch sentbox. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMail = async (mailId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:5000/api/mail/${mailId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                setMails(mails.filter((mail) => mail.id !== mailId));
                setSelectedMail(null);
            }
        } catch (err) {
            setError("Failed to delete mail.");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading sentbox...</p>
            </div>
        );
    }

    if (selectedMail) {
        return (
            <div className="mail-detail-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setSelectedMail(null)}
                    className="mb-3"
                >
                    Back to Sentbox
                </Button>

                <div className="mail-header">
                    <h5>{selectedMail.subject}</h5>
                    <div className="mail-meta">
                        <p className="mb-1">
                            <strong>To:</strong> {selectedMail.to}
                        </p>
                        <p className="mb-1">
                            <strong>Date:</strong> {new Date(selectedMail.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="mail-body border-top pt-3">
                    <div dangerouslySetInnerHTML={{ __html: selectedMail.body }} />
                </div>

                <div className="mt-4">
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteMail(selectedMail.id)}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mail-list-container">
            {error && <Alert variant="danger" className="m-3">{error}</Alert>}

            {mails.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">No emails in your sentbox.</p>
                </div>
            ) : (
                <div>
                    {mails.map((mail) => (
                        <div
                            key={mail.id}
                            className="mail-item"
                            onClick={() => setSelectedMail(mail)}
                        >
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <strong className="d-block">To: {mail.to}</strong>
                                        <span className="text-dark">{mail.subject}</span>
                                    </div>
                                    <small className="text-muted">
                                        {new Date(mail.timestamp).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
