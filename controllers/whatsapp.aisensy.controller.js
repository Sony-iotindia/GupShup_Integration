import { validateAiSensyTemplateRequest } from "../validators/whatsapp.aisensy.validator.js";

export const createSendAiSensyMessage = ({ sendAiSensyTemplate, logger }) =>
    async (req, res) => {
        try {
            const validation = validateAiSensyTemplateRequest(req.body);

            if (validation.error) {
                return res.status(400).json({
                    success: false,
                    error: validation.error.details.map(detail => detail.message)
                });
            }

            const result = await sendAiSensyTemplate(validation.value);

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error(
                "AiSensy WhatsApp controller error:",
                error.response?.data || error.message
            );

            return res.status(502).json({
                success: false,
                error: "Failed to send WhatsApp template through AiSensy"
            });
        }
    };
