import express from "express";
import {
    sendMessage
} from "../controllers/whatsapp.controller.js";
import { whatsappWebhook } from "../webhooks/whatsapp.webhook.js";

const router = express.Router();

router.post("/send", sendMessage);
router.post("/webhook", whatsappWebhook);


export default router;