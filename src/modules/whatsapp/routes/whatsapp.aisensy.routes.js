import express from "express";
import { createSendAiSensyMessage } from "../controllers/whatsapp.aisensy.controller.js";
import {
    createGetAiSensyBulkCampaign,
    createSendAiSensyBulkMessage
} from "../controllers/whatsapp.aisensy.controller.js";

export const createAiSensyWhatsAppRouter = ({
    sendAiSensyTemplate,
    bulkCampaignService,
    logger
}) => {
    const router = express.Router();

    router.post("/messages/template", createSendAiSensyMessage({
        sendAiSensyTemplate,
        logger
    }));
    router.post("/messages/template/bulk", createSendAiSensyBulkMessage({
        bulkCampaignService,
        logger
    }));
    router.get("/campaigns/:campaignId", createGetAiSensyBulkCampaign({
        bulkCampaignService
    }));

    return router;
};
