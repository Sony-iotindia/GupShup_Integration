# Gupshup SMS Integration Design

## Objective

Add outbound SMS sending and delivery-event receipt to the existing Express service without coupling SMS behavior to the WhatsApp integration. The code will target Gupshup's modern app-based SMS API and remain safely inactive until SMS credentials are configured.

## Scope

The integration will provide:

- `POST /api/sms/send` for outbound SMS messages.
- `POST /api/sms/webhook` for Gupshup delivery events.
- Request validation, upstream error handling, and automated tests.
- Environment variables documented for credentials obtained later from the dashboard.

The integration will not provide bulk sending, scheduling, retries, persistence, inbound two-way SMS processing, the legacy Enterprise Gateway, or India-specific DLT fields beyond the configured sender ID. Those features require the final SMS account contract and are outside this change.

## Architecture

SMS will follow the existing project layers:

```text
routes/sms.routes.js
    -> controllers/sms.controller.js
        -> validators/sms.validator.js
        -> services/gupshup-sms.service.js

Gupshup delivery event
    -> webhooks/sms.webhook.js
        -> application logger
```

The Express app factory will accept an injected SMS sender for testing, just as it accepts the WhatsApp template sender. WhatsApp routes and behavior will remain unchanged.

## Configuration

The SMS module will read:

- `GUPSHUP_SMS_APP_ID`
- `GUPSHUP_SMS_API_KEY`
- `GUPSHUP_SMS_SENDER_ID`

The service may start while these variables are absent. An attempted SMS send without complete configuration will return HTTP `503` with a stable message indicating that SMS is not configured. Credentials will never be logged or returned to clients.

## Outbound API

Request:

```http
POST /api/sms/send
Content-Type: application/json
```

```json
{
  "destination": "919876543210",
  "message": "Your interview is scheduled for 28 August 2026 at 11:30 AM."
}
```

Validation rules:

- `destination` contains 8 to 15 digits in E.164 form without a leading `+`.
- `message` is trimmed, nonempty, and no longer than 160 characters.
- Unknown fields are rejected.

The service will POST URL-encoded fields to:

```text
http://api.gupshup.io/sms/v1/message/{appId}
```

Headers:

```text
Authorization: {SMS API key}
Content-Type: application/x-www-form-urlencoded
```

Form fields:

- `destination`
- `message`
- `source`, taken from `GUPSHUP_SMS_SENDER_ID`

Successful Gupshup responses will be returned as `{ success: true, data: ... }`. Input errors return `400`, missing configuration returns `503`, and Gupshup/network failures return `502`.

## Delivery Webhook

Request:

```http
POST /api/sms/webhook
```

The handler will log the received object and immediately return HTTP `200` with an empty response. Expected Gupshup delivery states include `enqueued`, `sent`, `delivered`, and `failed`. No event persistence or state transition logic will be introduced yet.

## Testing

Tests will cover:

- Valid outbound HTTP request and response.
- Invalid destination, empty message, oversized message, and unknown fields.
- Missing SMS configuration.
- Correct Gupshup URL, headers, and URL-encoded form fields.
- Upstream Gupshup failure mapping.
- Delivery webhook logging and empty `200` acknowledgement.
- Regression verification of all existing WhatsApp tests.

External SMS sends will not run during automated tests. The HTTP client boundary will be injected so tests remain deterministic and do not incur charges.

## Future Extension Points

After credentials and the live account contract are available, the SMS service can add DLT-specific identifiers, longer-message behavior, persistence, and status tracking without modifying WhatsApp components or changing the public SMS route structure.
