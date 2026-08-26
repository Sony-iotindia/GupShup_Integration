import express from "express";

import { createEmailRouter } from "./routes/email.routes.js";
import { createWhatsAppRouter } from "./routes/whatsapp.routes.js";
import { sendWhatsAppTemplate } from "./services/gupshup.service.js";
import { sendResendTemplate } from "./services/resend.service.js";

export const createApp = ({
    sendTemplate = sendWhatsAppTemplate,
    sendEmailTemplate = sendResendTemplate,
    logger = console
} = {}) => {
    const app = express();

    app.use(express.json());
    app.use("/api/whatsapp", createWhatsAppRouter({ sendTemplate, logger }));
    app.use("/api/email", createEmailRouter({ sendEmailTemplate, logger }));

    app.get("/", (req, res) => {
        res.json({ message: "WhatsApp service is running" });
    });

    return app;
};
