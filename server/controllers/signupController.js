import { validationResult } from "express-validator";
import { createUser, findUserByEmail } from "../models/userModel.js";

export const signupUser = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array().map((error) => error.msg).join(" ")
        });
    }

    const { email, password } = req.body;

    if (findUserByEmail(email)) {
        return res.status(409).json({ message: "Email is already registered." });
    }

    createUser({ email, password });
    console.log("User has successfully signed up");

    return res.status(201).json({ message: "Signup successful." });
};
