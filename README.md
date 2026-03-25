# Boooply AI Interviews SDK

Official JavaScript/Node.js SDK for the [Boooply AI Interviews](https://boooply.com) API.

## Installation

```bash
npm install @boooply/ai-interviews-sdk
```

## Quick Start

```javascript
const { BoooplyClient } = require('@boooply/ai-interviews-sdk');

const client = new BoooplyClient({
  apiKey: process.env.BOOOPLY_API_KEY,       // Required — bply_... format
  baseUrl: process.env.BOOOPLY_BASE_URL,     // Required — e.g. https://api.meetings.boooply.com
  timeout: 30000,                            // Optional — request timeout in ms
});

// Create an AI interview
const interview = await client.interviews.create({
  type: 'ai',
  jobRole: 'Senior Frontend Engineer',
  candidate: { name: 'Jane Doe', email: 'jane@example.com' },
  skills: ['React', 'TypeScript'],
  durationMinutes: 20,
});

console.log('Interview created:', interview.meetingCode);
console.log('Join URL:', interview.url);
```

## Authentication

The SDK uses Bearer token authentication. Your API key is automatically included in all requests.

### Getting an API Key

Contact Boooply or use the platform onboarding endpoint (see [Platform Providers](#platform-providers)).

```bash
# .env
BOOOPLY_API_KEY=bply_org_xxxxxxxxxxxxx
BOOOPLY_BASE_URL=https://api.meetings.boooply.com
```

> **Security:** Store your API key in environment variables. Never expose it in client-side code.

---

## API Reference

The SDK uses a **namespaced API** pattern:

```
client.interviews.*    — Create, list, manage interviews
client.ai.*            — AI-powered features
client.organization.*  — Organization info
```

---

### `client.interviews`

#### `interviews.create(data)` — Create an interview

A single unified method for creating AI interviews, human interviews, and team meetings.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | `'ai' \| 'human' \| 'team'` | Yes | Interview type |
| `jobRole` | `string` | Yes (ai/human) | Job role or title |
| `candidate` | `{ name, email }` | Yes (ai) | Candidate info |
| `participants` | `Array<{ name, email, role }>` | Yes (human/team) | Participant list |
| `scheduledAt` | `string` | No | ISO 8601 datetime (required for `FIXED` mode) |
| `schedulingMode` | `'IMMEDIATE' \| 'FIXED' \| 'CANDIDATE_PICKS'` | No | Scheduling mode (see [Scheduling Modes](#scheduling-modes)) |
| `availableSlots` | `Array<{ start, end }>` | No | Time slots to offer the candidate (used with `CANDIDATE_PICKS` mode, max 50) |
| `durationMinutes` | `number` | No | Duration (default: 30, min: 5) |
| `skills` | `string[]` | No | Skills to evaluate |
| `seniority` | `'JUNIOR' \| 'MID' \| 'SENIOR' \| 'LEAD' \| 'PRINCIPAL'` | No | Seniority level |
| `department` | `string` | No | Department name |
| `jobDescription` | `string` | No | Full job description |
| `candidateCV` | `string` | No | CV/resume text |
| `questions` | `string[]` | No | Custom interview questions |
| `aiGenerate` | `boolean` | No | Auto-generate questions with AI |
| `workSetup` | `'REMOTE' \| 'ONSITE' \| 'HYBRID'` | No | Work arrangement |
| `employmentType` | `'FULL_TIME' \| 'PART_TIME' \| 'CONTRACT'` | No | Employment type |
| `evaluationFocus` | `string` | No | `'knowledge' \| 'balanced' \| 'communication' \| 'problem_solving' \| 'culture'` |
| `title` | `string` | No | Custom interview title. Default: "AI Interview with {name} for {role} at {company}" |
| `category` | `string` | No | Interview category: `SCREENING` \| `TECHNICAL` \| `BEHAVIORAL` \| `ASSIGNMENT` \| `CULTURAL` \| `CASE_STUDY` \| `PANEL` \| `FINAL` |
| `stage` | `string` | No | Free-form stage label from your ATS (e.g., "Round 1", "Final Interview", "Phone Screen") |
| `companyName` | `string` | No | Company name (defaults to your organization name). Useful for agencies posting for multiple clients |
| `sendCandidateFeedback` | `boolean` | No | Send AI-generated feedback email to candidate after evaluation |
| `externalJobId` | `string` | No | External job/position ID from your ATS |

> **Emails:** When an interview is created, Boooply automatically sends invitation emails to all participants from `noreply@boooply.com`. Candidates receive a join link (or booking link for `CANDIDATE_PICKS` mode), and interviewers receive a separate join link. If `sendCandidateFeedback` is enabled, the candidate also receives an AI-generated feedback email after the evaluation completes.

**Examples:**

```javascript
// AI Interview — candidate talks to AI interviewer
const ai = await client.interviews.create({
  type: 'ai',
  jobRole: 'Frontend Engineer',
  candidate: { name: 'Jane Doe', email: 'jane@example.com' },
  skills: ['React', 'TypeScript', 'CSS'],
  seniority: 'SENIOR',
  durationMinutes: 20,
  aiGenerate: true,
  evaluationFocus: 'balanced',
  externalJobId: 'job_123',  // links to your ATS position
});

// Human Interview — real interviewer + candidate
const human = await client.interviews.create({
  type: 'human',
  jobRole: 'Backend Engineer',
  scheduledAt: '2026-04-01T14:00:00Z',
  participants: [
    { name: 'Jane Doe', email: 'jane@example.com', role: 'CANDIDATE' },
    { name: 'Bob Smith', email: 'bob@company.com', role: 'INTERVIEWER' },
  ],
  skills: ['Node.js', 'PostgreSQL'],
});

// Human Interview — let candidate pick a time slot
const flexible = await client.interviews.create({
  type: 'human',
  jobRole: 'Product Designer',
  schedulingMode: 'CANDIDATE_PICKS',
  participants: [
    { name: 'Jane Doe', email: 'jane@example.com', role: 'CANDIDATE' },
    { name: 'Bob Smith', email: 'bob@company.com', role: 'INTERVIEWER' },
  ],
  availableSlots: [
    { start: '2026-04-01T09:00:00Z', end: '2026-04-01T10:00:00Z' },
    { start: '2026-04-01T14:00:00Z', end: '2026-04-01T15:00:00Z' },
    { start: '2026-04-02T11:00:00Z', end: '2026-04-02T12:00:00Z' },
  ],
  skills: ['Figma', 'Design Systems'],
});
// → Candidate receives a booking link to pick one of the offered slots

// Team Meeting — internal meeting with transcription
const team = await client.interviews.create({
  type: 'team',
  scheduledAt: '2026-04-01T10:00:00Z',
  participants: [
    { name: 'Alice', email: 'alice@company.com', role: 'HOST' },
    { name: 'Bob', email: 'bob@company.com', role: 'PARTICIPANT' },
    { name: 'Carol', email: 'carol@company.com', role: 'PARTICIPANT' },
  ],
});
```

**Returns:**

```javascript
{
  meetingCode: 'Boooply-AI-1234567890',
  url: 'https://meetings.boooply.com/join/Boooply-AI-1234567890',
  meetingType: 'AI_ONLY',
  sessionStatus: 'SCHEDULED',
  participants: [
    { name: 'Jane Doe', email: 'jane@example.com', role: 'CANDIDATE', joinToken: '...' }
  ]
}
```

---

#### Scheduling Modes

Control when the interview takes place:

| Mode | Behavior | Available for |
|------|----------|---------------|
| `IMMEDIATE` | Interview is available to join right away (default for AI interviews) | AI, Human, Team |
| `FIXED` | Interview is scheduled for a specific `scheduledAt` datetime | AI, Human, Team |
| `CANDIDATE_PICKS` | Candidate receives a booking link to choose from `availableSlots` | AI, Human only |

> **Note:** `CANDIDATE_PICKS` is not available for team meetings — there is no candidate to send a booking link to. Use `IMMEDIATE` or `FIXED` instead.

**`CANDIDATE_PICKS` flow:**

1. You create the interview with `schedulingMode: 'CANDIDATE_PICKS'` and an `availableSlots` array
2. The candidate receives an email with a booking link
3. The candidate picks one of the offered time slots
4. The interview is confirmed — all participants are notified and calendar events are created
5. The booking link expires after 7 days if no slot is selected

Each slot in `availableSlots` is an object with `start` and `end` (ISO 8601 strings). You can offer up to 50 slots. Make sure each slot's duration matches the `durationMinutes` value — the booking page displays the time range based on the interview duration.

```javascript
// 30-minute interview → each slot spans 30 minutes
await client.interviews.create({
  type: 'human',
  jobRole: 'Product Designer',
  durationMinutes: 30,
  schedulingMode: 'CANDIDATE_PICKS',
  participants: [
    { name: 'Jane', email: 'jane@example.com', role: 'CANDIDATE' },
    { name: 'Bob', email: 'bob@company.com', role: 'INTERVIEWER' },
  ],
  availableSlots: [
    { start: '2026-04-01T09:00:00Z', end: '2026-04-01T09:30:00Z' },
    { start: '2026-04-01T14:00:00Z', end: '2026-04-01T14:30:00Z' },
  ],
});
```

> **Tip for ATS integrations:** You have two options for providing time slots:
> 1. **Pull from Boooply** — Use `getAvailability()` to fetch slots from the interviewer's Google Calendar already connected in Boooply (see below)
> 2. **Push from your ATS** — Use your own calendar integration and pass `availableSlots` directly

---

#### `interviews.getAvailability(params)` — Get interviewer availability

Fetch available time slots from a team member's Google Calendar connected in Boooply. This lets you pull interviewer availability without building your own calendar integration.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | Yes | Team member's email address |
| `durationMinutes` | `number` | No | Slot duration in minutes (default: 30) |
| `days` | `number` | No | Days ahead to look (default: 14, max: 30) |

**Returns:**

```javascript
{
  calendarConnected: true,      // false if user hasn't connected Google Calendar
  email: 'bob@company.com',
  durationMinutes: 30,
  days: 14,
  slots: [
    { start: '2026-04-01T09:00:00Z', end: '2026-04-01T09:30:00Z' },
    { start: '2026-04-01T09:30:00Z', end: '2026-04-01T10:00:00Z' },
    // ...
  ],
  total: 42,
}
```

**Example — full scheduling flow:**

```javascript
// 1. Check interviewer availability from Boooply
const { calendarConnected, slots } = await client.interviews.getAvailability({
  email: 'bob@company.com',
  durationMinutes: 45,
  days: 7,
});

if (calendarConnected && slots.length > 0) {
  // 2a. Use Boooply's calendar data → let candidate pick
  const interview = await client.interviews.create({
    type: 'human',
    jobRole: 'Product Designer',
    durationMinutes: 45,
    schedulingMode: 'CANDIDATE_PICKS',
    participants: [
      { name: 'Jane Doe', email: 'jane@example.com', role: 'CANDIDATE' },
      { name: 'Bob Smith', email: 'bob@company.com', role: 'INTERVIEWER' },
    ],
    availableSlots: slots,
  });
} else {
  // 2b. Fallback: use your own calendar integration to provide slots
  const interview = await client.interviews.create({
    type: 'human',
    jobRole: 'Product Designer',
    durationMinutes: 45,
    schedulingMode: 'CANDIDATE_PICKS',
    participants: [
      { name: 'Jane Doe', email: 'jane@example.com', role: 'CANDIDATE' },
      { name: 'Bob Smith', email: 'bob@company.com', role: 'INTERVIEWER' },
    ],
    availableSlots: myCalendarService.getSlots('bob@company.com', 45),
  });
}
```

> If `calendarConnected` is `false`, the user hasn't connected Google Calendar in Boooply. You can either prompt them to connect it, or fall back to your own calendar integration.

---

#### `interviews.getBusyBlocks(params)` — Get calendar busy blocks

Fetch raw busy time blocks from a team member's Google Calendar. Unlike `getAvailability()` which returns computed available slots, this returns the raw busy periods — useful if you want to compute availability using your own logic (e.g., different working hours, custom slot durations, or merging with other calendars).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | Yes | Team member's email address |
| `days` | `number` | No | Days ahead to look (default: 14, max: 30) |

**Returns:**

```javascript
{
  calendarConnected: true,
  email: 'bob@company.com',
  days: 14,
  timezone: 'Europe/Berlin',
  busyBlocks: [
    { start: '2026-04-01T09:00:00Z', end: '2026-04-01T10:00:00Z' },
    { start: '2026-04-01T13:00:00Z', end: '2026-04-01T14:30:00Z' },
    // ...
  ],
  total: 18,
}
```

**Example:**

```javascript
const { calendarConnected, busyBlocks, timezone } = await client.interviews.getBusyBlocks({
  email: 'bob@company.com',
  days: 7,
});

if (calendarConnected) {
  // Use busy blocks to compute your own availability
  const available = myScheduler.findOpenSlots(busyBlocks, {
    timezone,
    workingHours: { start: 8, end: 18 },
    slotDuration: 60,
  });
}
```

> **When to use `getBusyBlocks` vs `getAvailability`:**
> - Use `getAvailability()` when you want ready-to-use slots (Mon–Fri, 9–5, filtered by duration)
> - Use `getBusyBlocks()` when you need raw data to compute availability with your own rules

---

#### `interviews.list(params?)` — List interviews

```javascript
const { interviews, total, page } = await client.interviews.list({
  status: 'COMPLETED',     // SCHEDULED | ACTIVE | COMPLETED | CANCELLED
  type: 'AI_ONLY',         // AI_ONLY | HUMAN | HYBRID
  search: 'frontend',      // search by role, candidate name, email
  page: 1,
  limit: 20,
});
```

---

#### `interviews.get(meetingCode)` — Get interview details

```javascript
const interview = await client.interviews.get('Boooply-AI-1234567890');

console.log(interview.sessionStatus);   // 'COMPLETED'
console.log(interview.meetingType);     // 'AI_ONLY'
console.log(interview.participants);    // [{ name, email, role, joinToken }]
```

---

#### `interviews.getTranscript(meetingCode)` — Get transcript

Returns the full conversation transcript after the interview is completed.

```javascript
const { transcript } = await client.interviews.getTranscript('Boooply-AI-1234567890');

// transcript = [
//   { speaker: 'AI Interviewer', role: 'AI', content: 'Tell me about...', timestamp: '...' },
//   { speaker: 'Jane Doe', role: 'CANDIDATE', content: 'I worked on...', timestamp: '...' },
// ]
```

---

#### `interviews.getEvaluation(meetingCode)` — Get AI evaluation

Returns AI-generated scores and analysis after the interview is completed.

```javascript
const evaluation = await client.interviews.getEvaluation('Boooply-AI-1234567890');

// evaluation = {
//   recommendation: 'PASS',       // PASS | FAIL | REVIEW
//   overallScore: 82,             // 0-100
//   communication: 85,
//   technical: 78,
//   cultureFit: 90,
//   questionEvaluations: [...]
// }
```

---

#### `interviews.triggerAnalysis(meetingCode)` — Re-run AI analysis

Triggers (or re-triggers) AI analysis on a completed interview.

```javascript
await client.interviews.triggerAnalysis('Boooply-AI-1234567890');
```

---

#### `interviews.addParticipant(meetingCode, data)` — Add participant

```javascript
const result = await client.interviews.addParticipant('Boooply-AI-1234567890', {
  participants: [
    { name: 'Late Joiner', email: 'late@company.com', role: 'INTERVIEWER' }
  ]
});
```

---

#### `interviews.getParticipants(meetingCode)` — Get participants

```javascript
const { participants, total } = await client.interviews.getParticipants('Boooply-AI-1234567890');
// participants = [{ id, name, email, role, joinToken, joinedAt, leftAt, isActive }]
```

---

#### `interviews.removeParticipant(meetingCode, participantId)` — Remove participant

```javascript
await client.interviews.removeParticipant('Boooply-AI-1234567890', 'participant-uuid');
```

---

#### `interviews.getRecording(meetingCode)` — Get recording

Returns the video recording for a completed interview, with both a pre-signed URL (7-day expiry) and a stable API URL.

```javascript
const { recording } = await client.interviews.getRecording('Boooply-AI-1234567890');

if (recording) {
  console.log(recording.duration);    // seconds
  console.log(recording.format);      // 'mp4'
  console.log(recording.videoUrl);    // pre-signed S3 URL (expires in 7 days)
  console.log(recording.videoApiUrl); // stable URL (generates fresh link on each request)
}
```

> **Tip:** Store `videoApiUrl` — it always works. The `videoUrl` expires after 7 days.

---

#### `interviews.reschedule(meetingCode, data)` — Reschedule

```javascript
await client.interviews.reschedule('Boooply-AI-1234567890', {
  scheduledAt: '2026-04-05T14:00:00Z',
  durationMinutes: 30,
  reason: 'Candidate requested new time',
});
```

---

#### `interviews.cancel(meetingCode, reason?)` — Cancel

```javascript
await client.interviews.cancel('Boooply-AI-1234567890', 'Position filled');
```

---

#### `interviews.delete(meetingCode)` — Delete permanently

```javascript
await client.interviews.delete('Boooply-AI-1234567890');
// ⚠️ This is irreversible
```

---

### `client.ai`

#### `ai.generateJobDescription(data)` — Generate job description with AI

```javascript
const { jobDescription } = await client.ai.generateJobDescription({
  jobRole: 'Senior Frontend Engineer',
  department: 'Engineering',
  skills: ['React', 'TypeScript', 'GraphQL'],
  seniority: 'SENIOR',
  workSetup: 'REMOTE',
  employmentType: 'FULL_TIME',
});
```

---

### `client.organization`

#### `organization.get()` — Get organization details

```javascript
const org = await client.organization.get();
console.log(org.name, org.slug);
```

---

## Participant Mappers

Helper functions to convert users from external platforms into Boooply's participant format.

```javascript
const {
  mapGoogleParticipant,
  mapMicrosoftParticipant,
  mapGenericParticipant,
} = require('@boooply/ai-interviews-sdk');
```

### Google

```javascript
const participant = mapGoogleParticipant({
  name: 'Jane Smith',
  email: 'jane@gmail.com',
  id: 'google-user-id-123',
  picture: 'https://...',
  role: 'INTERVIEWER',       // optional, defaults to INTERVIEWER
});
```

### Microsoft

```javascript
const participant = mapMicrosoftParticipant({
  displayName: 'Bob Johnson',
  mail: 'bob@company.com',
  id: 'ms-user-id-456',
  role: 'HOST',              // optional, defaults to INTERVIEWER
});
```

### Generic

```javascript
const participant = mapGenericParticipant({
  name: 'John Doe',
  email: 'john@example.com',
  externalUserId: '12345',
  authProvider: 'YOUR_PLATFORM',
  role: 'CANDIDATE',
});
```

---

## Platform Providers

For multi-tenant platforms that integrate Boooply for multiple organizations.

### `BoooplyClient.createOrganizationApiKey(config, data)` — Static

Creates an organization-specific API key. Call this from your backend when an organization connects to Boooply.

```javascript
const result = await BoooplyClient.createOrganizationApiKey(
  {
    baseUrl: 'https://api.meetings.boooply.com',
    platformKey: process.env.BOOOPLY_PLATFORM_KEY,  // your platform master key
  },
  {
    userId: '12345',
    userEmail: 'admin@acme.com',
    userName: 'Jane Admin',
    organizationId: 'org_7234567890',      // your platform's org ID
    organizationName: 'Acme Corporation',
    teamMembers: [                         // optional — import team
      { email: 'bob@acme.com', name: 'Bob', role: 'ADMIN' },
    ],
  }
);

// Store result.apiKey for this organization
console.log(result.apiKey);  // 'bply_tenant_xxxxx'
```

> **Security:** Only call this from your server. The platform key grants elevated privileges.

---

## Webhooks

Boooply can send real-time webhook events to your server when interviews reach key milestones — transcript ready, evaluation complete, scores available, or recording ready.

Webhooks are configured in your [Boooply dashboard](https://boooply.com) under **Integrations**, not through the SDK. See the [Webhooks documentation](https://docs.boooply.com/webhooks) for event payloads, signature verification, and setup instructions.

---

## Error Handling

```javascript
try {
  const interview = await client.interviews.create({ ... });
} catch (error) {
  console.error(error.message);    // 'Boooply API 400: {...}'
  console.error(error.status);     // 400
  console.error(error.response);   // full axios response
}
```

Common errors:

| Status | Meaning |
|--------|---------|
| `400` | Invalid parameters (check required fields) |
| `401` | Invalid or expired API key |
| `403` | Insufficient permissions |
| `404` | Interview not found |
| `429` | Rate limit exceeded |

---

## TypeScript Support

The SDK ships with JSDoc type definitions that provide IntelliSense in TypeScript and modern editors:

```typescript
import {
  BoooplyClient,
  mapGoogleParticipant,
} from '@boooply/ai-interviews-sdk';

const client = new BoooplyClient({
  apiKey: process.env.BOOOPLY_API_KEY!,
  baseUrl: 'https://api.meetings.boooply.com',
});
```

---

## Migration from v1

v2 introduces a namespaced API. All v1 methods still work but are deprecated.

| v1 (deprecated) | v2 |
|------------------|----|
| `client.createAIInterview(data)` | `client.interviews.create({ type: 'ai', ... })` |
| `client.createHumanInterview(data)` | `client.interviews.create({ type: 'human', ... })` |
| `client.createTeamMeeting(data)` | `client.interviews.create({ type: 'team', ... })` |
| `client.listInterviews()` | `client.interviews.list()` |
| `client.getInterview(code)` | `client.interviews.get(code)` |
| `client.cancelInterview(code)` | `client.interviews.cancel(code)` |
| `client.rescheduleInterview(code, data)` | `client.interviews.reschedule(code, data)` |
| `client.deleteInterview(code)` | `client.interviews.delete(code)` |
| `client.addParticipant(code, data)` | `client.interviews.addParticipant(code, data)` |
| `client.getTranscript(code)` | `client.interviews.getTranscript(code)` |
| `client.getEvaluation(code)` | `client.interviews.getEvaluation(code)` |
| `client.triggerAnalysis(code)` | `client.interviews.triggerAnalysis(code)` |
| `client.generateJobDescription(data)` | `client.ai.generateJobDescription(data)` |
| `client.getOrganization()` | `client.organization.get()` |

---

## License

MIT
