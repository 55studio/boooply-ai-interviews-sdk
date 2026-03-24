# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2026-03-24

### Added
- `interviews.getAvailability({ email, durationMinutes, days })` — Fetch available time slots from a team member's Google Calendar connected in Boooply
- `interviews.getBusyBlocks({ email, days })` — Fetch raw busy blocks from Google Calendar for custom availability logic
- `companyName` parameter for `interviews.create()` — Set company name (useful for agencies posting for multiple clients)
- `availableSlots` parameter for `interviews.create()` — Provide time slots for `CANDIDATE_PICKS` scheduling mode
- Scheduling Modes documentation — `IMMEDIATE`, `FIXED`, `CANDIDATE_PICKS` with full booking flow
- Webhooks section — links to webhook documentation for event notifications
- Email notification documentation — Boooply sends invitation emails from `noreply@boooply.com`

### Changed
- `CANDIDATE_PICKS` scheduling mode is now restricted to AI and Human interviews only (not team meetings)
- Duration and slot relationship documented — `availableSlots` duration should match `durationMinutes`

## [2.0.0] - 2026-03-18

### Breaking Changes
- All endpoints now go through `/api/integration/` with Organization API key auth (`bply_...` format)
- Constructor no longer accepts `organizationId` — API key is org-scoped
- Removed `createMeeting()`, `getMeeting()`, `updateMeeting()`, `endMeeting()`, `getOrganizationFeatures()`, `hasFeature()`

### Added — Namespaced API
- `client.interviews.create({ type: 'ai' | 'human' | 'team', ... })` — Unified interview creation
- `client.interviews.list(params?)` — List with filtering/pagination
- `client.interviews.get(code)` — Get interview details
- `client.interviews.getTranscript(code)` — Get transcript
- `client.interviews.getEvaluation(code)` — Get AI evaluation scores
- `client.interviews.triggerAnalysis(code)` — Re-run AI analysis
- `client.interviews.addParticipant(code, data)` — Add participants
- `client.interviews.reschedule(code, data)` — Reschedule
- `client.interviews.cancel(code, reason?)` — Cancel
- `client.interviews.delete(code)` — Delete permanently
- `client.ai.generateJobDescription(data)` — Generate job description with AI
- `client.organization.get()` — Get organization details
- `externalJobId` parameter for linking interviews to ATS positions
- `createOrganizationApiKey()` now accepts optional `teamMembers` array

### Deprecated
- All flat methods (`createAIInterview`, `listInterviews`, `getInterview`, etc.) still work but delegate to the namespaced API. See Migration table in README.

## [1.5.0] - 2026-01-05

### Added
- New `cancelMeeting(meetingCode, reason)` method to cancel meetings
  - Calls `PATCH /api/integration/meetings/:meetingCode/cancel`
  - Only meeting creator or organization owner can cancel
  - Optional reason parameter for tracking cancellation reasons
- New `rescheduleMeeting(meetingCode, data)` method to reschedule meetings
  - Calls `PATCH /api/integration/meetings/:meetingCode/reschedule`
  - Accepts `newScheduledAt`, optional `newDurationMinutes`, and optional `reason`
  - Only meeting creator or organization owner can reschedule
- New `deleteMeeting(meetingCode)` method to permanently delete meetings
  - Calls `DELETE /api/integration/meetings/:meetingCode`
  - Only meeting creator or organization owner can delete
  - WARNING: This action is irreversible
- Added TypeScript types for new responses: `CancelMeetingResponse`, `RescheduleMeetingRequest`, `RescheduleMeetingResponse`, `DeleteMeetingResponse`

## [1.2.0] - 2026-01-05

### Added
- New `createTeamMeeting()` method for internal team meetings without candidates
  - Calls `/api/integration/team-meeting/create` endpoint
  - Supports team syncs, 1:1s, and other internal meetings
  - No candidate data required

## [1.0.5] - 2025-01-14

### Fixed
- Fixed API endpoints to use correct `/api/integration/` prefix
  - `createMeeting()` now calls `/api/integration/meeting/create`
  - `createAIInterview()` now calls `/api/integration/ai-interview/create`

### Added
- Added support for optional `organizationId` parameter in constructor
- Multi-tenant platform support via `X-Organization-Id` header
- Request interceptor automatically injects organization ID when provided
- README documentation for multi-tenant vs single-tenant usage

### Changed
- Updated authentication to support both platform-level and organization-level API keys

## [1.0.4] - 2025-01-14

### Added
- Platform-level API key support
- Organization ID tracking in requests

## [1.0.3] - 2025-01-13

### Initial Release
- Basic SDK functionality
- Meeting creation and management
- AI interview creation
- Participant mappers for different platforms
- TypeScript definitions via JSDoc
