import jwt from "jsonwebtoken";
import { sendMail, getInboxMails, getSentboxMails, getMailById, markAsRead, deleteMail } from "../models/mailModel.js";
import { getSecretKey } from "../models/userModel.js";

export const sendMailHandler = (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Token required." });
        }

        const decoded = jwt.verify(token, getSecretKey());
        const { to, subject, body } = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({ message: "To, subject, and body are required." });
        }

        const mail = sendMail({
            from: decoded.email,
            to,
            subject,
            body
        });

        console.log(`Mail sent from ${decoded.email} to ${to}`);
        return res.status(201).json({ message: "Mail sent successfully.", mail });
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        res.status(500).json({ message: "Failed to send mail." });
    }
};

export const getInboxHandler = (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Token required." });
        }

        const decoded = jwt.verify(token, getSecretKey());
        const mails = getInboxMails(decoded.email);

        return res.status(200).json({ mails });
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        res.status(500).json({ message: "Failed to fetch inbox." });
    }
};

export const getSentboxHandler = (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Token required." });
        }

        const decoded = jwt.verify(token, getSecretKey());
        const mails = getSentboxMails(decoded.email);

        return res.status(200).json({ mails });
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        res.status(500).json({ message: "Failed to fetch sentbox." });
    }
};

export const getMailHandler = (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Token required." });
        }

        jwt.verify(token, getSecretKey());
        const { mailId } = req.params;
        const mail = getMailById(mailId);

        if (!mail) {
            return res.status(404).json({ message: "Mail not found." });
        }

        if (!mail.isRead) {
            markAsRead(mailId);
        }

        return res.status(200).json({ mail });
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        res.status(500).json({ message: "Failed to fetch mail." });
    }
};

export const deleteMailHandler = (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Token required." });
        }

        const decoded = jwt.verify(token, getSecretKey());
        const { mailId } = req.params;

        const deleted = deleteMail(mailId, decoded.email);

        if (!deleted) {
            return res.status(404).json({ message: "Mail not found or cannot be deleted." });
        }

        return res.status(200).json({ message: "Mail deleted successfully." });
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        res.status(500).json({ message: "Failed to delete mail." });
    }
};
