# Boooply Meetings SDK

Official JavaScript/Node.js SDK for integrating with Boooply Meetings API.

## Installation

```bash
npm install @boooply/sdk
# or
yarn add @boooply/sdk
```

For local development (not yet published to npm):

```bash
# In your project
npm install file:../boooply-meetings/backend/sdk
```

## Quick Start

```javascript
const { BoooplyClient, mapTalentFlowParticipant } = require('@boooply/sdk');

// Initialize the client
const boooply = new BoooplyClient({
  apiKey: 'your-organization-api-key',
  baseUrl: 'https://api.meetings.boooply.com'
});

// Create a meeting
const meeting = await boooply.createMeeting({
  title: 'Frontend Developer Interview',
  description: 'Technical interview for React position',
  scheduledAt: new Date('2025-01-15T14:00:00Z').toISOString(),
  hostEmail: 'recruiter@company.com',
  organizationId: '12345', // Your TalentFlow/external org ID
  participants: [
    {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'CANDIDATE',
      externalUserId: '67890',
      authProvider: 'TALENTFLOW',
      externalRole: 'JOBSEEKER'
    },
    {
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'INTERVIEWER',
      externalUserId: '54321',
      authProvider: 'TALENTFLOW',
      externalRole: 'SENIOR_RECRUITER'
    }
  ],
  jobTitle: 'Frontend Developer',
  skills: ['React', 'TypeScript', 'Node.js']
});

console.log('Meeting created:', meeting.meetingCode);
console.log('Join URL:', `https://meetings.boooply.com/join/${meeting.meetingCode}`);
```

## Participant Mappers

The SDK includes helper functions to map users from different platforms to Boooply's participant format:

### TalentFlow Integration

```javascript
const { mapTalentFlowParticipant } = require('@boooply/sdk');

// TalentFlow user object
const tfUser = {
  name: 'John Doe',
  email: 'john@example.com',
  type: 'JOBSEEKER', // TalentFlow role
  userId: '1234567890' // TalentFlow snowflake ID
};

// Convert to Boooply format
const participant = mapTalentFlowParticipant(tfUser);
// Result:
// {
//   name: 'John Doe',
//   email: 'john@example.com',
//   role: 'CANDIDATE', // Mapped from JOBSEEKER
//   externalUserId: '1234567890',
//   authProvider: 'TALENTFLOW',
//   externalRole: 'JOBSEEKER'
// }
```

**TalentFlow Role Mapping:**
- `JOBSEEKER` → `CANDIDATE`
- `INTERVIEWER` → `INTERVIEWER`
- `COMPANY_OWNER` → `HOST`
- `SENIOR_RECRUITER` → `CO_HOST`
- `RECRUITER` → `INTERVIEWER`

### Google Integration

```javascript
const { mapGoogleParticipant } = require('@boooply/sdk');

const googleUser = {
  name: 'Jane Smith',
  email: 'jane@gmail.com',
  id: 'google-user-id-123',
  picture: 'https://...',
  role: 'INTERVIEWER' // Optional, defaults to INTERVIEWER
};

const participant = mapGoogleParticipant(googleUser);
```

### Microsoft Teams Integration

```javascript
const { mapMicrosoftParticipant } = require('@boooply/sdk');

const msUser = {
  displayName: 'Bob Johnson',
  mail: 'bob@company.com',
  id: 'ms-user-id-456',
  role: 'HOST'
};

const participant = mapMicrosoftParticipant(msUser);
```

## API Methods

### `createMeeting(data)`

Create a new regular (human) meeting.

**Parameters:**
- `title` (string): Meeting title
- `description` (string, optional): Meeting description
- `scheduledAt` (string): ISO 8601 datetime
- `hostEmail` (string): Host's email address
- `organizationId` (string): External organization ID
- `participants` (array): Array of participant objects
- `jobTitle` (string, optional): Job title for transcription context
- `skills` (array, optional): Skills array for transcription context
- `meetingType` (string, optional): 'HUMAN', 'AI_ONLY', or 'HYBRID'

**Returns:** Meeting object with `meetingCode` and participant `joinToken`s

### `createAIInterview(data)`

Create an AI-powered interview meeting.

```javascript
const aiInterview = await boooply.createAIInterview({
  candidateEmail: 'candidate@example.com',
  candidateName: 'John Doe',
  candidateCV: 'Resume text...',
  jobRole: 'Senior Backend Engineer',
  companyName: 'Acme Corp',
  scheduledAt: new Date('2025-01-15T14:00:00Z').toISOString(),
  interviewContext: {
    type: 'TECHNICAL',
    questions: [...],
    // Additional context
  },
  organizationId: '12345'
});
```

### `getMeeting(meetingCode)`

Retrieve meeting details by meeting code.

```javascript
const meeting = await boooply.getMeeting('abc-def-ghi');
```

### `addParticipant(meetingCode, participant)`

Add a participant to an existing meeting.

```javascript
const newParticipant = await boooply.addParticipant('abc-def-ghi', {
  name: 'Late Joiner',
  email: 'late@example.com',
  role: 'OBSERVER',
  externalUserId: '99999',
  authProvider: 'TALENTFLOW'
});

console.log('Join token:', newParticipant.joinToken);
```

### `getOrganizationFeatures()`

Get all features enabled for your organization.

```javascript
const features = await boooply.getOrganizationFeatures();
// [
//   { featureType: 'LIVE_TRANSCRIPTION', isEnabled: true, ... },
//   { featureType: 'AI_INTERVIEW', isEnabled: true, ... },
//   ...
// ]
```

### `hasFeature(featureType)`

Check if a specific feature is enabled.

```javascript
const canUseAI = await boooply.hasFeature('AI_INTERVIEW');
if (canUseAI) {
  // Show AI interview option
}
```

**Available Features:**
- `AI_INTERVIEW`
- `LIVE_TRANSCRIPTION`
- `TRANSCRIPTION_SUMMARY`
- `VIDEO_RECORDING`
- `SCREENSHOT_CAPTURE`
- `RATE_CANDIDATES`
- `RATE_INTERVIEWERS`
- `AI_NOTES`
- `ANALYTICS`
- `CUSTOM_BRANDING`

### `updateMeeting(meetingCode, updates)`

Update meeting details.

```javascript
await boooply.updateMeeting('abc-def-ghi', {
  title: 'Updated Title',
  isRecording: true
});
```

### `endMeeting(meetingCode)`

End/cancel a meeting.

```javascript
await boooply.endMeeting('abc-def-ghi');
```

## TypeScript Support

The SDK includes JSDoc type definitions that work with TypeScript and modern IDEs:

```typescript
import { BoooplyClient, ParticipantData, Meeting } from '@boooply/sdk';

const client: BoooplyClient = new BoooplyClient({
  apiKey: process.env.BOOOPLY_API_KEY!,
  baseUrl: 'https://api.meetings.boooply.com'
});

const participant: ParticipantData = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'CANDIDATE',
  externalUserId: '12345',
  authProvider: 'TALENTFLOW'
};
```

## Error Handling

```javascript
try {
  const meeting = await boooply.createMeeting({ ... });
} catch (error) {
  console.error('Failed to create meeting:', error.message);
  console.error('Status:', error.status); // HTTP status code
  console.error('Details:', error.data); // Response data
}
```

## Complete Example: TalentFlow Integration

```javascript
const { BoooplyClient, mapTalentFlowParticipant } = require('@boooply/sdk');

class InterviewScheduler {
  constructor() {
    this.boooply = new BoooplyClient({
      apiKey: process.env.BOOOPLY_API_KEY,
      baseUrl: process.env.BOOOPLY_API_URL
    });
  }

  async scheduleInterview(interviewData) {
    // Map TalentFlow participants
    const participants = interviewData.participants.map(mapTalentFlowParticipant);

    // Create meeting
    const meeting = await this.boooply.createMeeting({
      title: `${interviewData.jobTitle} Interview`,
      description: interviewData.description,
      scheduledAt: interviewData.scheduledAt,
      hostEmail: interviewData.hostEmail,
      organizationId: interviewData.companyId.toString(),
      participants,
      jobTitle: interviewData.jobTitle,
      skills: interviewData.requiredSkills
    });

    // Generate join URLs for each participant
    const joinUrls = meeting.participants.map(p => ({
      email: p.email,
      joinUrl: `${process.env.FRONTEND_URL}/join/${meeting.meetingCode}?token=${p.joinToken}`
    }));

    return {
      meetingCode: meeting.meetingCode,
      joinUrls
    };
  }
}
```

## License

MIT
