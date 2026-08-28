import express from "express";
import { createSendMessage } from "../controllers/whatsapp.controller.js";
import { createWhatsAppWebhook } from "../webhooks/whatsapp.webhook.js";

export const createWhatsAppRouter = ({ sendTemplate, logger }) => {
    const router = express.Router();

    router.post("/send", createSendMessage({ sendTemplate, logger }));
    router.post("/webhook", createWhatsAppWebhook({ logger }));

    return router;
};
