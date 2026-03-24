/**
 * Boooply AI Interviews SDK v2 — Type definitions (JSDoc)
 */

/**
 * @typedef {'TALENTFLOW' | 'GOOGLE' | 'MICROSOFT' | 'GITHUB' | 'NATIVE'} AuthProvider
 */

/**
 * @typedef {'HOST' | 'CO_HOST' | 'INTERVIEWER' | 'CANDIDATE' | 'PARTICIPANT'} ParticipantRole
 */

/**
 * @typedef {'HUMAN' | 'AI_ONLY'} MeetingType
 */

/**
 * @typedef {'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'} SessionStatus
 */

/**
 * @typedef {'IMMEDIATE' | 'FIXED' | 'CANDIDATE_PICKS'} SchedulingMode
 */

/**
 * @typedef {Object} ParticipantData
 * @property {string} name - Participant's full name
 * @property {string} email - Participant's email address
 * @property {ParticipantRole} role - Participant's meeting role
 * @property {string} [externalUserId] - External system user ID
 * @property {AuthProvider} [authProvider] - Authentication provider
 * @property {string} [externalRole] - Original role from external system
 * @property {string} [avatarUrl] - Optional avatar image URL
 */

/**
 * @typedef {Object} CreateAIInterviewRequest
 * @property {string} candidateEmail - Candidate's email address
 * @property {string} candidateName - Candidate's full name
 * @property {string} jobRole - Job role/title
 * @property {string} [scheduledAt] - ISO 8601 datetime
 * @property {SchedulingMode} [schedulingMode] - Scheduling mode
 * @property {number} [durationMinutes] - Duration in minutes (default: 30)
 * @property {string[]} [skills] - Skills to evaluate
 * @property {string} [seniority] - JUNIOR, MID, SENIOR, LEAD, PRINCIPAL
 * @property {string} [jobDescription] - Job description text
 * @property {string} [candidateCV] - CV/resume text
 * @property {string[]} [questions] - Custom questions
 * @property {boolean} [aiGenerate] - Auto-generate questions
 * @property {string} [department] - Department
 * @property {string} [workSetup] - REMOTE, ONSITE, HYBRID
 * @property {string} [employmentType] - FULL_TIME, PART_TIME, CONTRACT
 * @property {string} [evaluationFocus] - Evaluation focus: knowledge, balanced, communication, problem_solving, culture
 * @property {string} [externalJobId] - External job/position ID from your ATS (links to Boooply Position)
 */

/**
 * @typedef {Object} CreateHumanInterviewRequest
 * @property {string} jobRole - Job role/title
 * @property {ParticipantData[]} participants - Array of participants (must include CANDIDATE and HOST)
 * @property {string} scheduledAt - ISO 8601 datetime
 * @property {number} [durationMinutes] - Duration in minutes
 * @property {string[]} [skills] - Skills to evaluate
 * @property {string} [seniority] - Seniority level
 * @property {string[]} [questions] - Custom questions
 */

/**
 * @typedef {Object} CreateTeamMeetingRequest
 * @property {ParticipantData[]} participants - Array of participants (must include HOST)
 * @property {string} scheduledAt - ISO 8601 datetime
 * @property {number} [durationMinutes] - Duration in minutes
 * @property {string[]} [agenda] - Meeting agenda items
 * @property {boolean} [transcriptionEnabled] - Enable video recording & post-meeting transcription + AI recap (default: false)
 */

/**
 * @typedef {Object} Meeting
 * @property {string} id - Meeting UUID
 * @property {string} meetingCode - Unique meeting code
 * @property {string} code - Alias for meetingCode
 * @property {string} [title] - Meeting title
 * @property {string} [description] - Meeting description
 * @property {MeetingType} meetingType - Type of meeting
 * @property {boolean} isTeamMeeting - Whether this is a team meeting
 * @property {SessionStatus} sessionStatus - Current status
 * @property {string} [url] - Join URL
 * @property {string} [scheduledAt] - ISO 8601 datetime
 * @property {number} [durationMinutes] - Duration in minutes
 * @property {Participant[]} participants - Array of participants
 */

/**
 * @typedef {Object} Participant
 * @property {string} id - Participant UUID
 * @property {string} name - Participant's name
 * @property {string} email - Participant's email
 * @property {ParticipantRole} role - Participant's role
 * @property {string} joinToken - Unique token for joining
 */

/**
 * @typedef {Object} ListInterviewsParams
 * @property {SessionStatus} [status] - Filter by status
 * @property {MeetingType} [type] - Filter by type
 * @property {string} [search] - Search term
 * @property {number} [page] - Page number
 * @property {number} [limit] - Results per page
 */

/**
 * @typedef {Object} RescheduleRequest
 * @property {string|Date} scheduledAt - New datetime
 * @property {number} [durationMinutes] - New duration
 * @property {string} [reason] - Reason for rescheduling
 */

/**
 * @typedef {Object} Evaluation
 * @property {string} recommendation - PASS, FAIL, or REVIEW
 * @property {number} overallScore - 0-100
 * @property {number} communication - 0-100
 * @property {number} technical - 0-100
 * @property {number} cultureFit - 0-100
 * @property {Object[]} [questionEvaluations] - Per-question scores
 */

/**
 * @typedef {Object} TranscriptEntry
 * @property {string} id - Entry ID
 * @property {string} speaker - Speaker name
 * @property {string} role - AI or CANDIDATE
 * @property {string} content - Message text
 * @property {string} timestamp - ISO datetime
 */

/**
 * @typedef {Object} TeamMember
 * @property {string} email - Member email
 * @property {string} [name] - Member name
 * @property {'OWNER' | 'ADMIN' | 'MEMBER'} [role] - Org role
 */

module.exports = {};
