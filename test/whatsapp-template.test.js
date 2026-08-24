import test from "node:test";
import assert from "node:assert/strict";

import {
    validateWhatsAppTemplateRequest
} from "../validators/whatsapp.validator.js";
import {
    buildTemplateMessageRequest
} from "../services/gupshup.service.js";

const validRequest = {
    destination: "919876543210",
    template: {
        id: "approved-template-id",
        params: [
            "Vijay Prakash Chopra",
            "UK07BK5904",
            "4,031",
            "23 Sep, 2026",
            "Maruti Swift Dzire",
            "https://example.com/payment/ABC123"
        ]
    },
    message: {
        type: "image",
        image: {
            link: "https://example.com/header.jpg"
        }
    },
    postbackTexts: [
        { index: 0, text: "PAY_NOW" },
        { index: 1, text: "REQUEST_CALLBACK" }
    ]
};

test("accepts an approved template request with image and postbacks", () => {
    const { error, value } = validateWhatsAppTemplateRequest(validRequest);

    assert.equal(error, undefined);
    assert.deepEqual(value, validRequest);
});

test("rejects a request without a template id", () => {
    const request = structuredClone(validRequest);
    delete request.template.id;

    const { error } = validateWhatsAppTemplateRequest(request);

    assert.match(error.message, /template\.id.*required/i);
});

test("rejects an image template without an HTTPS link", () => {
    const request = structuredClone(validRequest);
    request.message.image.link = "not-a-url";

    const { error } = validateWhatsAppTemplateRequest(request);

    assert.ok(error);
    assert.equal(error.details[0].path[0], "message");
});

test("rejects duplicate quick-reply indexes", () => {
    const request = structuredClone(validRequest);
    request.postbackTexts[1].index = 0;

    const { error } = validateWhatsAppTemplateRequest(request);

    assert.ok(error);
    assert.equal(error.details[0].path[0], "postbackTexts");
});

test("builds the Gupshup template endpoint and URL-encoded fields", () => {
    const request = buildTemplateMessageRequest(validRequest, {
        phoneNumber: "911111111111",
        appName: "RSA App",
        apiKey: "secret-key"
    });

    assert.equal(request.url, "https://api.gupshup.io/wa/api/v1/template/msg");
    assert.equal(request.data.get("channel"), "whatsapp");
    assert.equal(request.data.get("source"), "911111111111");
    assert.equal(request.data.get("destination"), "919876543210");
    assert.equal(request.data.get("src.name"), "RSA App");
    assert.deepEqual(JSON.parse(request.data.get("template")), validRequest.template);
    assert.deepEqual(JSON.parse(request.data.get("message")), validRequest.message);
    assert.deepEqual(
        JSON.parse(request.data.get("postbackTexts")),
        validRequest.postbackTexts
    );
    assert.deepEqual(request.config, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            apikey: "secret-key"
        }
    });
});

test("omits optional media and postback fields", () => {
    const request = buildTemplateMessageRequest({
        destination: validRequest.destination,
        template: validRequest.template
    }, {
        phoneNumber: "911111111111",
        appName: "RSA App",
        apiKey: "secret-key"
    });

    assert.equal(request.data.has("message"), false);
    assert.equal(request.data.has("postbackTexts"), false);
});

test("rejects a location template without name and address", () => {
    const request = structuredClone(validRequest);
    request.message = {
        type: "location",
        location: {
            longitude: 77.209,
            latitude: 28.6139
        }
    };

    const { error } = validateWhatsAppTemplateRequest(request);

    assert.ok(error);
    assert.equal(error.details[0].path[0], "message");
});
