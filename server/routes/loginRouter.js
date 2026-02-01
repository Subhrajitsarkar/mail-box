import { Router } from "express";
import { body } from "express-validator";
import { loginUser } from "../controllers/loginController.js";

const router = Router();

router.post(
    "/login",
    [
        body("email").trim().isEmail().withMessage("A valid email is required."),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required.")
    ],
    loginUser
);

export default router;
