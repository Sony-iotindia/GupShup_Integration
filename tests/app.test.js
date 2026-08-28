import test from "node:test";
import assert from "node:assert/strict";

import { createApp } from "../src/app.js";

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

const validTemplateRequest = {
    destination: "919876543210",
    template: {
        id: "approved-template-id",
        params: ["Vijay", "UK07BK5904"]
    }
};

const validEmailTemplateRequest = {
    to: "candidate@example.com",
    templateId: "interview-scheduled",
    variables: {
        CANDIDATE_NAME: "Rahul Sharma",
        POSITION: "Customer Support Executive"
    }
};

test("POST /api/email/send-template validates and sends a Resend template", async () => {
    let receivedRequest;
    const server = await startServer({
        sendEmailTemplate: async request => {
            receivedRequest = request;
            return { id: "email-123" };
        }
    });

    try {
        const response = await fetch(`${server.baseUrl}/api/email/send-template`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validEmailTemplateRequest)
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            success: true,
            data: { id: "email-123" }
        });
        assert.deepEqual(receivedRequest, validEmailTemplateRequest);
    } finally {
        await server.close();
    }
});

test("POST /api/email/send-template rejects invalid input without contacting Resend", async () => {
    let sendCount = 0;
    const server = await startServer({
        sendEmailTemplate: async () => {
            sendCount += 1;
        }
    });

    try {
        const response = await fetch(`${server.baseUrl}/api/email/send-template`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: "not-an-email",
                templateId: "interview-scheduled",
                variables: {}
            })
        });

        assert.equal(response.status, 400);
        assert.equal((await response.json()).success, false);
        assert.equal(sendCount, 0);
    } finally {
        await server.close();
    }
});

test("POST /api/email/send-template reports a Resend provider failure", async () => {
    const server = await startServer({
        sendEmailTemplate: async () => {
            throw new Error("provider unavailable");
        },
        logger: { error() {}, info() {} }
    });

    try {
        const response = await fetch(`${server.baseUrl}/api/email/send-template`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validEmailTemplateRequest)
        });

        assert.equal(response.status, 502);
        assert.deepEqual(await response.json(), {
            success: false,
            error: "Failed to send email template"
        });
    } finally {
        await server.close();
    }
});

test("POST /api/whatsapp/send validates and sends a template", async () => {
    let receivedRequest;
    const server = await startServer({
        sendTemplate: async request => {
            receivedRequest = request;
            return { status: "submitted", messageId: "message-123" };
        }
    });

    try {
        const response = await fetch(`${server.baseUrl}/api/whatsapp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validTemplateRequest)
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            success: true,
            data: { status: "submitted", messageId: "message-123" }
        });
        assert.deepEqual(receivedRequest, validTemplateRequest);
    } finally {
        await server.close();
    }
});

test("POST /api/whatsapp/send rejects invalid input without contacting Gupshup", async () => {
    let sendCount = 0;
    const server = await startServer({
        sendTemplate: async () => {
            sendCount += 1;
        }
    });

    try {
        const response = await fetch(`${server.baseUrl}/api/whatsapp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destination: "919876543210" })
        });

        assert.equal(response.status, 400);
        assert.equal((await response.json()).success, false);
        assert.equal(sendCount, 0);
    } finally {
        await server.close();
    }
});

test("POST /api/whatsapp/send reports an upstream provider failure", async () => {
    const server = await startServer({
        sendTemplate: async () => {
            throw new Error("provider unavailable");
        },
        logger: { error() {}, info() {} }
    });

    try {
        const response = await fetch(`${server.baseUrl}/api/whatsapp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validTemplateRequest)
        });

        assert.equal(response.status, 502);
        assert.deepEqual(await response.json(), {
            success: false,
            error: "Failed to send WhatsApp template"
        });
    } finally {
        await server.close();
    }
});

test("POST /api/whatsapp/webhook logs and acknowledges a received message", async () => {
    const logEntries = [];
    const server = await startServer({
        logger: {
            info: (...args) => logEntries.push(args),
            error() {}
        }
    });
    const webhook = {
        type: "message",
        payload: {
            type: "text",
            sender: { phone: "919876543210" },
            payload: { text: "Hello" }
        }
    };

    try {
        const response = await fetch(`${server.baseUrl}/api/whatsapp/webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhook)
        });

        assert.equal(response.status, 200);
        assert.equal(await response.text(), "OK");
        assert.deepEqual(logEntries, [["WhatsApp webhook received", webhook]]);
    } finally {
        await server.close();
    }
});

test("POST /api/whatsapp/webhook acknowledges non-message events", async () => {
    const logEntries = [];
    const server = await startServer({
        logger: {
            info: (...args) => logEntries.push(args),
            error() {}
        }
    });
    const webhook = { type: "message-event", payload: { id: "message-123" } };

    try {
        const response = await fetch(`${server.baseUrl}/api/whatsapp/webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhook)
        });

        assert.equal(response.status, 200);
        assert.deepEqual(logEntries, [["WhatsApp webhook received", webhook]]);
    } finally {
        await server.close();
    }
});
