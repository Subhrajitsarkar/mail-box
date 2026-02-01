import { useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import useApiClient from "./hooks/useApiClient";
import useOnMount from "./hooks/useOnMount";

export default function Sentbox({ userEmail }) {
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMail, setSelectedMail] = useState(null);
    const api = useApiClient();

    useOnMount(() => {
        fetchSentboxMails();
    });

    const fetchSentboxMails = async () => {
        try {
            setLoading(true);
            setError("");
            const { response, payload } = await api.getSentbox();

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
            const { response } = await api.deleteMail(mailId);

            if (response.ok) {
                setMails(mails.filter((mail) => mail.id !== mailId));
                setSelectedMail(null);
            }
        } catch (err) {
            setError("Failed to delete mail.");
        }
    };

    const stripHtml = (html) => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || "";
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
            <Card className="mail-detail-card">
                <Card.Body>
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
                </Card.Body>
            </Card>
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
                        >
                            <div className="d-flex align-items-start w-100">
                                <div
                                    className="flex-grow-1 mail-item-content"
                                    onClick={() => setSelectedMail(mail)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <strong className="d-block">To: {mail.to}</strong>
                                            <span className="text-dark fw-semibold">{mail.subject}</span>
                                            <p className="text-muted small mb-0 mail-preview">
                                                {stripHtml(mail.body).substring(0, 100)}...
                                            </p>
                                        </div>
                                        <small className="text-muted ms-3">
                                            {new Date(mail.timestamp).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="ms-2 mail-delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMail(mail.id);
                                    }}
                                    title="Delete email"
                                >
                                    <i className="bi bi-trash"></i>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
