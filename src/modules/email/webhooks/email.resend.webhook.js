import { Resend } from "resend";

export const verifyResendWebhookRequest = ({
    payload,
    headers,
    webhookSecret
}) => {
    if (!webhookSecret?.trim()) {
        throw new Error("RESEND_WEBHOOK_SECRET is required");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    return resend.webhooks.verify({
        payload,
        headers,
        webhookSecret
    });
};

export const createResendEmailWebhook = ({
    verifyWebhook,
    webhookSecret,
    logger
}) => (req, res) => {
    try {
        const event = verifyWebhook({
            payload: req.body,
            headers: {
                id: req.get("svix-id"),
                timestamp: req.get("svix-timestamp"),
                signature: req.get("svix-signature")
            },
            webhookSecret
        });

        logger.info("Resend email webhook received", event);
        return res.status(200).send("OK");
    } catch (error) {
        logger.error("Resend email webhook verification error:", error.message);
        return res.status(400).send("Invalid webhook");
    }
};
