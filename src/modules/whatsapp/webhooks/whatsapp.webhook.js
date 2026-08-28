export const createWhatsAppWebhook = ({ logger }) => (req, res) => {
    logger.info("WhatsApp webhook received", req.body);
    return res.status(200).send("OK");
};
