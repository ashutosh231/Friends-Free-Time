// GetStream Chat Configuration
// Get your API key from: https://getstream.io/dashboard/

export const STREAM_API_KEY = 'vpkg2fqsb6aq'; // You'll need to get this from GetStream

// User configuration
export const chatUsers = {
  'ashutosh': {
    id: 'ashutosh',
    name: 'Ashutosh',
    emoji: '😊',
    password: 'ashu123',
    image: 'https://ui-avatars.com/api/?name=Ashutosh&background=a855f7&color=fff&size=128'
  },
  'dhruv': {
    id: 'dhruv',
    name: 'Dhruv',
    emoji: '🤩',
    password: 'dhruv123',
    image: 'https://ui-avatars.com/api/?name=Dhruv&background=ec4899&color=fff&size=128'
  },
  'shobheet': {
    id: 'shobheet',
    name: 'Shobheet',
    emoji: '🎯',
    password: 'shobheet123',
    image: 'https://ui-avatars.com/api/?name=Shobheet&background=6366f1&color=fff&size=128'
  }
};

// Channel configuration
// Note: If you add new members and get permission errors, increment the version number
// This creates a fresh channel with all members included
export const CHANNEL_ID = 'friends-timetable-chat-v3';
export const CHANNEL_NAME = 'Friends Timetable Group Chat';
