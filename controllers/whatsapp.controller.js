import {
    sendWhatsAppMessage
} from "../services/gupshup.service.js";

export const sendMessage = async (req, res) => {
    try {

        const { destination, message } = req.body;

        if (!destination) {
            return res.status(400).json({
                success: false,
                error: "destination is required"
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                error: "message is required"
            });
        }

        const result = await sendWhatsAppMessage(
            destination,
            message
        );

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "WhatsApp controller error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};