import axios from "axios";

export const buildTemplateMessageRequest = (
    { destination, template, message, postbackTexts },
    { phoneNumber, appName, apiKey }
) => {
    const formData = new URLSearchParams();

    formData.append("channel", "whatsapp");
    formData.append("source", phoneNumber);
    formData.append("destination", destination);
    formData.append("src.name", appName);
    formData.append("template", JSON.stringify(template));

    if (message) {
        formData.append("message", JSON.stringify(message));
    }

    if (postbackTexts) {
        formData.append("postbackTexts", JSON.stringify(postbackTexts));
    }

    return {
        url: "https://api.gupshup.io/wa/api/v1/template/msg",
        data: formData,
        config: {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                apikey: apiKey
            }
        }
    };
};

export const sendWhatsAppTemplate = async (templateRequest) => {
    try {
        const request = buildTemplateMessageRequest(templateRequest, {
            phoneNumber: process.env.GUPSHUP_PHONE_NUMBER,
            appName: process.env.GUPSHUP_APP_NAME,
            apiKey: process.env.GUPSHUP_API_KEY
        });

        const response = await axios.post(
            request.url,
            request.data,
            request.config
        );        

        return response.data;

    } catch (error) {

        console.error(
            "Gupshup template API error:",
            error.response?.data || error.message
        );

        throw error;
    }
};
