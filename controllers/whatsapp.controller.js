import { validateWhatsAppTemplateRequest } from "../validators/whatsapp.validator.js";

export const createSendMessage = ({ sendTemplate, logger }) => async (req, res) => {

    try {
        const validation = validateWhatsAppTemplateRequest(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                error: validation.error.details.map(
                    detail => detail.message
                )
            });
        }

        const result = await sendTemplate(validation.value);

        return res.status(200).json({
            success: true,
            data: result
        });


    } catch (error) {

        logger.error(
            "WhatsApp controller error:",
            error.response?.data || error.message
        );

        return res.status(502).json({
            success: false,
            error: "Failed to send WhatsApp template"
        });
    }
};
