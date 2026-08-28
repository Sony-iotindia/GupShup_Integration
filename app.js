import express from "express";

import { createEmailRouter } from "./routes/email.routes.js";
import { createWhatsAppRouter } from "./routes/whatsapp.routes.js";
import { createAiSensyWhatsAppRouter } from "./routes/whatsapp.aisensy.routes.js";
import { sendAiSensyWhatsAppTemplate } from "./services/aisensy.service.js";
import { sendWhatsAppTemplate } from "./services/gupshup.service.js";
import { sendResendTemplate } from "./services/resend.service.js";

export const createApp = ({
    sendTemplate = sendWhatsAppTemplate,
    sendAiSensyTemplate = sendAiSensyWhatsAppTemplate,
    sendEmailTemplate = sendResendTemplate,
    logger = console
} = {}) => {
    const app = express();

    app.use(express.json());
    app.use("/api/whatsapp", createWhatsAppRouter({ sendTemplate, logger }));
    app.use(
        "/api/whatsapp/aisensy",
        createAiSensyWhatsAppRouter({ sendAiSensyTemplate, logger })
    );
    app.use("/api/email", createEmailRouter({ sendEmailTemplate, logger }));

    app.get("/", (req, res) => {
        res.json({ message: "WhatsApp service is running" });
    });

    return app;
};
