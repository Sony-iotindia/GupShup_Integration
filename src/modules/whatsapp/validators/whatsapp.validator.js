import Joi from "joi";

const httpsLinkSchema = Joi.string()
    .uri({ scheme: ["https"] })
    .required();

const templateMediaSchema = Joi.alternatives().try(
    Joi.object({
        type: Joi.string().valid("image").required(),
        image: Joi.object({ link: httpsLinkSchema }).required()
    }).unknown(false),
    Joi.object({
        type: Joi.string().valid("video").required(),
        video: Joi.object({ link: httpsLinkSchema }).required()
    }).unknown(false),
    Joi.object({
        type: Joi.string().valid("document").required(),
        document: Joi.object({
            link: httpsLinkSchema,
            filename: Joi.string().trim().optional()
        }).required()
    }).unknown(false),
    Joi.object({
        type: Joi.string().valid("location").required(),
        location: Joi.object({
            longitude: Joi.number().min(-180).max(180).required(),
            latitude: Joi.number().min(-90).max(90).required(),
            name: Joi.string().trim().required(),
            address: Joi.string().trim().required()
        }).required()
    }).unknown(false)
);

const whatsappTemplateRequestSchema = Joi.object({
    destination: Joi.string().trim().pattern(/^\d{8,15}$/).required(),
    template: Joi.object({
        id: Joi.string().trim().required(),
        params: Joi.array()
            .items(Joi.alternatives().try(Joi.string(), Joi.number()))
            .required()
    }).unknown(false).required(),
    message: templateMediaSchema.optional(),
    postbackTexts: Joi.array()
        .items(Joi.object({
            index: Joi.number().integer().min(0).required(),
            text: Joi.string().trim().required()
        }).unknown(false))
        .unique((first, second) => first.index === second.index)
        .optional()
}).unknown(false);

export const validateWhatsAppTemplateRequest = request =>
    whatsappTemplateRequestSchema.validate(request, {
        abortEarly: false,
        allowUnknown: false
    });
