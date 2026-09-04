const servers = [
    { url: "http://localhost:3000", description: "Local" },
    { url: "http://api.example.com", description: "Live" }
];

const responses = {
    Success: {
        description: "Provider accepted the request",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["success", "data"],
                    properties: {
                        success: { type: "boolean", enum: [true] },
                        data: { type: "object", additionalProperties: true }
                    }
                }
            }
        }
    },
    ValidationError: {
        description: "Request validation failed",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["success", "error"],
                    properties: {
                        success: { type: "boolean", enum: [false] },
                        error: { type: "array", items: { type: "string" } }
                    }
                }
            }
        }
    },
    ProviderError: {
        description: "Provider or network request failed",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["success", "error"],
                    properties: {
                        success: { type: "boolean", enum: [false] },
                        error: { type: "string" }
                    }
                }
            }
        }
    }
};

const mediaLink = {
    type: "object",
    additionalProperties: false,
    required: ["link"],
    properties: {
        link: { type: "string", format: "uri", pattern: "^https://" }
    }
};

const whatsappSchemas = {
    GupshupTemplateRequest: {
        type: "object",
        additionalProperties: false,
        required: ["destination", "template"],
        properties: {
            destination: {
                type: "string",
                pattern: "^[0-9]{8,15}$",
                example: "919876543210"
            },
            template: {
                type: "object",
                additionalProperties: false,
                required: ["id", "params"],
                properties: {
                    id: { type: "string" },
                    params: {
                        type: "array",
                        items: {
                            oneOf: [{ type: "string" }, { type: "number" }]
                        }
                    }
                }
            },
            message: { $ref: "#/components/schemas/GupshupMedia" },
            postbackTexts: {
                type: "array",
                items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["index", "text"],
                    properties: {
                        index: { type: "integer", minimum: 0 },
                        text: { type: "string" }
                    }
                }
            }
        }
    },
    GupshupMedia: {
        oneOf: [
            {
                type: "object",
                additionalProperties: false,
                required: ["type", "image"],
                properties: {
                    type: { type: "string", enum: ["image"] },
                    image: { $ref: "#/components/schemas/MediaLink" }
                }
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["type", "video"],
                properties: {
                    type: { type: "string", enum: ["video"] },
                    video: { $ref: "#/components/schemas/MediaLink" }
                }
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["type", "document"],
                properties: {
                    type: { type: "string", enum: ["document"] },
                    document: {
                        type: "object",
                        additionalProperties: false,
                        required: ["link"],
                        properties: {
                            link: {
                                type: "string",
                                format: "uri",
                                pattern: "^https://"
                            },
                            filename: { type: "string" }
                        }
                    }
                }
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["type", "location"],
                properties: {
                    type: { type: "string", enum: ["location"] },
                    location: {
                        type: "object",
                        additionalProperties: false,
                        required: ["longitude", "latitude", "name", "address"],
                        properties: {
                            longitude: {
                                type: "number",
                                minimum: -180,
                                maximum: 180
                            },
                            latitude: {
                                type: "number",
                                minimum: -90,
                                maximum: 90
                            },
                            name: { type: "string" },
                            address: { type: "string" }
                        }
                    }
                }
            }
        ]
    },
    MediaLink: mediaLink,
    AiSensyTemplateRequest: {
        type: "object",
        additionalProperties: false,
        required: ["campaignName", "destination", "userName"],
        properties: {
            campaignName: { type: "string" },
            destination: {
                type: "string",
                pattern: "^\\+[0-9]{8,15}$",
                example: "+919876543210"
            },
            userName: { type: "string" },
            source: { type: "string" },
            media: {
                type: "object",
                additionalProperties: false,
                required: ["url", "filename"],
                properties: {
                    url: {
                        type: "string",
                        format: "uri",
                        pattern: "^https://"
                    },
                    filename: { type: "string" }
                }
            },
            templateParams: {
                type: "array",
                items: {
                    oneOf: [{ type: "string" }, { type: "number" }]
                }
            },
            tags: { type: "array", items: { type: "string" } },
            attributes: {
                type: "object",
                additionalProperties: { type: "string" }
            }
        }
    },
    AiSensyBulkTemplateRequest: {
        type: "object",
        additionalProperties: false,
        required: ["campaignName", "recipients"],
        properties: {
            campaignName: { type: "string" },
            source: { type: "string" },
            media: {
                type: "object",
                additionalProperties: false,
                required: ["url", "filename"],
                properties: {
                    url: { type: "string", format: "uri", pattern: "^https://" },
                    filename: { type: "string" }
                }
            },
            tags: { type: "array", items: { type: "string" } },
            attributes: {
                type: "object",
                additionalProperties: { type: "string" }
            },
            recipients: {
                type: "array",
                minItems: 1,
                maxItems: 1000,
                items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["destination", "userName"],
                    properties: {
                        destination: {
                            type: "string",
                            pattern: "^\\+[0-9]{8,15}$"
                        },
                        userName: { type: "string" },
                        templateParams: {
                            type: "array",
                            items: {
                                oneOf: [{ type: "string" }, { type: "number" }]
                            }
                        }
                    }
                }
            }
        }
    }
};

const gupshupOperation = {
    tags: ["Gupshup"],
    summary: "Send template message",
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/GupshupTemplateRequest"
                },
                example: {
                    destination: "919876543210",
                    template: {
                        id: "approved-template-id",
                        params: ["Vijay", "UK07BK5904", 4031]
                    }
                }
            }
        }
    },
    responses: {
        200: { $ref: "#/components/responses/Success" },
        400: { $ref: "#/components/responses/ValidationError" },
        502: { $ref: "#/components/responses/ProviderError" }
    }
};

const aiSensyOperation = {
    tags: ["AiSensy"],
    summary: "Send template message",
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/AiSensyTemplateRequest"
                },
                example: {
                    campaignName: "employee_onboarding",
                    destination: "+919876543210",
                    userName: "Rahul Sharma",
                    templateParams: ["Rahul Sharma", "1 September 2026"]
                }
            }
        }
    },
    responses: {
        200: { $ref: "#/components/responses/Success" },
        400: { $ref: "#/components/responses/ValidationError" },
        502: { $ref: "#/components/responses/ProviderError" }
    }
};

const aiSensyBulkOperation = {
    tags: ["AiSensy"],
    summary: "Queue a bulk template campaign",
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/AiSensyBulkTemplateRequest"
                },
                example: {
                    campaignName: "janmashtami_2026",
                    source: "IOT India Backend",
                    tags: ["janmashtami_2026"],
                    recipients: [
                        {
                            destination: "+919876543210",
                            userName: "Rahul",
                            templateParams: ["Rahul", "Management Team", "IoT India"]
                        }
                    ]
                }
            }
        }
    },
    responses: {
        202: { description: "Bulk campaign queued" },
        400: { $ref: "#/components/responses/ValidationError" },
        500: { description: "Campaign could not be queued" }
    }
};

export const whatsappSwaggerSpecification = {
    openapi: "3.0.3",
    info: { title: "WhatsApp", version: "1.0.0" },
    servers,
    tags: [{ name: "Gupshup" }, { name: "AiSensy" }],
    paths: {
        "/api/v1/whatsapp/gupshup/messages/template": {
            post: gupshupOperation
        },
        "/api/v1/whatsapp/aisensy/messages/template": {
            post: aiSensyOperation
        },
        "/api/v1/whatsapp/aisensy/messages/template/bulk": {
            post: aiSensyBulkOperation
        },
        "/api/v1/whatsapp/aisensy/campaigns/{campaignId}": {
            get: {
                tags: ["AiSensy"],
                summary: "Get bulk campaign progress",
                parameters: [{
                    name: "campaignId",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" }
                }],
                responses: {
                    200: { description: "Campaign progress" },
                    404: { description: "Campaign not found" }
                }
            }
        }
    },
    components: {
        schemas: whatsappSchemas,
        responses
    }
};

export const emailSwaggerSpecification = {
    openapi: "3.0.3",
    info: { title: "Email", version: "1.0.0" },
    servers,
    tags: [{ name: "Resend" }],
    paths: {
        "/api/email/send-template": {
            post: {
                tags: ["Resend"],
                summary: "Send template email",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/EmailTemplateRequest"
                            },
                            example: {
                                to: "candidate@example.com",
                                templateId: "interview-scheduled",
                                variables: {
                                    CANDIDATE_NAME: "Rahul Sharma",
                                    POSITION: "Customer Support Executive"
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { $ref: "#/components/responses/Success" },
                    400: { $ref: "#/components/responses/ValidationError" },
                    502: { $ref: "#/components/responses/ProviderError" }
                }
            }
        }
    },
    components: {
        schemas: {
            EmailTemplateRequest: {
                type: "object",
                additionalProperties: false,
                required: ["to", "templateId", "variables"],
                properties: {
                    to: { type: "string", format: "email" },
                    templateId: { type: "string" },
                    variables: {
                        type: "object",
                        minProperties: 1,
                        additionalProperties: {
                            oneOf: [{ type: "string" }, { type: "number" }]
                        }
                    }
                }
            }
        },
        responses
    }
};

export const swaggerUiOptions = {
    customSiteTitle: "Integration Services API",
    customCss: ".swagger-ui .information-container { display: none; }",
    customJsStr: `
        (() => {
            let observer;

            const updateModuleLabel = () => {
                const label = document.querySelector(
                    ".topbar .select-label span"
                );

                if (label) {
                    if (label.textContent !== "Select a module") {
                        label.textContent = "Select a module";
                    }

                    observer.disconnect();
                }
            };

            observer = new MutationObserver(updateModuleLabel);
            observer.observe(
                document.documentElement,
                { childList: true, subtree: true }
            );
            updateModuleLabel();
        })();
    `,
    explorer: true,
    swaggerOptions: {
        urls: [
            {
                url: "/api-docs/modules/whatsapp.json",
                name: "WhatsApp"
            },
            {
                url: "/api-docs/modules/email.json",
                name: "Email"
            }
        ],
        "urls.primaryName": "WhatsApp",
        docExpansion: "none",
        defaultModelsExpandDepth: -1,
        deepLinking: true
    }
};
