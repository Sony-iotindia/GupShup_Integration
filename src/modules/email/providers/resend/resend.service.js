import { Resend } from "resend";

export const buildResendTemplateRequest = ({
    to,
    templateId,
    variables
}) => ({
    to,
    template: {
        id: templateId,
        variables
    }
});

export const sendResendTemplate = async templateRequest => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send(
        buildResendTemplateRequest(templateRequest)
    );

    if (error) {
        throw new Error(error.message || "Resend API request failed");
    }

    return data;
};
