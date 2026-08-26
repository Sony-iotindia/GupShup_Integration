import { validateEmailTemplateRequest } from "../validators/email.validator.js";

export const createSendEmailTemplate = ({
    sendEmailTemplate,
    logger
}) => async (req, res) => {
    try {
        const validation = validateEmailTemplateRequest(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                error: validation.error.details.map(detail => detail.message)
            });
        }

        const result = await sendEmailTemplate(validation.value);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error("Email controller error:", error.message);

        return res.status(502).json({
            success: false,
            error: "Failed to send email template"
        });
    }
};
