import express from "express";

import { createEmailRouter } from "./modules/email/routes/email.routes.js";
import { createWhatsAppRouter } from "./modules/whatsapp/routes/whatsapp.routes.js";
import { createAiSensyWhatsAppRouter } from "./modules/whatsapp/routes/whatsapp.aisensy.routes.js";
import { sendAiSensyWhatsAppTemplate } from "./modules/whatsapp/providers/aisensy/aisensy.service.js";
import { sendWhatsAppTemplate } from "./modules/whatsapp/providers/gupshup/gupshup.service.js";
import { sendResendTemplate } from "./modules/email/providers/resend/resend.service.js";

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
