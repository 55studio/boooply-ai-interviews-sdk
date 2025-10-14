/**
 * @typedef {'TALENTFLOW' | 'GOOGLE' | 'MICROSOFT' | 'GITHUB' | 'NATIVE'} AuthProvider
 */

/**
 * @typedef {'HOST' | 'CO_HOST' | 'INTERVIEWER' | 'CANDIDATE' | 'OBSERVER'} ParticipantRole
 */

/**
 * @typedef {'HUMAN' | 'AI_ONLY' | 'HYBRID'} MeetingType
 */

/**
 * @typedef {'AI_INTERVIEW' | 'LIVE_TRANSCRIPTION' | 'TRANSCRIPTION_SUMMARY' | 'VIDEO_RECORDING' | 'SCREENSHOT_CAPTURE' | 'RATE_CANDIDATES' | 'RATE_INTERVIEWERS' | 'AI_NOTES' | 'ANALYTICS' | 'CUSTOM_BRANDING'} FeatureType
 */

/**
 * @typedef {Object} ParticipantData
 * @property {string} name - Participant's full name
 * @property {string} email - Participant's email address
 * @property {ParticipantRole} role - Participant's meeting role
 * @property {string} externalUserId - External system user ID (e.g., TalentFlow snowflake ID)
 * @property {AuthProvider} authProvider - Authentication provider
 * @property {string} [externalRole] - Original role from external system (e.g., 'JOBSEEKER', 'COMPANY_OWNER')
 * @property {string} [avatarUrl] - Optional avatar image URL
 */

/**
 * @typedef {Object} CreateMeetingRequest
 * @property {string} title - Meeting title
 * @property {string} [description] - Optional meeting description
 * @property {string} scheduledAt - ISO 8601 datetime string
 * @property {string} hostEmail - Email of the meeting host
 * @property {string} organizationId - External organization ID (e.g., TalentFlow recruiterCompanyId)
 * @property {ParticipantData[]} participants - Array of meeting participants
 * @property {string} [jobTitle] - Job title for context (used in transcription)
 * @property {string[]} [skills] - Array of skills for context
 * @property {MeetingType} [meetingType] - Type of meeting (defaults to 'HUMAN')
 */

/**
 * @typedef {Object} CreateAIInterviewRequest
 * @property {string} candidateEmail - Candidate's email address
 * @property {string} candidateName - Candidate's full name
 * @property {string} [candidateCV] - Candidate's resume/CV text
 * @property {string} jobRole - Job position title
 * @property {string} companyName - Company/organization name
 * @property {Object} [jobData] - Full job posting details
 * @property {string} scheduledAt - ISO 8601 datetime string when AI should join
 * @property {Object} interviewContext - Interview configuration and questions
 * @property {string} organizationId - External organization ID
 */

/**
 * @typedef {Object} Meeting
 * @property {string} id - Meeting UUID
 * @property {string} meetingCode - Unique meeting code for joining
 * @property {string} [title] - Meeting title
 * @property {string} [scheduledAt] - ISO 8601 datetime string
 * @property {MeetingType} meetingType - Type of meeting
 * @property {boolean} isActive - Whether meeting is currently active
 * @property {Participant[]} participants - Array of participants with join tokens
 */

/**
 * @typedef {Object} Participant
 * @property {string} id - Participant UUID
 * @property {string} name - Participant's name
 * @property {string} email - Participant's email
 * @property {ParticipantRole} role - Participant's role
 * @property {string} joinToken - Unique token for joining the meeting
 * @property {boolean} isActive - Whether participant is active
 */

/**
 * @typedef {Object} OrganizationFeature
 * @property {string} id - Feature UUID
 * @property {FeatureType} featureType - Type of feature
 * @property {boolean} isEnabled - Whether feature is enabled
 * @property {Object} [settings] - Feature-specific settings
 * @property {number} [limit] - Usage limit (e.g., max AI interviews per month)
 * @property {number} usageCount - Current usage count
 * @property {string} [expiresAt] - ISO 8601 datetime when feature expires
 */

module.exports = {};
