import Joi from "joi";

const aisensyTemplateRequestSchema = Joi.object({
    campaignName: Joi.string().trim().required(),
    destination: Joi.string().trim().pattern(/^\+\d{8,15}$/).required(),
    userName: Joi.string().trim().required(),
    source: Joi.string().trim().optional(),
    media: Joi.object({
        url: Joi.string().uri({ scheme: ["https"] }).required(),
        filename: Joi.string().trim().required()
    }).unknown(false).optional(),
    templateParams: Joi.array()
        .items(Joi.alternatives().try(Joi.string(), Joi.number()))
        .optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    attributes: Joi.object()
        .pattern(Joi.string(), Joi.string())
        .unknown(false)
        .optional()
}).unknown(false);

const aiSensyRecipientSchema = Joi.object({
    destination: Joi.string().trim().pattern(/^\+\d{8,15}$/).required(),
    userName: Joi.string().trim().required(),
    templateParams: Joi.array()
        .items(Joi.alternatives().try(Joi.string(), Joi.number()))
        .optional()
}).unknown(false);

const aisensyBulkTemplateRequestSchema = Joi.object({
    campaignName: Joi.string().trim().required(),
    source: Joi.string().trim().optional(),
    media: Joi.object({
        url: Joi.string().uri({ scheme: ["https"] }).required(),
        filename: Joi.string().trim().required()
    }).unknown(false).optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    attributes: Joi.object()
        .pattern(Joi.string(), Joi.string())
        .unknown(false)
        .optional(),
    recipients: Joi.array()
        .items(aiSensyRecipientSchema)
        .min(1)
        .max(1000)
        .unique("destination")
        .required()
        .messages({
            "array.unique": "recipients must contain unique destinations"
        })
}).unknown(false);

export const validateAiSensyTemplateRequest = request =>
    aisensyTemplateRequestSchema.validate(request, {
        abortEarly: false,
        allowUnknown: false
    });

export const validateAiSensyBulkTemplateRequest = request =>
    aisensyBulkTemplateRequestSchema.validate(request, {
        abortEarly: false,
        allowUnknown: false
    });
