# Boooply AI Interviews SDK

Official JavaScript/Node.js SDK for integrating with Boooply AI Interviews API.

## Installation

```bash
npm install @boooply/ai-interviews-sdk
# or
yarn add @boooply/ai-interviews-sdk
```

## Quick Start

```javascript
const { BoooplyClient } = require('boooply-ai-interviews-sdk');

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
  organizationId: '12345',
  participants: [
    {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'CANDIDATE',
      externalUserId: '67890',
      authProvider: 'NATIVE'
    },
    {
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'INTERVIEWER',
      externalUserId: '54321',
      authProvider: 'NATIVE'
    }
  ],
  jobTitle: 'Frontend Developer',
  skills: ['React', 'TypeScript', 'Node.js']
});

console.log('Meeting created:', meeting.meetingCode);
console.log('Join URL:', `https://meetings.boooply.com/join/${meeting.meetingCode}`);
```

## Participant Mappers

The SDK includes helper functions to map users from different platforms to Boooply's participant format.

### Generic Participant Mapping

```javascript
const { mapGenericParticipant } = require('boooply-ai-interviews-sdk');

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'CANDIDATE',
  externalUserId: '1234567890',
  authProvider: 'YOUR_PLATFORM',
  externalRole: 'USER'
};

const participant = mapGenericParticipant(user);
```

### Google Integration

```javascript
const { mapGoogleParticipant } = require('boooply-ai-interviews-sdk');

const googleUser = {
  name: 'Jane Smith',
  email: 'jane@gmail.com',
  id: 'google-user-id-123',
  picture: 'https://...',
  role: 'INTERVIEWER'
};

const participant = mapGoogleParticipant(googleUser);
```

### Microsoft Teams Integration

```javascript
const { mapMicrosoftParticipant } = require('boooply-ai-interviews-sdk');

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

Create a new meeting.

**Parameters:**
- `title` (string): Meeting title
- `description` (string, optional): Meeting description
- `scheduledAt` (string): ISO 8601 datetime
- `hostEmail` (string): Host's email address
- `organizationId` (string): Your organization ID
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
  authProvider: 'NATIVE'
});

console.log('Join token:', newParticipant.joinToken);
```

### `getOrganizationFeatures()`

Get all features enabled for your organization.

```javascript
const features = await boooply.getOrganizationFeatures();
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
import { BoooplyClient, ParticipantData, Meeting } from 'boooply-ai-interviews-sdk';

const client: BoooplyClient = new BoooplyClient({
  apiKey: process.env.BOOOPLY_API_KEY!,
  baseUrl: 'https://api.meetings.boooply.com'
});

const participant: ParticipantData = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'CANDIDATE',
  externalUserId: '12345',
  authProvider: 'NATIVE'
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

## License

MIT
