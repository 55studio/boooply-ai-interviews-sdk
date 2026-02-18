const axios = require('axios');
const { version } = require('./package.json');

/**
 * Boooply Meetings SDK Client
 * Provides a simple, type-safe interface for integrating with Boooply Meetings API
 */
class BoooplyClient {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - Platform or organization API key for authentication
   * @param {string} config.baseUrl - Boooply API base URL (e.g., 'https://api.meetings.boooply.com')
   * @param {string} [config.organizationId] - Organization ID for platform-level keys (optional for org-level keys)
   */
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('Boooply SDK: apiKey is required');
    }
    if (!config.baseUrl) {
      throw new Error('Boooply SDK: baseUrl is required');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.organizationId = config.organizationId; // Optional - for platform keys
    this.version = version;

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-SDK-Version': version,
      },
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor to inject X-Organization-Id header
    this.client.interceptors.request.use((config) => {
      if (this.organizationId) {
        config.headers['X-Organization-Id'] = this.organizationId;
      }

      // Debug logging for authentication
      console.log('🔍 [Boooply SDK] Making request to:', config.url);
      console.log('🔍 [Boooply SDK] Headers:', JSON.stringify({
        Authorization: config.headers['Authorization'] ? config.headers['Authorization'].substring(0, 30) + '...' : 'MISSING',
        'X-Organization-Id': config.headers['X-Organization-Id'] || 'MISSING',
        'Content-Type': config.headers['Content-Type']
      }, null, 2));

      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Preserve the original error response structure without circular refs
          const err = new Error(`HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`);
          err.status = error.response.status;
          err.response = {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          };
          throw err;
        }
        throw error;
      }
    );
  }

  /**
   * Create a new meeting
   * @param {import('./types').CreateMeetingRequest} data
   * @returns {Promise<import('./types').Meeting>}
   */
  async createMeeting(data) {
    const response = await this.client.post('/api/integration/meeting/create', data);
    return response.data;
  }

  /**
   * Create a new AI interview meeting
   * @param {import('./types').CreateAIInterviewRequest} data
   * @returns {Promise<import('./types').Meeting>}
   */
  async createAIInterview(data) {
    const response = await this.client.post('/api/integration/ai-interview/create', data);
    return response.data;
  }

  /**
   * Create a team meeting (internal meetings without candidates)
   * @param {import('./types').CreateTeamMeetingRequest} data
   * @returns {Promise<import('./types').Meeting>}
   */
  async createTeamMeeting(data) {
    const response = await this.client.post('/api/integration/team-meeting/create', data);
    return response.data;
  }

  /**
   * Get meeting details by meeting code
   * @param {string} meetingCode - Unique meeting code
   * @returns {Promise<import('./types').Meeting>}
   */
  async getMeeting(meetingCode) {
    const response = await this.client.get(`/api/meetings/${meetingCode}`);
    return response.data;
  }

  /**
   * Add a participant to an existing meeting
   * @param {string} meetingCode - Meeting code
   * @param {import('./types').ParticipantData} participant - Participant data
   * @returns {Promise<import('./types').Participant>}
   */
  async addParticipant(meetingCode, participant) {
    const response = await this.client.post(`/api/meetings/${meetingCode}/participants`, participant);
    return response.data;
  }

  /**
   * Get organization features
   * @returns {Promise<import('./types').OrganizationFeature[]>}
   */
  async getOrganizationFeatures() {
    const response = await this.client.get('/api/organization/features');
    return response.data;
  }

  /**
   * Check if organization has a specific feature enabled
   * @param {import('./types').FeatureType} featureType - Feature to check
   * @returns {Promise<boolean>}
   */
  async hasFeature(featureType) {
    try {
      const features = await this.getOrganizationFeatures();
      const feature = features.find(f => f.featureType === featureType);
      return feature ? feature.isEnabled : false;
    } catch (error) {
      console.error('Boooply SDK: Failed to check feature', error);
      return false;
    }
  }

  /**
   * Update meeting details
   * @param {string} meetingCode - Meeting code
   * @param {Object} updates - Fields to update
   * @returns {Promise<import('./types').Meeting>}
   */
  async updateMeeting(meetingCode, updates) {
    const response = await this.client.patch(`/api/meetings/${meetingCode}`, updates);
    return response.data;
  }

  /**
   * End/cancel a meeting
   * @param {string} meetingCode - Meeting code
   * @returns {Promise<void>}
   */
  async endMeeting(meetingCode) {
    await this.client.post(`/api/meetings/${meetingCode}/end`);
  }

  /**
   * Cancel a meeting with optional reason
   * Only the meeting creator or organization owner can cancel
   * @param {string} meetingCode - Meeting code
   * @param {string} [reason] - Optional cancellation reason
   * @returns {Promise<{success: boolean, meeting: Object}>}
   */
  async cancelMeeting(meetingCode, reason) {
    const response = await this.client.patch(`/api/integration/meetings/${meetingCode}/cancel`, {
      reason
    });
    return response.data;
  }

  /**
   * Reschedule a meeting to a new time
   * Only the meeting creator or organization owner can reschedule
   * @param {string} meetingCode - Meeting code
   * @param {Object} data - Reschedule data
   * @param {string|Date} data.newScheduledAt - New scheduled date/time (ISO string or Date)
   * @param {number} [data.newDurationMinutes] - Optional new duration in minutes
   * @param {string} [data.reason] - Optional rescheduling reason
   * @returns {Promise<{success: boolean, meeting: Object}>}
   */
  async rescheduleMeeting(meetingCode, data) {
    const payload = {
      newScheduledAt: data.newScheduledAt instanceof Date
        ? data.newScheduledAt.toISOString()
        : data.newScheduledAt,
      newDurationMinutes: data.newDurationMinutes,
      reason: data.reason
    };
    const response = await this.client.patch(`/api/integration/meetings/${meetingCode}/reschedule`, payload);
    return response.data;
  }

  /**
   * Delete a meeting permanently
   * Only the meeting creator or organization owner can delete
   * WARNING: This action is irreversible - all meeting data will be permanently deleted
   * @param {string} meetingCode - Meeting code
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deleteMeeting(meetingCode) {
    const response = await this.client.delete(`/api/integration/meetings/${meetingCode}`);
    return response.data;
  }

  /**
   * Create organization-specific API key (server-to-server authentication)
   * This is a static method that uses platform key authentication
   * @param {Object} config
   * @param {string} config.baseUrl - Boooply API base URL
   * @param {string} config.platformKey - Platform API key for authentication
   * @param {Object} data - Organization and user data
   * @param {string} data.userId - User ID from your platform
   * @param {string} data.userEmail - User email
   * @param {string} [data.userName] - User name (optional)
   * @param {string} data.organizationId - Organization ID from your platform (snowflake ID)
   * @param {string} [data.organizationName] - Organization name (optional)
   * @returns {Promise<{success: boolean, apiKey: string, userId: string, userEmail: string, organizationId: string, organizationName: string, meetingBaseUrl: string, apiBaseUrl: string, message: string}>}
   */
  static async createOrganizationApiKey(config, data) {
    if (!config.baseUrl) {
      throw new Error('Boooply SDK: baseUrl is required');
    }
    if (!config.platformKey) {
      throw new Error('Boooply SDK: platformKey is required for server-to-server auth');
    }
    if (!data.userId || !data.userEmail || !data.organizationId) {
      throw new Error('Boooply SDK: userId, userEmail, and organizationId are required');
    }

    const baseUrl = config.baseUrl.replace(/\/$/, '');

    try {
      const response = await axios.post(
        `${baseUrl}/api/server-auth/create-api-key`,
        {
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          organizationId: data.organizationId,
          organizationName: data.organizationName
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.platformKey}`,
            'X-SDK-Version': version
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        const err = new Error(`Failed to create organization API key: ${JSON.stringify(error.response.data)}`);
        err.status = error.response.status;
        err.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        };
        throw err;
      }
      throw error;
    }
  }
}

// Re-export types and mappers for convenience
const {
  mapGoogleParticipant,
  mapMicrosoftParticipant,
  mapGenericParticipant
} = require('./mappers');

module.exports = {
  BoooplyClient,
  // Participant mappers
  mapGoogleParticipant,
  mapMicrosoftParticipant,
  mapGenericParticipant,
};
