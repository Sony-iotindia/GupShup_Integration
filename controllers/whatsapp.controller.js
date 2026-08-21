import {
    sendWhatsAppMessage
} from "../services/gupshup.service.js";

import {
    validateWhatsAppMessage
} from "../validators/whatsapp.validator.js";


export const sendMessage = async (req, res) => {

    try {

        const {
            destination,
            message
        } = req.body;


        // -----------------------------------------
        // Validate destination
        // -----------------------------------------

        if (
            !destination ||
            typeof destination !== "string"
        ) {
            return res.status(400).json({
                success: false,
                error: "destination is required and must be a string"
            });
        }


        // -----------------------------------------
        // Validate message exists
        // -----------------------------------------

        if (
            !message ||
            typeof message !== "object"
        ) {
            return res.status(400).json({
                success: false,
                error: "message must be an object"
            });
        }


        // -----------------------------------------
        // Validate message according to type
        // -----------------------------------------

        const validation =
            validateWhatsAppMessage(message);


        if (validation.error) {

            return res.status(400).json({
                success: false,
                error: validation.error.details.map(
                    detail => detail.message
                )
            });
        }


        // -----------------------------------------
        // Send to Gupshup
        // -----------------------------------------

        const result =
            await sendWhatsAppMessage(
                destination,
                validation.value
            );


        return res.status(200).json({
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
            error: "Failed to send WhatsApp message"
        });
    }
};