import axios from "axios";

export const testGupshupAuth = async () => {
    try {
        const response = await axios.get(
            `https://api.gupshup.io/wa/app/${process.env.GUPSHUP_APP_ID}/business/profile`,
            {
                headers: {
                    apikey: process.env.GUPSHUP_API_KEY
                }
            }
        );

        console.log("Gupshup auth SUCCESS:");
        console.log(response.data);

        return response.data;

    } catch (error) {
        console.log("Gupshup auth FAILED:");

        console.log(
            "Status:",
            error.response?.status
        );

        console.log(
            "Response:",
            error.response?.data
        );

        throw error;
    }
};

export const sendWhatsAppMessage = async (destination, message) => {
    try {

        const formData = new URLSearchParams();

        formData.append(
            "source",
            process.env.GUPSHUP_PHONE_NUMBER
        );

        formData.append(
            "destination",
            destination
        );

        formData.append(
            "src.name",
            process.env.GUPSHUP_APP_NAME
        );

        formData.append(
            "message",
            JSON.stringify(message)
        );

        const response = await axios.post(
            "https://api.gupshup.io/wa/api/v1/msg",
            formData,
            {
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",

                    "apikey":
                        process.env.GUPSHUP_API_KEY
                }
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "Gupshup API error:",
            error.response?.data || error.message
        );

        throw error;
    }
};