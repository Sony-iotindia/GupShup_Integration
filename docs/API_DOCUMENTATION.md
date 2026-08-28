# Integration Services API Documentation

## Base URL and request format

```text
http://localhost:3000
```

All payloads use JSON:

```http
Content-Type: application/json
```

## API architecture

Endpoints are grouped as **module → provider → resource**.

| Module | Provider | Method | Endpoint |
| --- | --- | --- | --- |
| WhatsApp | Gupshup | `POST` | `/api/v1/whatsapp/gupshup/messages/template` |
| WhatsApp | AiSensy | `POST` | `/api/v1/whatsapp/aisensy/messages/template` |
| Email | Resend | `POST` | `/api/email/send-template` |

---

# WhatsApp

## Gupshup: send template message

```http
POST /api/v1/whatsapp/gupshup/messages/template
```

The template must be approved in the configured Gupshup application.

### Payload fields

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `destination` | string | Yes | 8–15 digits without `+`. |
| `template.id` | string | Yes | Approved template ID. |
| `template.params` | array | Yes | String or number values. Use `[]` if empty. |
| `message` | object | No | Image, video, document, or location content. |
| `postbackTexts` | array | No | Quick-reply values with unique indexes. |

Unknown fields are rejected.

### Basic payload

```json
{
  "destination": "919876543210",
  "template": {
    "id": "approved-template-id",
    "params": ["Vijay", "UK07BK5904", 4031]
  }
}
```

### Image payload

```json
{
  "destination": "919876543210",
  "template": {
    "id": "approved-image-template-id",
    "params": ["Vijay"]
  },
  "message": {
    "type": "image",
    "image": {
      "link": "https://example.com/header.jpg"
    }
  }
}
```

Image, video, and document URLs must use HTTPS. Other supported `message` shapes are:

```json
{
  "type": "video",
  "video": {
    "link": "https://example.com/video.mp4"
  }
}
```

```json
{
  "type": "document",
  "document": {
    "link": "https://example.com/invoice.pdf",
    "filename": "invoice.pdf"
  }
}
```

`filename` is optional for documents.

```json
{
  "type": "location",
  "location": {
    "longitude": 77.209,
    "latitude": 28.6139,
    "name": "Office",
    "address": "New Delhi, India"
  }
}
```

For locations, longitude must be between `-180` and `180`; latitude must be between `-90` and `90`.

### Quick-reply payload field

```json
{
  "postbackTexts": [
    {
      "index": 0,
      "text": "PAY_NOW"
    },
    {
      "index": 1,
      "text": "REQUEST_CALLBACK"
    }
  ]
}
```

Each index must be an integer of `0` or greater and must be unique.

### Responses

Success — HTTP `200`:

```json
{
  "success": true,
  "data": {}
}
```

Invalid payload — HTTP `400`:

```json
{
  "success": false,
  "error": ["\"destination\" is required"]
}
```

Gupshup or network failure — HTTP `502`:

```json
{
  "success": false,
  "error": "Failed to send WhatsApp template"
}
```

`data` contains the response returned by Gupshup.

---

## AiSensy: send template message

```http
POST /api/v1/whatsapp/aisensy/messages/template
```

The campaign must already exist in the configured AiSensy account.

### Payload fields

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `campaignName` | string | Yes | AiSensy campaign name. |
| `destination` | string | Yes | `+` followed by 8–15 digits. |
| `userName` | string | Yes | Recipient name. |
| `source` | string | No | Source label. |
| `media` | object | No | HTTPS `url` and `filename`; both are required when used. |
| `templateParams` | array | No | String or number values. |
| `tags` | array | No | String values. |
| `attributes` | object | No | String keys and string values. |

Unknown fields are rejected.

### Payload

```json
{
  "campaignName": "employee_onboarding",
  "destination": "+919876543210",
  "userName": "Rahul Sharma",
  "templateParams": ["Rahul Sharma", "1 September 2026"],
  "media": {
    "url": "https://example.com/welcome.jpg",
    "filename": "welcome.jpg"
  },
  "source": "Frontend Application",
  "tags": ["employee"],
  "attributes": {
    "employee_id": "EMP-101"
  }
}
```

### Responses

Success — HTTP `200`:

```json
{
  "success": true,
  "data": {}
}
```

Invalid payload — HTTP `400`:

```json
{
  "success": false,
  "error": ["\"destination\" is required"]
}
```

AiSensy or network failure — HTTP `502`:

```json
{
  "success": false,
  "error": "Failed to send WhatsApp template through AiSensy"
}
```

`data` contains the response returned by AiSensy.

> Gupshup numbers do not include `+`. AiSensy numbers must include `+`.

---

# Email

## Resend: send template email

```http
POST /api/email/send-template
```

The template must already exist in the configured Resend account.

### Payload fields

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `to` | string | Yes | Valid recipient email address. |
| `templateId` | string | Yes | Resend template ID. |
| `variables` | object | Yes | At least one value; values must be strings or numbers. |

Unknown fields are rejected.

### Payload

```json
{
  "to": "candidate@example.com",
  "templateId": "interview-scheduled",
  "variables": {
    "CANDIDATE_NAME": "Rahul Sharma",
    "POSITION": "Customer Support Executive",
    "INTERVIEW_DATE": "28 August 2026",
    "INTERVIEW_TIME": "11:30 AM IST"
  }
}
```

### Responses

Success — HTTP `200`:

```json
{
  "success": true,
  "data": {}
}
```

Invalid payload — HTTP `400`:

```json
{
  "success": false,
  "error": ["\"to\" must be a valid email"]
}
```

Resend or network failure — HTTP `502`:

```json
{
  "success": false,
  "error": "Failed to send email template"
}
```

`data` contains the response returned by Resend.

---

# Backend-only endpoints

These endpoints are not normally called by the frontend.

## Gupshup WhatsApp webhook

```http
POST /api/whatsapp/webhook
```

Successful acknowledgement — HTTP `200`:

```text
OK
```

## Health check

```http
GET /
```

HTTP `200`:

```json
{
  "message": "WhatsApp service is running"
}
```
