# ResQ-Link — API Contract (MVP)

> **Base URL:** `http://localhost:8080/api/v1`
> **Auth:** None (stripped for fast MVP — all endpoints are open)
> **Content Types:** `multipart/form-data` for file uploads, `application/json` for everything else

---

## Static Assets

Uploaded images (photos attached to reports) are served as static files:

```
GET http://localhost:8080/uploads/<filename>
```

When the API returns a `photo_path` value like `uploads/1749664800000-482910.jpg`, construct the full URL on the frontend as:

```js
const photoUrl = `http://localhost:8080/${report.photo_path}`;
// → "http://localhost:8080/uploads/1749664800000-482910.jpg"
```

If `photo_path` is `null`, no image was uploaded — display a placeholder.

---

## Common Response Envelope

All endpoints return a consistent JSON envelope:

```json
{
  "success": true | false,
  "message": "Human-readable status message.",
  "data": { ... }
}
```

- `success` is always present.
- `message` is always present.
- `data` is present only on successful responses that return payload.

---

## Error Response Reference

All endpoints share the same error shapes:

### `400 Bad Request` — Validation Error

```json
{
  "success": false,
  "message": "Missing required fields: ..."
}
```

Or, for Sequelize model-level validation failures:

```json
{
  "success": false,
  "message": "Validation error.",
  "errors": [
    "Validation isIn on report_type failed"
  ]
}
```

### `404 Not Found`

```json
{
  "success": false,
  "message": "No report found for tracking code: TRK-XXXX"
}
```

### `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## Endpoints

---

### 1. Submit Missing or Rescued Report

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/intake/report` |
| **Content-Type** | `multipart/form-data` |
| **Connected Screens** | `/report/missing`, `/report/rescued` |

#### Request — Form Fields

| Field | Type | Required | Constraints |
|---|---|---|---|
| `photo` | File | No | MIME: `image/jpeg`, `image/png`, `image/webp`. Max size: 10 MB. |
| `report_type` | String | **Yes** | Enum: `MISSING`, `RESCUED`, `HOSPITAL_PATIENT`, `UNIDENTIFIED_BODY` |
| `source_channel` | String | **Yes** | Enum: `RELIEF_CAMP`, `HOSPITAL`, `PUBLIC_PORTAL`, `CALL_HELPLINE` |
| `first_name` | String | **Yes** | Will be trimmed and HTML-escaped server-side. |
| `last_name` | String | No | Will be trimmed and HTML-escaped server-side. |
| `approximate_age` | Number | No | Integer. If < 18, server auto-sets `is_minor = true`. |
| `gender` | String | **Yes** | Enum: `MALE`, `FEMALE`, `OTHER`, `UNKNOWN` |
| `distinguishing_marks` | String | No | Free text (scars, tattoos, birthmarks). |
| `clothing_description` | String | No | Free text. |
| `last_known_location` | String | **Yes** | Shelter name, camp ID, or last seen area. |

#### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "Report submitted successfully.",
  "data": {
    "tracking_code": "TRK-8821"
  }
}
```

> **Note:** The matching engine is triggered automatically in the background after creation. The response returns immediately without waiting for matching to complete.

#### Error Responses

| Status | Cause |
|---|---|
| `400` | Missing required fields (`report_type`, `source_channel`, `first_name`, `gender`, `last_known_location`) |
| `400` | Invalid enum value (e.g., `report_type: "LOST"`) — returns `errors` array |
| `400` | Invalid file type or file too large — returns `code: "LIMIT_UNEXPECTED_FILE"` or `"LIMIT_FILE_SIZE"` |
| `500` | Database or server error |

#### Upload Error Shape

```json
{
  "success": false,
  "message": "Upload error: Invalid file type: application/pdf. Only jpeg, png, and webp are allowed.",
  "code": "LIMIT_UNEXPECTED_FILE"
}
```

---

### 2. Family Case Status Tracking

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/track/:trackingCode` |
| **Content-Type** | — (no body) |
| **Connected Screen** | `/track/[code]` |

#### Request — URL Parameter

| Parameter | Type | Required | Example |
|---|---|---|---|
| `trackingCode` | String | **Yes** | `TRK-8821` |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "tracking_code": "TRK-8821",
    "status": "UNMATCHED",
    "timeline": [
      {
        "label": "Report Registered",
        "reached": true
      },
      {
        "label": "Cross-Referenced Across Facilities",
        "reached": false
      },
      {
        "label": "Potential Match Located",
        "reached": false
      },
      {
        "label": "Verified & Safe",
        "reached": false
      }
    ],
    "details": {
      "first_name": "Arun",
      "last_name": "Kumar",
      "approximate_age": 28,
      "last_known_location": "Sector 4, Block B — near community hall",
      "photo_path": "uploads/1749664800000-482910.jpg"
    }
  }
}
```

#### Status → Timeline Mapping

The `timeline` array always has 4 milestones. The `reached` flags are set based on the report's current `status`:

| Report Status | Milestones Reached |
|---|---|
| `UNMATCHED` | ✅ Report Registered |
| `PENDING_VERIFICATION` | ✅ Report Registered → ✅ Cross-Referenced → ✅ Potential Match Located |
| `RESOLVED_LOCATED` | ✅ All four milestones |
| `CLOSED` | ✅ All four milestones |

#### Error Responses

| Status | Cause |
|---|---|
| `404` | No report found for the given tracking code |
| `500` | Database or server error |

---

### 3. Fetch Pending Triage Candidates

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/matching/candidates` |
| **Content-Type** | — (no body) |
| **Connected Screen** | `/dashboard/triage` |

#### Request — Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `minScore` | Float | No | `0.60` | Minimum `composite_score` threshold. Candidates below this are excluded. |
| `limit` | Integer | No | `20` | Maximum number of candidates to return. |

**Example:** `GET /api/v1/matching/candidates?minScore=0.70&limit=10`

#### Success Response — `200 OK`

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "b90c0d0c-f581-48b2-b11e-f428aea7e047",
      "source_report_id": "db76ecc9-f8c7-4e92-9c08-ecdeeb973de9",
      "target_report_id": "20eecda3-5c2a-4fd0-bcc3-5faaa0f4ef11",
      "composite_score": 0.89,
      "face_similarity_score": 0.91,
      "phonetic_similarity_score": 0.95,
      "discrepancy_summary": {
        "mode": "AI_FULL",
        "face_similarity": 0.91,
        "demographic_similarity": 0.95,
        "has_face": true,
        "db_trigram_score": 0.72
      },
      "status": "PENDING_REVIEW",
      "reviewed_by": null,
      "reviewed_at": null,
      "createdAt": "2026-09-11T17:16:54.237Z",
      "updatedAt": "2026-09-11T17:16:54.237Z",
      "sourceReport": {
        "id": "db76ecc9-f8c7-4e92-9c08-ecdeeb973de9",
        "first_name": "Arun",
        "last_name": "Kumar",
        "approximate_age": 28,
        "photo_path": null,
        "last_known_location": "Sector 4, Block B — near community hall",
        "report_type": "MISSING"
      },
      "targetReport": {
        "id": "20eecda3-5c2a-4fd0-bcc3-5faaa0f4ef11",
        "first_name": "Aroon",
        "last_name": "Kumaar",
        "approximate_age": 30,
        "photo_path": null,
        "last_known_location": "Camp Green-4 Medical Tent",
        "report_type": "RESCUED"
      }
    }
  ]
}
```

#### `discrepancy_summary` — Possible Modes

| Mode | Meaning |
|---|---|
| `AI_FULL` | AI sidecar responded successfully. Contains `face_similarity`, `demographic_similarity`, `has_face`. |
| `DEGRADED_TEXT_ONLY` | AI sidecar timed out or failed. Score is based on text similarity only. Contains `reason` (`AI_SIDECAR_TIMEOUT` or `AI_SIDECAR_ERROR`). |
| `SEED_DATA` | Manually seeded demo data. |

#### Error Responses

| Status | Cause |
|---|---|
| `500` | Database or server error |

---

### 4. Adjudicate / Verify Match (HITL)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/matching/verify` |
| **Content-Type** | `application/json` |
| **Connected Screen** | `/dashboard/triage` (Approve / Dismiss buttons) |

#### Request Body

```json
{
  "candidate_id": "b90c0d0c-f581-48b2-b11e-f428aea7e047",
  "decision": "APPROVE"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `candidate_id` | UUID (String) | **Yes** | Must reference an existing `MatchCandidate`. |
| `decision` | String | **Yes** | Enum: `APPROVE`, `DISMISS` |

#### Success Response — APPROVE — `200 OK`

```json
{
  "success": true,
  "message": "Match approved. Reports merged into a unified person record.",
  "data": {
    "master_person_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Side effects on APPROVE (atomic transaction):**
- `MatchCandidate.status` → `APPROVED`
- Source report `status` → `RESOLVED_LOCATED`
- Target report `status` → `RESOLVED_LOCATED`
- New `MasterPerson` record created with merged data

#### Success Response — DISMISS — `200 OK`

```json
{
  "success": true,
  "message": "Match candidate dismissed."
}
```

**Side effects on DISMISS:**
- `MatchCandidate.status` → `DISMISSED`
- No changes to source/target reports

#### Error Responses

| Status | Cause |
|---|---|
| `400` | Missing `candidate_id` or `decision` |
| `400` | Invalid `decision` value (not `APPROVE` / `DISMISS`) |
| `404` | `MatchCandidate` not found for the given `candidate_id` |
| `500` | Database error — entire transaction is rolled back, no partial state |

---

---

### 5. Triage Stats Overview

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/matching/stats` |
| **Connected Screen** | `/dashboard/triage` |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "total": 2,
    "pending": 0,
    "approved": 1,
    "dismissed": 1
  }
}
```

---

### 6. Record Registry (Master Persons)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/persons` (alias: `/api/v1/records`) |
| **Connected Screen** | `/dashboard/records` |

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `search` | String | No | Case-insensitive filter on first or last name |
| `status` | String | No | Enum: `SHELTERED`, `HOSPITALIZED`, `REUNITED`, `DECEASED` |
| `facility` | String | No | Case-insensitive filter on current facility |
| `limit` | Integer | No | Max records (default: 50) |
| `offset` | Integer | No | Pagination offset (default: 0) |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "data": [
    {
      "id": "246badfb-638e-436d-b9a4-571746e57769",
      "canonical_first_name": "Antriksh",
      "canonical_last_name": null,
      "confirmed_status": "SHELTERED",
      "current_facility": "manipal university jaipur",
      "primary_photo_path": null,
      "merged_report_ids": ["dd2d055f-...", "7a5bcaeb-..."],
      "createdAt": "2026-09-11T18:25:40.342Z",
      "updatedAt": "2026-09-11T18:25:40.342Z"
    }
  ]
}
```

---

### 7. Single Record Details (with Merged Reports)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/persons/:id` (alias: `/api/v1/records/:id`) |
| **Connected Screen** | `/dashboard/records` (View Detail Dialog) |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "246badfb-638e-436d-b9a4-571746e57769",
    "canonical_first_name": "Antriksh",
    "canonical_last_name": null,
    "confirmed_status": "SHELTERED",
    "current_facility": "manipal university jaipur",
    "primary_photo_path": null,
    "merged_report_ids": ["dd2d055f-...", "7a5bcaeb-..."],
    "createdAt": "2026-09-11T18:25:40.342Z",
    "updatedAt": "2026-09-11T18:25:40.342Z",
    "merged_reports": [
      {
        "id": "dd2d055f-...",
        "tracking_code": "TRK-EV1D",
        "report_type": "RESCUED",
        "first_name": "Antriksh",
        "approximate_age": 22,
        "gender": "MALE",
        "last_known_location": "near manipal college",
        "status": "RESOLVED_LOCATED"
      }
    ]
  }
}
```

---

### 8. System Metrics Overview

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/metrics` |
| **Connected Screen** | Home (`/`) Metrics Ticker |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "total_reports": 6,
    "people_matched": 1,
    "active_searches": 4,
    "families_reunited": 0
  }
}
```

---

## Quick Reference

| # | Method | Endpoint | Screen | Purpose |
|---|---|---|---|---|
| 1 | `POST` | `/api/v1/intake/report` | `/report/missing`, `/report/rescued` | Submit a new report |
| 2 | `GET` | `/api/v1/track/:trackingCode` | `/track/[code]` | Family status lookup |
| 3 | `GET` | `/api/v1/matching/candidates` | `/dashboard/triage` | Match cards for triage |
| 4 | `GET` | `/api/v1/matching/stats` | `/dashboard/triage` | Triage counts summary |
| 5 | `POST` | `/api/v1/matching/verify` | `/dashboard/triage` | Approve or dismiss a match |
| 6 | `GET` | `/api/v1/persons` | `/dashboard/records` | Master registry records |
| 7 | `GET` | `/api/v1/persons/:id` | `/dashboard/records` | Person details & merged reports |
| 8 | `GET` | `/api/v1/metrics` | Home (`/`) | Live counters overview |

---

## Enum Reference

### `report_type`
`MISSING` · `RESCUED` · `HOSPITAL_PATIENT` · `UNIDENTIFIED_BODY`

### `source_channel`
`RELIEF_CAMP` · `HOSPITAL` · `PUBLIC_PORTAL` · `CALL_HELPLINE`

### `gender`
`MALE` · `FEMALE` · `OTHER` · `UNKNOWN`

### `status` (Report)
`UNMATCHED` · `PENDING_VERIFICATION` · `RESOLVED_LOCATED` · `CLOSED`

### `status` (MatchCandidate)
`PENDING_REVIEW` · `APPROVED` · `DISMISSED`

### `confirmed_status` (MasterPerson)
`SHELTERED` · `HOSPITALIZED` · `REUNITED` · `DECEASED`

### `decision` (Verify Endpoint)
`APPROVE` · `DISMISS`
