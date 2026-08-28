import test from "node:test";
import assert from "node:assert/strict";

import {
    validateEmailTemplateRequest
} from "../src/modules/email/validators/email.validator.js";
import {
    buildResendTemplateRequest
} from "../src/modules/email/providers/resend/resend.service.js";

const validRequest = {
    to: "candidate@example.com",
    templateId: "interview-scheduled",
    variables: {
        CANDIDATE_NAME: "Rahul Sharma",
        POSITION: "Customer Support Executive",
        INTERVIEW_DATE: "28 August 2026",
        INTERVIEW_TIME: "11:30 AM IST",
        INTERVIEW_MODE: "In-person",
        INTERVIEW_LOCATION: "iLeads Office, Dehradun",
        ACTION_URL: "https://maps.google.com/",
        INTERVIEWER_NAME: "Priya Sharma"
    }
};

test("accepts a valid Resend template request", () => {
    const { error, value } = validateEmailTemplateRequest(validRequest);

    assert.equal(error, undefined);
    assert.deepEqual(value, validRequest);
});

test("rejects an invalid recipient email address", () => {
    const { error } = validateEmailTemplateRequest({
        ...validRequest,
        to: "not-an-email"
    });

    assert.match(error.message, /to.*valid email/i);
});

test("rejects an empty variables object", () => {
    const { error } = validateEmailTemplateRequest({
        ...validRequest,
        variables: {}
    });

    assert.match(error.message, /variables.*at least 1/i);
});

test("builds the Resend template payload", () => {
    assert.deepEqual(buildResendTemplateRequest(validRequest), {
        to: "candidate@example.com",
        template: {
            id: "interview-scheduled",
            variables: validRequest.variables
        }
    });
});
