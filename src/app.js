import express from "express";
import swaggerUi from "swagger-ui-express";

import {
    emailSwaggerSpecification,
    swaggerUiOptions,
    whatsappSwaggerSpecification
} from "./config/swagger.js";
import { createEmailRouter } from "./modules/email/routes/email.routes.js";
import { createWhatsAppRouter } from "./modules/whatsapp/routes/whatsapp.routes.js";
import { createAiSensyWhatsAppRouter } from "./modules/whatsapp/routes/whatsapp.aisensy.routes.js";
import { sendAiSensyWhatsAppTemplate } from "./modules/whatsapp/providers/aisensy/aisensy.service.js";
import { sendWhatsAppTemplate } from "./modules/whatsapp/providers/gupshup/gupshup.service.js";
import { sendResendTemplate } from "./modules/email/providers/resend/resend.service.js";
import { createWhatsAppWebhook } from "./modules/whatsapp/webhooks/whatsapp.webhook.js";

export const createApp = ({
    sendTemplate = sendWhatsAppTemplate,
    sendAiSensyTemplate = sendAiSensyWhatsAppTemplate,
    sendEmailTemplate = sendResendTemplate,
    logger = console
} = {}) => {
    const app = express();

    app.use(express.json());
    app.get("/api-docs/modules/whatsapp.json", (req, res) => {
        res.json(whatsappSwaggerSpecification);
    });
    app.get("/api-docs/modules/email.json", (req, res) => {
        res.json(emailSwaggerSpecification);
    });
    app.use(
        "/api-docs",
        swaggerUi.serveFiles(null, swaggerUiOptions),
        swaggerUi.setup(null, swaggerUiOptions)
    );
    app.use(
        "/api/v1/whatsapp/gupshup",
        createWhatsAppRouter({ sendTemplate, logger })
    );
    app.use(
        "/api/v1/whatsapp/aisensy",
        createAiSensyWhatsAppRouter({ sendAiSensyTemplate, logger })
    );
    app.post("/api/whatsapp/webhook", createWhatsAppWebhook({ logger }));
    app.use("/api/email", createEmailRouter({ sendEmailTemplate, logger }));

    app.get("/", (req, res) => {
        res.json({ message: "WhatsApp service is running" });
    });

    return app;
};
