import { useEffect, useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import useApiClient from "./hooks/useApiClient";
import useOnMount from "./hooks/useOnMount";
import usePolling from "./hooks/usePolling";

export default function Inbox({ userEmail, onUnreadCountChange }) {
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMail, setSelectedMail] = useState(null);
    const api = useApiClient();

    useOnMount(() => {
        fetchInboxMails();
    });

    usePolling(() => {
        fetchInboxMailsPolled();
    }, 2000);

    useEffect(() => {
        if (onUnreadCountChange) {
            const unreadCount = mails.filter(m => !m.isRead).length;
            onUnreadCountChange(unreadCount);
        }
    }, [mails, onUnreadCountChange]);

    const fetchInboxMails = async () => {
        try {
            setLoading(true);
            setError("");
            const { response, payload } = await api.getInbox();

            if (!response.ok) {
                setError(payload?.message || "Failed to fetch inbox.");
                return;
            }

            setMails(payload.mails || []);
        } catch (err) {
            setError("Unable to fetch inbox. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const fetchInboxMailsPolled = async () => {
        try {
            const { response, payload } = await api.getInbox();

            if (!response.ok) {
                return;
            }

            const newMails = payload.mails || [];

            // Optimize: Only update if there are actual changes
            setMails(prevMails => {
                // Check if we have new mails or if existing mails have changed
                if (newMails.length !== prevMails.length) {
                    return newMails;
                }

                // Check if any mail has changed (read status, new mail arrived, etc.)
                const hasChanges = newMails.some((newMail, index) => {
                    const prevMail = prevMails[index];
                    return !prevMail ||
                        newMail.id !== prevMail.id ||
                        newMail.isRead !== prevMail.isRead;
                });

                return hasChanges ? newMails : prevMails;
            });
        } catch (err) {
            // Silently fail for polling to avoid console spam
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

    const handleMailClick = async (mail) => {
        setSelectedMail(mail);

        // Mark as read if unread
        if (!mail.isRead) {
            try {
                await api.markMailAsRead(mail.id);

                // Update local state
                setMails(mails.map(m =>
                    m.id === mail.id ? { ...m, isRead: true } : m
                ));
            } catch (err) {
                console.error("Failed to mark as read:", err);
            }
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
                <p className="mt-2">Loading inbox...</p>
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
                        Back to Inbox
                    </Button>

                    <div className="mail-header">
                        <h5>{selectedMail.subject}</h5>
                        <div className="mail-meta">
                            <p className="mb-1">
                                <strong>From:</strong> {selectedMail.from}
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
                    <p className="text-muted">No emails in your inbox.</p>
                </div>
            ) : (
                <div>
                    {mails.map((mail) => (
                        <div
                            key={mail.id}
                            className={`mail-item ${!mail.isRead ? "unread" : ""}`}
                        >
                            <div className="d-flex align-items-start w-100">
                                {!mail.isRead && (
                                    <div className="blue-dot me-2"></div>
                                )}
                                <div
                                    className="flex-grow-1 mail-item-content"
                                    onClick={() => handleMailClick(mail)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <strong className="d-block">{mail.from}</strong>
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
