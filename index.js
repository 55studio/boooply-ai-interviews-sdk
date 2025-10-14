const axios = require('axios');

/**
 * Boooply Meetings SDK Client
 * Provides a simple, type-safe interface for integrating with Boooply Meetings API
 */
class BoooplyClient {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - Organization API key for authentication
   * @param {string} config.baseUrl - Boooply API base URL (e.g., 'https://api.meetings.boooply.com')
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

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      timeout: 30000, // 30 seconds
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const err = new Error(error.response.data.error || 'API request failed');
          err.status = error.response.status;
          err.data = error.response.data;
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
    const response = await this.client.post('/api/meetings/create', data);
    return response.data;
  }

  /**
   * Create a new AI interview meeting
   * @param {import('./types').CreateAIInterviewRequest} data
   * @returns {Promise<import('./types').Meeting>}
   */
  async createAIInterview(data) {
    const response = await this.client.post('/api/ai-interview/create', data);
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
}

// Re-export types and mappers for convenience
const {
  mapTalentFlowParticipant,
  mapGoogleParticipant,
  mapMicrosoftParticipant,
  mapGenericParticipant
} = require('./mappers');

module.exports = {
  BoooplyClient,
  // Participant mappers
  mapTalentFlowParticipant,
  mapGoogleParticipant,
  mapMicrosoftParticipant,
  mapGenericParticipant,
};
