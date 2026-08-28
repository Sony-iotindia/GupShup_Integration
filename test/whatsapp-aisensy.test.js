import test from "node:test";
import assert from "node:assert/strict";

import { createApp } from "../app.js";
import { buildAiSensyCampaignRequest } from "../services/aisensy.service.js";
import { validateAiSensyTemplateRequest } from "../validators/whatsapp.aisensy.validator.js";

const validRequest = {
    campaignName: "employee_onboarding",
    destination: "+919876543210",
    userName: "Rahul Sharma",
    templateParams: ["Rahul Sharma", "1 September 2026"],
    media: {
        url: "https://www.iotindia.ai/images/welcome.jpg",
        filename: "welcome.jpg"
    },
    source: "IOT India Backend",
    tags: ["employee"],
    attributes: {
        employee_id: "EMP-101"
    }
};

const startServer = async (options = {}) => {
    const server = createApp(options).listen(0);
    await new Promise(resolve => server.once("listening", resolve));

    const { port } = server.address();

    return {
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        })
    };
};

test("accepts a valid AiSensy API campaign request", () => {
    const { error, value } = validateAiSensyTemplateRequest(validRequest);

    assert.equal(error, undefined);
    assert.deepEqual(value, validRequest);
});

test("rejects an AiSensy request without an international destination", () => {
    const { error } = validateAiSensyTemplateRequest({
        ...validRequest,
        destination: "9876543210"
    });

    assert.match(error.message, /destination/i);
});

test("rejects AiSensy media that is not publicly addressable over HTTPS", () => {
    const { error } = validateAiSensyTemplateRequest({
        ...validRequest,
        media: { url: "http://localhost/welcome.jpg", filename: "welcome.jpg" }
    });

    assert.match(error.message, /media\.url/i);
});

test("builds the documented AiSensy API campaign request", () => {
    const request = buildAiSensyCampaignRequest(validRequest, {
        apiKey: "secret-key"
    });

    assert.deepEqual(request, {
        url: "https://backend.aisensy.com/campaign/t1/api/v2",
        data: {
            apiKey: "secret-key",
            ...validRequest
        },
        config: {
            headers: { "Content-Type": "application/json" }
        }
    });
});

test("refuses to build an AiSensy request without an API key", () => {
    assert.throws(
        () => buildAiSensyCampaignRequest(validRequest, { apiKey: "" }),
        /AISENSY_API_KEY/
    );
});

test("POST /api/whatsapp/aisensy/send validates and sends an AiSensy campaign", async () => {
    let receivedRequest;
    const server = await startServer({
        sendAiSensyTemplate: async request => {
            receivedRequest = request;
            return { success: true, submitted: true };
        }
    });

    try {
        const response = await fetch(`${server.baseUrl}/api/whatsapp/aisensy/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validRequest)
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            success: true,
            data: { success: true, submitted: true }
        });
        assert.deepEqual(receivedRequest, validRequest);
    } finally {
        await server.close();
    }
});

test("POST /api/whatsapp/aisensy/send rejects invalid input without contacting AiSensy", async () => {
    let sendCount = 0;
    const server = await startServer({
        sendAiSensyTemplate: async () => {
            sendCount += 1;
        }
    });

    try {
        const response = await fetch(`${server.baseUrl}/api/whatsapp/aisensy/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destination: "+919876543210" })
        });

        assert.equal(response.status, 400);
        assert.equal((await response.json()).success, false);
        assert.equal(sendCount, 0);
    } finally {
        await server.close();
    }
});

test("POST /api/whatsapp/aisensy/send reports an AiSensy provider failure", async () => {
    const server = await startServer({
        sendAiSensyTemplate: async () => {
            throw new Error("provider unavailable");
        },
        logger: { error() {}, info() {} }
    });

    try {
        const response = await fetch(`${server.baseUrl}/api/whatsapp/aisensy/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validRequest)
        });

        assert.equal(response.status, 502);
        assert.deepEqual(await response.json(), {
            success: false,
            error: "Failed to send WhatsApp template through AiSensy"
        });
    } finally {
        await server.close();
    }
});
