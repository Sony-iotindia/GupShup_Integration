import express from "express";
import { createSendMessage } from "../controllers/whatsapp.controller.js";

export const createWhatsAppRouter = ({ sendTemplate, logger }) => {
    const router = express.Router();

    router.post(
        "/messages/template",
        createSendMessage({ sendTemplate, logger })
    );

    return router;
};
