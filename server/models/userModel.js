import crypto from "node:crypto";

const users = new Map();
const SECRET_KEY = "your-secret-key-change-this";

export const findUserByEmail = (email) => {
    if (!email) {
        return null;
    }
    return users.get(email.toLowerCase()) || null;
};

export const createUser = ({ email, password }) => {
    const normalizedEmail = email.toLowerCase();
    const user = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        password,
        createdAt: new Date().toISOString()
    };
    users.set(normalizedEmail, user);
    return user;
};

export const verifyPassword = (storedPassword, providedPassword) => {
    return storedPassword === providedPassword;
};

export const getSecretKey = () => SECRET_KEY;