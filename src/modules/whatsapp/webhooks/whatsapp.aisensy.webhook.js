export const createAiSensyWhatsAppWebhook = ({ logger }) => (req, res) => {
    logger.info("AiSensy WhatsApp webhook received", req.body);
    return res.status(200).send("OK");
};
