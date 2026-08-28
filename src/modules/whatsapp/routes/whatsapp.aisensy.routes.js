import express from "express";
import { createSendAiSensyMessage } from "../controllers/whatsapp.aisensy.controller.js";

export const createAiSensyWhatsAppRouter = ({ sendAiSensyTemplate, logger }) => {
    const router = express.Router();

    router.post("/messages/template", createSendAiSensyMessage({
        sendAiSensyTemplate,
        logger
    }));

    return router;
};
