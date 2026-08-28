import axios from "axios";

export const buildAiSensyCampaignRequest = (
    campaignRequest,
    { apiKey }
) => {
    if (!apiKey?.trim()) {
        throw new Error("AISENSY_API_KEY is required");
    }

    return {
        url: "https://backend.aisensy.com/campaign/t1/api/v2",
        data: {
            apiKey,
            ...campaignRequest
        },
        config: {
            headers: {
                "Content-Type": "application/json"
            }
        }
    };
};

export const sendAiSensyWhatsAppTemplate = async campaignRequest => {
    try {
        const request = buildAiSensyCampaignRequest(campaignRequest, {
            apiKey: process.env.AISENSY_API_KEY
        });
        const response = await axios.post(
            request.url,
            request.data,
            request.config
        );

        return response.data;
    } catch (error) {
        console.error(
            "AiSensy template API error:",
            error.response?.data || error.message
        );

        throw error;
    }
};
