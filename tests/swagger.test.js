import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

import { createApp } from "../src/app.js";
import { swaggerUiOptions } from "../src/config/swagger.js";

const startServer = async () => {
    const server = createApp().listen(0);
    await new Promise(resolve => server.once("listening", resolve));

    const { port } = server.address();

    return {
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        })
    };
};

test("GET /api-docs/ serves the Swagger UI", async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api-docs/`);
        const content = await response.text();

        assert.equal(response.status, 200);
        assert.match(response.headers.get("content-type"), /text\/html/);
        assert.match(content, /<div id="swagger-ui"><\/div>/);
        assert.match(content, /Select a module/);
        assert.doesNotMatch(
            content,
            /download-url-wrapper\s*\{\s*display:\s*none/
        );
    } finally {
        await server.close();
    }
});

test("module label observer disconnects after updating the label", () => {
    const label = { textContent: "Select a definition" };
    let observer;

    class MutationObserver {
        constructor(callback) {
            this.callback = callback;
            this.disconnected = false;
            observer = this;
        }

        observe() {}

        disconnect() {
            this.disconnected = true;
        }
    }

    vm.runInNewContext(swaggerUiOptions.customJsStr, {
        document: {
            documentElement: {},
            querySelector: () => label
        },
        MutationObserver
    });

    assert.equal(label.textContent, "Select a module");
    assert.equal(observer.disconnected, true);
});

test("Swagger UI provides module selection and hides unnecessary sections", async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api-docs/swagger-ui-init.js`);
        assert.equal(response.status, 200);

        const configuration = await response.text();

        assert.match(configuration, /modules\/whatsapp\.json/);
        assert.match(configuration, /modules\/email\.json/);
        assert.match(configuration, /docExpansion.*none/s);
        assert.match(configuration, /defaultModelsExpandDepth.*-1/s);
    } finally {
        await server.close();
    }
});

test("WhatsApp Swagger module contains provider groups and Local/Live servers", async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api-docs/modules/whatsapp.json`);
        assert.equal(response.status, 200);
        assert.match(response.headers.get("content-type"), /application\/json/);

        const specification = await response.json();

        assert.deepEqual(specification.servers, [
            { url: "http://localhost:3000", description: "Local" },
            { url: "http://api.example.com", description: "Live" }
        ]);
        assert.deepEqual(specification.tags, [
            { name: "Gupshup" },
            { name: "AiSensy" }
        ]);
        assert.deepEqual(Object.keys(specification.paths), [
            "/api/v1/whatsapp/gupshup/messages/template",
            "/api/v1/whatsapp/aisensy/messages/template"
        ]);
    } finally {
        await server.close();
    }
});

test("Email Swagger module contains only the Resend provider", async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api-docs/modules/email.json`);
        assert.equal(response.status, 200);
        assert.match(response.headers.get("content-type"), /application\/json/);

        const specification = await response.json();

        assert.deepEqual(specification.servers, [
            { url: "http://localhost:3000", description: "Local" },
            { url: "http://api.example.com", description: "Live" }
        ]);
        assert.deepEqual(specification.tags, [{ name: "Resend" }]);
        assert.deepEqual(Object.keys(specification.paths), [
            "/api/email/send-template"
        ]);
    } finally {
        await server.close();
    }
});
