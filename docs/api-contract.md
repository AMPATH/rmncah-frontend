# MPDSR API contract (frontend proposal)

This is what the MPDSR frontend expects from the backend. It is a proposal for the backend team to review: names, paths and fields can change, as long as both sides agree and `src/services/apiTypes.ts` is updated to match.

## General rules

- **Base URL:** set in the frontend's `.env` as `VITE_API_BASE_URL` (e.g. `https://mpdsr.example.org/api/v1`). During development it is `/api`, served by json-server.
- **Format:** JSON in and out, except file uploads (`multipart/form-data`).
- **Dates:** `"YYYY-MM-DD"`. Date-times: ISO 8601 in UTC (`"2026-11-13T09:30:00Z"`).
- **IDs:** strings. Records point to each other by id (`loggedAtId`, `responsiblePersonId`), never by name.
- **Auth:** every request except login sends `Authorization: Bearer <token>`.
- **Scoping:** the server returns only the records the signed-in user may see (their locations and everything under them, plus anything assigned to them). The frontend's own role checks only shape the screen.
- **Server-owned logic:** issue and recommendation codes (`ISS-2026-0001-R1`), statuses, routing (auto-assigned vs needs acceptance), reminders, auto-escalation, overdue marking and notifications are all done by the server.
- **Lists:** `?page=1&pageSize=20` returns `{ "items": [...], "page": 1, "pageSize": 20, "total": 57 }`.

## Errors

| Status | When | Frontend does |
|---|---|---|
| 400 / 422 | Validation failed | Shows `fieldErrors` next to the fields |
| 401 | Token missing or expired | Clears the token, goes to sign-in |
| 403 | Role not allowed | Shows "You don't have permission to do this" |
| 404 | Record not found | Shows a not-found message |
| 5xx | Server error | Shows `message` in a toast |

Error body:

```json
{ "message": "Validation failed", "fieldErrors": { "dateOfDeath": "Must be on or after the date of birth" } }
```

## Endpoints

### Auth and users

| Method | Path | Body / query | Returns |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, user: UserDto }` |
| GET | `/auth/me` | | `UserDto` |
| GET | `/users` | `?role=&locationId=` | `UserDto[]` |
| POST | `/users` | `UserDto` without id (admin) | `UserDto` |
| PATCH | `/users/:id` | changed fields (admin) | `UserDto` |

`UserDto`: `{ id, fullName, cadre, email, role, level, locationIds }`

Roles (the backend's predefined role codes): `SYSTEM_ADMIN` (module PLATFORM); `CHP`, `FACILITY_REPORTER`, `FACILITY_CHAIR`, `PCN_COORDINATOR`, `SUBCOUNTY_COORDINATOR`, `COUNTY_SURVEILLANCE_LEAD` (module MPDSR). Levels: `community`, `facility`, `sub-county`, `county`.

### Places and reference lists

| Method | Path | Returns |
|---|---|---|
| GET | `/locations` | `LocationDto[]`: `{ id, name, type, parentId }`, type one of `county`, `sub-county`, `facility`, `community-unit` |
| GET | `/reference/icd11-causes?search=haem` | `ReferenceItemDto[]`: `{ id, code, label }` |
| GET | `/reference/delay-factors` | `ReferenceItemDto[]`: `{ id, label, delayLevel }` |

### Issues

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/issues` | `CreateIssueRequest` (includes `recommendations[]`) | `IssueDto` with server-made `code` |
| GET | `/issues/:id` | | `IssueDto` |

`POST /issues` saves the issue and all its recommendations in **one transaction**, sets each recommendation's status (`Open`, or `Pending acceptance` for sub-county and county) and sends the notifications.

### Recommendations

| Method | Path | Body / query | Returns |
|---|---|---|---|
| GET | `/recommendations` | `?status=&mine=true&page=&pageSize=` | `Page<RecommendationDto>` |
| GET | `/recommendations/:id` | | `RecommendationDetailDto` (with `history[]`) |
| POST | `/recommendations/:id/accept` | | `RecommendationDto` |
| POST | `/recommendations/:id/escalate` | `{ direction, targetLevel, targetUserId, reason }` | `RecommendationDto` |
| POST | `/recommendations/:id/reassign` | `{ userId, dueDate, reason }` | `RecommendationDto` |
| POST | `/recommendations/:id/mark-done` | form data: `remarks`, optional `evidence` file | `RecommendationDto` |
| POST | `/recommendations/:id/decision` | `{ decision: "approve" or "reject", reason }` | `RecommendationDto` |

Each action returns the updated recommendation and adds an entry to its `history`.

### Notifications

| Method | Path | Returns |
|---|---|---|
| GET | `/notifications?unread=true` | `NotificationDto[]` for the signed-in user, newest first |
| POST | `/notifications/read-all` | 204 |

### Reports

| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/reports/summary` | `countyId, subCountyId, facilityId, issueType, setting, from, to` | `ReportSummaryDto` |
| GET | `/reports/export.csv` | same as above | CSV file |

The full field lists for every type are in `src/services/apiTypes.ts`.
