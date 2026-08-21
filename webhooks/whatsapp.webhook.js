export const whatsappWebhook = async (req, res) => {
    try {
        const data = req.body;

        console.log("WhatsApp webhook:", JSON.stringify(data, null, 2));

        // incoming WhatsApp message
        if (data.type !== "message") {
            return res.sendStatus(200);
        }

        const message = data.payload;        

        // Make sure customer sent a location
        if (message?.type === "location") {
            const customerPhone = message.sender?.phone;
            const latitude = message.payload?.latitude;
            const longitude = message.payload?.longitude;

            console.log("Customer:", customerPhone);
            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);            
        }

        return res.sendStatus(200);

    } catch (error) {

        console.error(
            "WhatsApp webhook error:",
            error
        );

        return res.sendStatus(500);
    }
};