import { validateAiSensyTemplateRequest } from "../validators/whatsapp.aisensy.validator.js";
import { validateAiSensyBulkTemplateRequest } from "../validators/whatsapp.aisensy.validator.js";

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

export const createSendAiSensyBulkMessage = ({ bulkCampaignService, logger }) =>
    (req, res) => {
        try {
            const validation = validateAiSensyBulkTemplateRequest(req.body);

            if (validation.error) {
                return res.status(400).json({
                    success: false,
                    error: validation.error.details.map(detail => detail.message)
                });
            }

            const campaign = bulkCampaignService.enqueue(validation.value);

            return res.status(202).json({
                success: true,
                campaignId: campaign.campaignId,
                status: campaign.status,
                totalRecipients: campaign.total
            });
        } catch (error) {
            logger.error("AiSensy bulk campaign error:", error.message);
            return res.status(500).json({
                success: false,
                error: "Failed to queue AiSensy bulk campaign"
            });
        }
    };

export const createGetAiSensyBulkCampaign = ({ bulkCampaignService }) =>
    (req, res) => {
        const campaign = bulkCampaignService.getCampaign(req.params.campaignId);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Bulk campaign not found"
            });
        }

        return res.status(200).json(campaign);
    };
