import Joi from "joi";

// --------------------------------------------------
// Common fields
// --------------------------------------------------

const contextSchema = Joi.object({
    msgId: Joi.string()
}).unknown(false);


// --------------------------------------------------
// TEXT
// --------------------------------------------------

const textSchema = Joi.object({
    type: Joi.string()
        .valid("text")
        .optional(),

    text: Joi.string()
        .required(),

    context: contextSchema
        .optional(),

    previewUrl: Joi.boolean()
        .optional()
});

// {
//     "destination": "919876543210",

//     "message": {
//         "type": "text",
//         "text": "Hello driver",

//         "context": {
//             "msgId": "uniqueMsgId"
//         },

//         "previewUrl": true
//     }
// }


// --------------------------------------------------
// IMAGE
// --------------------------------------------------

const imageSchema = Joi.object({
    type: Joi.string()
        .valid("image")
        .required(),

    context: contextSchema
        .optional(),

    id: Joi.string()
        .optional(),

    caption: Joi.string()
        .optional(),

    originalUrl: Joi.string()
        .optional(),

    previewUrl: Joi.string()
        .optional()
});

// {
//     "destination": "919876543210",

//     "message": {
//         "context": {
//             "msgId": "uniqueMsgId"
//         },

//         "type": "image",
//         "id": "MEDIA_ID_123",
//         "caption": "Your vehicle",
//         "originalUrl": "https://example.com/car.jpg",
//         "previewUrl": "https://example.com/preview.jpg"
//     }
// }


// --------------------------------------------------
// DOCUMENT / FILE
// --------------------------------------------------

const fileSchema = Joi.object({
    type: Joi.string()
        .valid("file")
        .required(),

    context: contextSchema
        .optional(),

    id: Joi.string()
        .optional(),

    caption: Joi.string()
        .optional(),

    url: Joi.string()
        .optional(),

    filename: Joi.string()
        .optional()
});

// {
//     "destination": "919876543210",

//     "message": {
//         "context": {
//             "msgId": "uniqueMsgId"
//         },

//         "type": "file",
//         "id": "MEDIA_ID_123",
//         "caption": "Insurance document",
//         "url": "https://example.com/file.pdf",
//         "filename": "insurance.pdf"
//     }
// }


// --------------------------------------------------
// AUDIO
// --------------------------------------------------

const audioSchema = Joi.object({
    type: Joi.string()
        .valid("audio")
        .required(),

    context: contextSchema
        .optional(),

    id: Joi.string()
        .optional(),

    url: Joi.string()
        .optional()
});

// {
//     "destination": "919876543210",

//     "message": {
//         "context": {
//             "msgId": "uniqueMsgId"
//         },

//         "type": "audio",
//         "id": "MEDIA_ID_123",
//         "url": "https://example.com/audio.mp3"
//     }
// }


// --------------------------------------------------
// VIDEO
// --------------------------------------------------

const videoSchema = Joi.object({
    type: Joi.string()
        .valid("video")
        .required(),

    context: contextSchema
        .optional(),

    id: Joi.string()
        .optional(),

    caption: Joi.string()
        .optional(),

    url: Joi.string()
        .optional(),

    previewUrl: Joi.string()
        .optional()
});

// {
//     "destination": "919876543210",

//     "message": {
//         "context": {
//             "msgId": "uniqueMsgId"
//         },

//         "type": "video",
//         "id": "MEDIA_ID_123",
//         "caption": "Vehicle assistance video",
//         "url": "https://example.com/video.mp4",
//         "previewUrl": "https://example.com/preview.jpg"
//     }
// }


// --------------------------------------------------
// STICKER
// --------------------------------------------------

const stickerSchema = Joi.object({
    type: Joi.string()
        .valid("sticker")
        .required(),

    context: contextSchema
        .optional(),

    id: Joi.string()
        .optional(),

    url: Joi.string()
        .optional()
});

// {
//     "destination": "919876543210",

//     "message": {
//         "context": {
//             "msgId": "uniqueMsgId"
//         },

//         "type": "sticker",
//         "id": "MEDIA_ID_123",
//         "url": "https://example.com/sticker.webp"
//     }
// }


// --------------------------------------------------
// REACTION
// --------------------------------------------------

const reactionSchema = Joi.object({
    type: Joi.string()
        .valid("reaction")
        .required(),

    emoji: Joi.string()
        .optional(),

    msgId: Joi.string()
        .required()
});

// {
//     "destination": "919876543210",

//     "message": {
//         "type": "reaction",
//         "emoji": "👍",
//         "msgId": "MESSAGE_ID_123"
//     }
// }


// --------------------------------------------------
// LOCATION
// --------------------------------------------------

const locationSchema = Joi.object({
    type: Joi.string()
        .valid("location")
        .required(),

    longitude: Joi.string()
        .optional(),

    latitude: Joi.string()
        .optional(),

    name: Joi.string()
        .optional(),

    address: Joi.string()
        .optional()
});

// {
//     "destination": "919876543210",

//     "message": {
//         "type": "location",
//         "longitude": "77.2090",
//         "latitude": "28.6139",
//         "name": "RSA Assistance",
//         "address": "New Delhi"
//     }
// }


// --------------------------------------------------
// Validate message based on type
// --------------------------------------------------

export const validateWhatsAppMessage = (message) => {

    let schema;

    switch (message?.type) {

        case "text":
            schema = textSchema;
            break;

        case "image":
            schema = imageSchema;
            break;

        case "file":
            schema = fileSchema;
            break;

        case "audio":
            schema = audioSchema;
            break;

        case "video":
            schema = videoSchema;
            break;

        case "sticker":
            schema = stickerSchema;
            break;

        case "reaction":
            schema = reactionSchema;
            break;

        case "location":
            schema = locationSchema;
            break;

        default:

            // Gupshup documentation says text.type
            // is optional, so allow a text message
            // without type if "text" exists.

            if (
                message &&
                typeof message.text === "string"
            ) {
                schema = textSchema;
            } else {
                return {
                    error: "Invalid or missing message type"
                };
            }
    }

    const { error, value } = schema.validate(
        message,
        {
            abortEarly: false,
            allowUnknown: false
        }
    );

    return {
        error,
        value
    };
};

export const validateWhatsAppRequest = (req) => {

    const requestSchema = Joi.object({
        destination: Joi.string()
            .required(),

        message: Joi.object()
            .required()
    });

    return requestSchema.validate(
        req,
        {
            abortEarly: false,
            allowUnknown: false
        }
    );
};