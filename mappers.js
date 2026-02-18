/**
 * Participant mappers for different integration platforms
 */

/**
 * Map Google user to Boooply participant format
 * @param {Object} googleUser - Google user object
 * @param {string} googleUser.name - User's full name
 * @param {string} googleUser.email - User's email
 * @param {string} googleUser.id - Google user ID (sub)
 * @param {string} [googleUser.picture] - Optional avatar URL
 * @param {'HOST' | 'INTERVIEWER' | 'CANDIDATE'} [googleUser.role] - Assigned role (defaults to INTERVIEWER)
 * @returns {import('./types').ParticipantData}
 */
function mapGoogleParticipant(googleUser) {
  return {
    name: googleUser.name,
    email: googleUser.email,
    role: googleUser.role || 'INTERVIEWER',
    externalUserId: googleUser.id, // Google sub
    authProvider: 'GOOGLE',
    externalRole: 'GOOGLE_USER',
    avatarUrl: googleUser.picture,
  };
}

/**
 * Map Microsoft user to Boooply participant format
 * @param {Object} msUser - Microsoft user object
 * @param {string} msUser.displayName - User's display name
 * @param {string} msUser.mail - User's email
 * @param {string} msUser.id - Microsoft user ID
 * @param {'HOST' | 'INTERVIEWER' | 'CANDIDATE'} [msUser.role] - Assigned role (defaults to INTERVIEWER)
 * @returns {import('./types').ParticipantData}
 */
function mapMicrosoftParticipant(msUser) {
  return {
    name: msUser.displayName,
    email: msUser.mail,
    role: msUser.role || 'INTERVIEWER',
    externalUserId: msUser.id,
    authProvider: 'MICROSOFT',
    externalRole: 'MS_TEAMS_USER',
  };
}

/**
 * Map generic external user to Boooply participant format
 * @param {Object} user - Generic user object
 * @param {string} user.name - User's full name
 * @param {string} user.email - User's email
 * @param {string} user.externalUserId - External system user ID
 * @param {'TALENTFLOW' | 'GOOGLE' | 'MICROSOFT' | 'GITHUB' | 'NATIVE'} user.authProvider - Authentication provider
 * @param {'HOST' | 'CO_HOST' | 'INTERVIEWER' | 'CANDIDATE' | 'OBSERVER'} user.role - Meeting role
 * @param {string} [user.externalRole] - Original role from external system
 * @param {string} [user.avatarUrl] - Optional avatar URL
 * @returns {import('./types').ParticipantData}
 */
function mapGenericParticipant(user) {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    externalUserId: user.externalUserId,
    authProvider: user.authProvider,
    externalRole: user.externalRole,
    avatarUrl: user.avatarUrl,
  };
}

module.exports = {
  mapGoogleParticipant,
  mapMicrosoftParticipant,
  mapGenericParticipant,
};
