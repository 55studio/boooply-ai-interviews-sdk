const axios = require('axios');
const { version } = require('./package.json');

/**
 * Boooply AI Interviews SDK Client v2
 *
 * All endpoints go through /api/integration/ (API key auth).
 *
 * @example
 * const { BoooplyClient } = require('@boooply/ai-interviews-sdk');
 *
 * const client = new BoooplyClient({
 *   apiKey: 'bply_...',
 *   baseUrl: 'https://api.meetings.boooply.com',
 * });
 *
 * // Create an AI interview
 * const interview = await client.interviews.create({
 *   type: 'ai',
 *   jobRole: 'Senior Frontend Engineer',
 *   candidate: { name: 'John Doe', email: 'john@example.com' },
 * });
 */
class BoooplyClient {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - Organization API key (bply_... format)
   * @param {string} config.baseUrl - Boooply API base URL
   * @param {number} [config.timeout] - Request timeout in ms (default: 30000)
   */
  constructor(config) {
    if (!config.apiKey) throw new Error('Boooply SDK: apiKey is required');
    if (!config.baseUrl) throw new Error('Boooply SDK: baseUrl is required');

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.version = version;

    this._http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-SDK-Version': version,
      },
      timeout: config.timeout || 30000,
    });

    this._http.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response) {
          const err = new Error(`Boooply API ${error.response.status}: ${JSON.stringify(error.response.data)}`);
          err.status = error.response.status;
          err.response = error.response;
          throw err;
        }
        throw error;
      }
    );

    // Namespaced sub-objects for cleaner API
    this.interviews = new InterviewsAPI(this._http);
    this.ai = new AIAPI(this._http);
    this.organization = new OrganizationAPI(this._http);

  }

  // ─── Static: Platform Onboarding ───────────────────────────────

  /**
   * Create organization-specific API key (server-to-server)
   * @param {Object} config - { baseUrl, platformKey }
   * @param {Object} data - { userId, userEmail, userName?, organizationId, organizationName?, teamMembers? }
   */
  static async createOrganizationApiKey(config, data) {
    if (!config.baseUrl) throw new Error('Boooply SDK: baseUrl is required');
    if (!config.platformKey) throw new Error('Boooply SDK: platformKey is required');
    if (!data.userId || !data.userEmail || !data.organizationId) {
      throw new Error('Boooply SDK: userId, userEmail, and organizationId are required');
    }

    const baseUrl = config.baseUrl.replace(/\/$/, '');
    const response = await axios.post(
      `${baseUrl}/api/server-auth/create-api-key`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.platformKey}`,
          'X-SDK-Version': version,
        },
        timeout: 30000,
      }
    );
    return response.data;
  }
}

// ─── Interviews API ──────────────────────────────────────────────────────────

const MEETING_TYPE_MAP = {
  ai: 'AI_ONLY',
  human: 'HUMAN',
  team: 'HUMAN',
  AI_ONLY: 'AI_ONLY',
  HUMAN: 'HUMAN',
};

class InterviewsAPI {
  constructor(http) { this._http = http; }

  /**
   * Create an interview (AI, human, or team meeting)
   *
   * @param {Object} data
   * @param {string} data.type - 'ai' | 'human' | 'team' (or 'AI_ONLY' | 'HUMAN')
   * @param {string} data.jobRole - Job role/title
   * @param {Object} [data.candidate] - { name, email } — required for ai/human, ignored for team
   * @param {Array} [data.participants] - Array of { name, email, role } — required for human/team
   * @param {string} [data.scheduledAt] - ISO 8601 datetime (required for FIXED mode)
   * @param {string} [data.schedulingMode] - IMMEDIATE | FIXED | CANDIDATE_PICKS
   * @param {Array<{start: string, end: string}>} [data.availableSlots] - Time slots for CANDIDATE_PICKS mode (max 50, ISO 8601)
   * @param {number} [data.durationMinutes] - Duration (default: 30)
   * @param {string[]} [data.skills] - Skills to evaluate
   * @param {string} [data.seniority] - JUNIOR | MID | SENIOR | LEAD | PRINCIPAL
   * @param {string} [data.department] - Department name
   * @param {string} [data.jobDescription] - Job description text
   * @param {string} [data.workSetup] - REMOTE | ONSITE | HYBRID
   * @param {string} [data.employmentType] - FULL_TIME | PART_TIME | CONTRACT
   * @param {string} [data.candidateCV] - CV/resume text
   * @param {string[]} [data.questions] - Custom interview questions
   * @param {boolean} [data.aiGenerate] - Auto-generate questions with AI
   * @param {string} [data.companyName] - Company name (defaults to organization name). Useful for agencies posting for multiple clients
   * @param {string} [data.evaluationFocus] - 'knowledge' | 'balanced' | 'communication' | 'problem_solving' | 'culture'
   * @param {string} [data.externalJobId] - External job/position ID from your ATS
   * @param {string[]} [data.agenda] - Agenda items (team meetings only)
   * @param {boolean} [data.transcriptionEnabled] - Enable recording & transcription (team meetings, default: false)
   * @returns {Promise<Object>}
   *
   * @example
   * // AI interview
   * await client.interviews.create({
   *   type: 'ai',
   *   jobRole: 'Frontend Engineer',
   *   candidate: { name: 'Jane', email: 'jane@example.com' },
   *   skills: ['React', 'TypeScript'],
   *   durationMinutes: 20,
   * });
   *
   * // Human interview
   * await client.interviews.create({
   *   type: 'human',
   *   jobRole: 'Backend Engineer',
   *   participants: [
   *     { name: 'Jane', email: 'jane@example.com', role: 'CANDIDATE' },
   *     { name: 'Bob', email: 'bob@company.com', role: 'INTERVIEWER' },
   *   ],
   * });
   *
   * // Team meeting with recording & transcription
   * await client.interviews.create({
   *   type: 'team',
   *   participants: [
   *     { name: 'Alice', email: 'alice@co.com', role: 'HOST' },
   *     { name: 'Bob', email: 'bob@co.com', role: 'PARTICIPANT' },
   *   ],
   *   agenda: ['Q1 review', 'Roadmap planning'],
   *   transcriptionEnabled: true, // enables video recording + post-meeting transcript & AI recap
   *   durationMinutes: 60,
   * });
   */
  async create(data) {
    const rawType = data.type || data.meetingType;
    const isTeamMeeting = rawType === 'team' || data.isTeamMeeting === true;
    const meetingType = MEETING_TYPE_MAP[rawType] || 'AI_ONLY';

    // Validate: AI interviews cannot be team meetings
    if (isTeamMeeting && meetingType === 'AI_ONLY') {
      throw new Error('Boooply SDK: type "ai" cannot be combined with team meeting');
    }

    // Build participants array
    let participants = data.participants;
    if (!participants && data.candidate) {
      participants = [{ name: data.candidate.name, email: data.candidate.email, role: 'CANDIDATE' }];
    }

    const { type, candidate, isTeamMeeting: _itm, ...rest } = data;

    const response = await this._http.post('/api/integration/interviews', {
      meetingType,
      isTeamMeeting,
      participants,
      durationMinutes: data.durationMinutes || 30,
      ...rest,
    });
    return response.data;
  }

  /**
   * List interviews
   * @param {Object} [params] - { status, type, search, page, limit }
   */
  async list(params = {}) {
    const response = await this._http.get('/api/integration/interviews', { params });
    return response.data;
  }

  /**
   * Get interview details
   * @param {string} meetingCode
   */
  async get(meetingCode) {
    const response = await this._http.get(`/api/integration/interviews/${meetingCode}`);
    return response.data;
  }

  /**
   * Add participants to an existing interview
   * @param {string} meetingCode
   * @param {Object} data - { participants: [{ name, email, role }] }
   */
  async addParticipant(meetingCode, data) {
    const response = await this._http.post(`/api/integration/interviews/${meetingCode}/participants`, data);
    return response.data;
  }

  /**
   * Cancel an interview
   * @param {string} meetingCode
   * @param {string} [reason]
   */
  async cancel(meetingCode, reason) {
    const response = await this._http.patch(`/api/integration/interviews/${meetingCode}/cancel`, { reason });
    return response.data;
  }

  /**
   * Reschedule an interview
   * @param {string} meetingCode
   * @param {Object} data - { scheduledAt, durationMinutes?, reason? }
   */
  async reschedule(meetingCode, data) {
    const response = await this._http.patch(`/api/integration/interviews/${meetingCode}/reschedule`, {
      scheduledAt: data.scheduledAt instanceof Date ? data.scheduledAt.toISOString() : data.scheduledAt,
      durationMinutes: data.durationMinutes,
      reason: data.reason,
    });
    return response.data;
  }

  /**
   * Delete an interview permanently
   * @param {string} meetingCode
   */
  async delete(meetingCode) {
    const response = await this._http.delete(`/api/integration/interviews/${meetingCode}`);
    return response.data;
  }

  /**
   * Get transcript
   * @param {string} meetingCode
   */
  async getTranscript(meetingCode) {
    const response = await this._http.get(`/api/integration/interviews/${meetingCode}/transcript`);
    return response.data;
  }

  /**
   * Get evaluation/scores
   * @param {string} meetingCode
   */
  async getEvaluation(meetingCode) {
    const response = await this._http.get(`/api/integration/interviews/${meetingCode}/evaluation`);
    return response.data;
  }

  /**
   * Trigger AI analysis on a completed interview
   * @param {string} meetingCode
   */
  async triggerAnalysis(meetingCode) {
    const response = await this._http.post(`/api/integration/interviews/${meetingCode}/analyze`);
    return response.data;
  }

  /**
   * Get available time slots from a team member's Google Calendar connected in Boooply.
   * Use this to pull interviewer availability without needing your own calendar integration.
   *
   * @param {Object} params
   * @param {string} params.email - Team member's email address
   * @param {number} [params.durationMinutes] - Slot duration in minutes (default: 30)
   * @param {number} [params.days] - How many days ahead to look (default: 14, max: 30)
   * @returns {Promise<Object>} { calendarConnected, slots: [{ start, end }], total }
   *
   * @example
   * const { calendarConnected, slots } = await client.interviews.getAvailability({
   *   email: 'interviewer@company.com',
   *   durationMinutes: 45,
   *   days: 7,
   * });
   *
   * if (calendarConnected && slots.length > 0) {
   *   // Use Boooply's calendar data
   *   await client.interviews.create({
   *     type: 'human',
   *     schedulingMode: 'CANDIDATE_PICKS',
   *     availableSlots: slots,
   *     durationMinutes: 45,
   *     ...
   *   });
   * } else {
   *   // Fallback: use your own calendar integration to provide slots
   * }
   */
  async getAvailability(params) {
    if (!params.email) throw new Error('Boooply SDK: email is required for getAvailability');
    const response = await this._http.get('/api/integration/availability', {
      params: {
        email: params.email,
        duration: params.durationMinutes,
        days: params.days,
      },
    });
    return response.data;
  }

  /**
   * Get busy blocks from a team member's Google Calendar connected in Boooply.
   * Returns raw busy time ranges — useful if you want to compute availability yourself.
   *
   * @param {Object} params
   * @param {string} params.email - Team member's email address
   * @param {number} [params.days] - How many days ahead to look (default: 14, max: 30)
   * @returns {Promise<Object>} { calendarConnected, busyBlocks: [{ start, end }], timezone, total }
   *
   * @example
   * const { calendarConnected, busyBlocks, timezone } = await client.interviews.getBusyBlocks({
   *   email: 'interviewer@company.com',
   *   days: 7,
   * });
   *
   * if (calendarConnected) {
   *   // Compute your own available slots using the busy blocks
   *   const mySlots = computeAvailability(busyBlocks, timezone);
   * }
   */
  async getBusyBlocks(params) {
    if (!params.email) throw new Error('Boooply SDK: email is required for getBusyBlocks');
    const response = await this._http.get('/api/integration/busy-blocks', {
      params: {
        email: params.email,
        days: params.days,
      },
    });
    return response.data;
  }
}

// ─── AI API ──────────────────────────────────────────────────────────────────

class AIAPI {
  constructor(http) { this._http = http; }

  /**
   * Generate a job description using AI
   * @param {Object} data - { jobRole, department?, skills?, seniority?, workSetup?, employmentType? }
   */
  async generateJobDescription(data) {
    const response = await this._http.post('/api/integration/generate-job-description', data);
    return response.data;
  }
}

// ─── Organization API ────────────────────────────────────────────────────────

class OrganizationAPI {
  constructor(http) { this._http = http; }

  /** Get organization details */
  async get() {
    const response = await this._http.get('/api/integration/organization');
    return response.data;
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

const {
  mapGoogleParticipant,
  mapMicrosoftParticipant,
  mapGenericParticipant,
} = require('./mappers');

module.exports = {
  BoooplyClient,
  mapGoogleParticipant,
  mapMicrosoftParticipant,
  mapGenericParticipant,
};
