import { Router } from "express";
import { body } from "express-validator";
import { signupUser } from "../controllers/signupController.js";

const router = Router();

router.post(
    "/signup",
    [
        body("email").trim().isEmail().withMessage("A valid email is required."),
        body("password")
            .trim()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters."),
        body("confirmPassword")
            .trim()
            .custom((value, { req }) => value === req.body.password)
            .withMessage("Passwords do not match.")
    ],
    signupUser
);

export default router;
