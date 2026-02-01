import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function Compose({ userEmail, onMailSent, onClose }) {
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSendMail = async () => {
        setError("");
        setSuccess("");

        if (!to.trim()) {
            setError("Recipient email is required.");
            return;
        }

        if (!subject.trim()) {
            setError("Subject is required.");
            return;
        }

        const content = convertToRaw(editorState.getCurrentContent());
        const htmlContent = draftToHtml(content);

        if (htmlContent === "<p></p>\n") {
            setError("Email body cannot be empty.");
            return;
        }

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/api/mail/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    to,
                    subject,
                    body: htmlContent,
                    from: userEmail
                })
            });

            const payload = await response.json();

            if (!response.ok) {
                setError(payload?.message || "Failed to send email.");
                return;
            }

            setSuccess("Email sent successfully!");
            console.log("Mail sent successfully");

            // Reset form
            setTo("");
            setSubject("");
            setEditorState(EditorState.createEmpty());

            setTimeout(() => {
                setSuccess("");
                if (onMailSent) {
                    onMailSent();
                }
            }, 2000);
        } catch (err) {
            setError("Unable to send email. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="compose-container">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form.Group className="mb-3">
                <Form.Control
                    type="email"
                    placeholder="To"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    disabled={isSubmitting}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <div className="editor-wrapper">
                    <Editor
                        editorState={editorState}
                        onEditorStateChange={setEditorState}
                        wrapperClassName="editor-container"
                        editorClassName="editor-content"
                        toolbar={{
                            options: ["inline", "blockType", "fontSize", "list", "textAlign", "history"],
                            inline: {
                                inDropdown: false,
                                options: ["bold", "italic", "underline", "strikethrough"]
                            },
                            blockType: {
                                inDropdown: true,
                                options: ["Normal", "H1", "H2", "H3"]
                            }
                        }}
                        readOnly={isSubmitting}
                    />
                </div>
            </Form.Group>

            <div className="compose-actions">
                <Button
                    variant="primary"
                    onClick={handleSendMail}
                    disabled={isSubmitting}
                    className="send-btn"
                >
                    {isSubmitting ? "Sending..." : "Send"}
                </Button>
            </div>
        </div>
    );
}
