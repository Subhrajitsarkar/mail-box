import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { findUserByEmail, verifyPassword, getSecretKey } from "../models/userModel.js";

export const loginUser = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array().map((error) => error.msg).join(" ")
        });
    }

    const { email, password } = req.body;

    const user = findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!verifyPassword(user.password, password)) {
        return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        getSecretKey(),
        { expiresIn: "7d" }
    );

    console.log(`User ${email} has successfully logged in`);

    return res.status(200).json({
        message: "Login successful.",
        token,
        user: { id: user.id, email: user.email }
    });
};
