import crypto from "node:crypto";

const mails = new Map(); // { mailId: mail object }
const userMails = new Map(); // { email: { inbox: [mailIds], sentbox: [mailIds] } }

export const sendMail = ({ from, to, subject, body }) => {
    const mailId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const mail = {
        id: mailId,
        from,
        to,
        subject,
        body,
        timestamp,
        isRead: false
    };

    // Store mail
    mails.set(mailId, mail);

    // Store mail references for both sender and recipient
    if (!userMails.has(to)) {
        userMails.set(to, { inbox: [], sentbox: [] });
    }
    userMails.get(to).inbox.push(mailId);

    if (!userMails.has(from)) {
        userMails.set(from, { inbox: [], sentbox: [] });
    }
    userMails.get(from).sentbox.push(mailId);

    return mail;
};

export const getInboxMails = (email) => {
    if (!userMails.has(email)) {
        return [];
    }

    const mailIds = userMails.get(email).inbox;
    return mailIds.map((id) => mails.get(id)).filter((mail) => mail);
};

export const getSentboxMails = (email) => {
    if (!userMails.has(email)) {
        return [];
    }

    const mailIds = userMails.get(email).sentbox;
    return mailIds.map((id) => mails.get(id)).filter((mail) => mail);
};

export const getMailById = (mailId) => {
    return mails.get(mailId) || null;
};

export const markAsRead = (mailId) => {
    const mail = mails.get(mailId);
    if (mail) {
        mail.isRead = true;
        return mail;
    }
    return null;
};

export const deleteMail = (mailId, email) => {
    const mail = mails.get(mailId);
    if (!mail) return false;

    if (mail.to === email) {
        const userMail = userMails.get(email);
        userMail.inbox = userMail.inbox.filter((id) => id !== mailId);
    } else if (mail.from === email) {
        const userMail = userMails.get(email);
        userMail.sentbox = userMail.sentbox.filter((id) => id !== mailId);
    }

    mails.delete(mailId);
    return true;
};
