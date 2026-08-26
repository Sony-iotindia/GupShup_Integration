import express from "express";
import { createSendEmailTemplate } from "../controllers/email.controller.js";

export const createEmailRouter = ({ sendEmailTemplate, logger }) => {
    const router = express.Router();

    router.post(
        "/send-template",
        createSendEmailTemplate({ sendEmailTemplate, logger })
    );

    return router;
};
