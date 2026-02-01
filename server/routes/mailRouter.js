import { Router } from "express";
import {
    sendMailHandler,
    getInboxHandler,
    getSentboxHandler,
    getMailHandler,
    deleteMailHandler
} from "../controllers/mailController.js";

const router = Router();

router.post("/mail/send", sendMailHandler);
router.get("/mail/inbox", getInboxHandler);
router.get("/mail/sentbox", getSentboxHandler);
router.get("/mail/:mailId", getMailHandler);
router.delete("/mail/:mailId", deleteMailHandler);

export default router;
