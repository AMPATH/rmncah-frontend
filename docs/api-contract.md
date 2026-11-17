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
| 409 | Duplicate (e.g. an email or place name already in use) | Shows `message` next to the field |
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
| POST | `/users` | `SaveUserRequest` (admin) | `UserDto` |
| PATCH | `/users/:id` | changed fields of `SaveUserRequest` (admin) | `UserDto` |
| POST | `/users/:id/deactivate` | (admin) | `UserDto` with `active: false` |

`UserDto`: `{ id, fullName, cadre, email, role, level, locationIds, active }`
`SaveUserRequest`: `{ fullName, cadre, email, role, locationIds }`. The server sets `level` from the role, and rejects a duplicate email with 409.

Which places a role is assigned to: `CHP` → community units; `FACILITY_REPORTER`, `FACILITY_CHAIR` → facilities; `PCN_COORDINATOR`, `SUBCOUNTY_COORDINATOR` → sub-counties; `COUNTY_SURVEILLANCE_LEAD` → counties; `SYSTEM_ADMIN` → none.

Roles (the backend's predefined role codes): `SYSTEM_ADMIN` (module PLATFORM); `CHP`, `FACILITY_REPORTER`, `FACILITY_CHAIR`, `PCN_COORDINATOR`, `SUBCOUNTY_COORDINATOR`, `COUNTY_SURVEILLANCE_LEAD` (module MPDSR). Levels: `community`, `facility`, `sub-county`, `county`.

### Places and reference lists

| Method | Path | Returns |
|---|---|---|
| GET | `/locations` | `LocationDto[]`: `{ id, name, type, parentId }`, type one of `county`, `sub-county`, `facility`, `community-unit` |
| POST | `/locations` | (admin) body `CreateLocationRequest`: `{ name, type, parentId }` → `LocationDto`. The parent must be one level up (a facility sits in a sub-county); 409 if the name is taken |
| GET | `/reference/icd11-causes?search=haem` | `ReferenceItemDto[]`: `{ id, code, label }` |
| GET | `/reference/delay-factors` | `ReferenceItemDto[]`: `{ id, label, delayLevel }` |

### Issues

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/issues` | `?page=&pageSize=` | `Page<IssueDto>`, newest first, only issues at the user's places |
| POST | `/issues` | `CreateIssueRequest` (includes `recommendations[]`) | `IssueDto` with server-made `code` |
| GET | `/issues/:id` | | `IssueDto` |
| POST | `/issues/:id/recommendations` | `AddRecommendationRequest` | `RecommendationDto` with the next code (`…-R3`) |
| PATCH | `/issues/:id` | `EditIssueRequest` (changed fields + `reason`) | `IssueDto` |
| POST | `/issues/:id/cancel` | `{ reason }` | `IssueDto` with `cancelled: true` |
| GET | `/issues/:id/history` | | `IssueEventDto[]` (who, when, reason, field from→to) |

**Editing an issue.** The person who logged it may edit within **7 days**; the facility MPDSR chair (`recommendation.approve`) may edit until all the issue's recommendations are Closed or Cancelled. Editable: date of birth, gender, cause of death, period of death, gestation weeks, days postpartum, dates of death, notification and audit, contributing factors, comments. Not editable: issue type, setting, place logged at, code, date logged. A reason is required, the same date checks as `POST /issues` apply, and a contributing factor that a recommendation uses as its gap can't be removed. The server records each edit in the issue history.

**Cancelling an issue.** Facility MPDSR chair only, with a reason. The server cancels the issue's recommendations that are still running (with the same reason) and leaves cancelled issues out of the reports.

`POST /issues` saves the issue and all its recommendations in **one transaction**, sets each recommendation's status (`Open`, or `Pending acceptance` for sub-county and county) and sends the notifications. `POST /issues/:id/recommendations` does the same for one recommendation added later (e.g. after the review meeting).

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
| PATCH | `/recommendations/:id` | `{ text, gap, dueDate }` (before work starts) | `RecommendationDto` |
| POST | `/recommendations/:id/cancel` | `{ reason }` | `RecommendationDto` with status `Cancelled` |

Each action returns the updated recommendation and adds an entry to its `history`.

**History entry** (`RecommendationEventDto`): `{ id, at, action, byUserId, byUserName, fromStatus, toStatus, note }`. `action` is one of `created`, `accepted`, `escalated`, `de-escalated`, `auto-escalated`, `reassigned`, `marked-done`, `approved`, `rejected`, `marked-overdue`, `edited`, `cancelled`. `byUserId` is `null` for steps the server does on its own. `note` holds the reason, remarks or rejection reason.

**Who may do what** (the frontend shows the same rules; the server must enforce them):

| Action | Allowed when | Who |
|---|---|---|
| accept, escalate | status `Pending acceptance` | the responsible person |
| mark-done | status `Open`, `In progress` or `Overdue` | the responsible person |
| decision | status `Pending approval` | the facility MPDSR chair |
| reassign | status `Overdue` | the PCN coordinator |
| edit (PATCH) | status `Open` or `Pending acceptance` | staff who add recommendations (CHP, facility reporter, facility chair) |
| cancel | any status except `Closed` and `Cancelled` | the facility MPDSR chair |

**Status changes:** accept → `In progress`; escalate/de-escalate → `Pending acceptance` with the new level and person; mark-done → `Pending approval`; approve → `Closed`; reject → `In progress`; reassign → `Pending acceptance` with the new person and due date, and `timesRedone` + 1; edit → status unchanged; cancel → `Cancelled` (final, like `Closed`).

### Jobs the server runs on its own

- **Overdue:** every day, a recommendation that is `Open`, `Pending acceptance` or `In progress` and whose `dueDate` is before today becomes `Overdue`. Add a `marked-overdue` history entry and notify the responsible person (category `overdue`).
- **Reminders and auto-escalation:** while a recommendation is `Pending acceptance`, send a daily reminder (category `reminder`). When the days in the escalation matrix for its level have passed, move it to the PCN coordinator with the comment "Auto-escalated to PCN to reassign or action" (history `auto-escalated`).

### Escalation matrix

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/escalation-matrix` | | `EscalationMatrixDto` |
| PATCH | `/escalation-matrix` | (admin) changed levels | `EscalationMatrixDto` |

`EscalationMatrixDto`: `{ community, facility, "sub-county", county }`, each the whole number of days (1 to 30) the responsible person has to accept. Notification texts use it, e.g. "needs your acceptance within 3 days".

### Notifications

| Method | Path | Returns |
|---|---|---|
| GET | `/notifications?unread=true` | `NotificationDto[]` for the signed-in user, newest first |
| PATCH | `/notifications/:id` | body `{ read: true }` → 204 (opening a notification) |
| POST | `/notifications/read-all` | 204 |

`NotificationDto`: `{ id, at, message, recommendationId, recommendationCode, from, category, read }`. `category` is one of `assigned`, `acceptance-needed`, `reminder`, `escalated`, `overdue`, `approval-needed`, `approved`, `rejected`, `cancelled`.

### Reports

| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/reports/summary` | `countyId, subCountyId, facilityId, issueType, setting, from, to` | `ReportSummaryDto` |
| GET | `/reports/export.csv` | same as above | CSV file |

`ReportSummaryDto` holds the counts by issue type, recommendation status, classification and level; the "needs action" counts; `performance`; and `byPlace` rows. How the figures are worked out (the frontend's own stand-in does the same, see `src/features/dashboard/utils/reportFigures.ts` and its tests):

- **Rejected / escalated:** recommendations rejected (or escalated/de-escalated) **at least once**, each counted once.
- **Average days to acceptance:** from when it started waiting (logged, or the last escalation or reassignment) to when it was accepted, over every acceptance.
- **Closed by the due date:** closed recommendations whose approval was on or before their `dueDate`.
- **Redone:** recommendations with `timesRedone` above 0, and the total of `timesRedone`.
- **By place:** for each place where issues were logged: issues, recommendations, still running (not `Closed` or `Overdue`), overdue, closed.

## What the frontend does itself until the backend exists

With json-server the frontend fakes some server work. Each of these is marked in the code and will be removed:

- Saves an issue, then each recommendation, then each notification, as separate calls (`issueService.ts`).
- Applies each action as three calls: change the recommendation, add a history entry (`/recommendationEvents`), send notifications (`recommendationService.ts`).
- Marks recommendations overdue, sends the daily acceptance reminders and auto-escalates to the PCN coordinator when a page loads (`markOverdue()`, `checkAcceptanceDeadlines()`).
- Edits and cancels an issue as separate calls: change the issue, add a history entry (`/issueEvents`), then cancel each running recommendation (`issueEditService.ts`).
- Works out the report figures from the raw records (`reportFigures.ts`).
- Keeps evidence files (up to 2 MB) inside json-server as data (`/evidence`); the real API receives them in `mark-done`.
- Refers to places and users **by name** in some records (`loggedAt`, `assignedLocations`); the backend uses ids.

The full field lists for every type are in `src/services/apiTypes.ts`.

## Open questions for the backend team

1. Can a user have **one role or several**?
2. Is there a **permission table**, and do the sub-county and county roles **accept** work or only monitor it?
3. Does `/auth/me` return the user's **`locationIds`**?
