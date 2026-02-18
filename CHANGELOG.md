# Changelog

All notable changes to this project will be documented in this file.

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
