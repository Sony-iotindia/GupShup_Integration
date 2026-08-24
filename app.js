import express from "express";

import { createWhatsAppRouter } from "./routes/whatsapp.routes.js";
import { sendWhatsAppTemplate } from "./services/gupshup.service.js";

export const createApp = ({
    sendTemplate = sendWhatsAppTemplate,
    logger = console
} = {}) => {
    const app = express();

    app.use(express.json());
    app.use("/api/whatsapp", createWhatsAppRouter({ sendTemplate, logger }));

    app.get("/", (req, res) => {
        res.json({ message: "WhatsApp service is running" });
    });

    return app;
};
