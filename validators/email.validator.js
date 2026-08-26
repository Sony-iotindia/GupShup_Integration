import Joi from "joi";

const emailTemplateRequestSchema = Joi.object({
    to: Joi.string().trim().email().required(),
    templateId: Joi.string().trim().required(),
    variables: Joi.object()
        .pattern(
            Joi.string(),
            Joi.alternatives().try(Joi.string(), Joi.number())
        )
        .min(1)
        .required()
}).unknown(false);

export const validateEmailTemplateRequest = request =>
    emailTemplateRequestSchema.validate(request, {
        abortEarly: false,
        allowUnknown: false
    });
