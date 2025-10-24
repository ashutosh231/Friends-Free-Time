# How to Add New User to Existing Channel

## Issue
When adding a new user like "Shobheet" to an existing GetStream chat channel, you may see this error:
```
User 'shobheet' with role 'user' is not allowed to perform action ReadChannel
```

## ✅ Solution Applied
**Changed the channel ID to create a fresh channel with all members.**

In `src/chatConfig.js`, the `CHANNEL_ID` has been updated to:
```javascript
export const CHANNEL_ID = 'friends-timetable-chat-v3';
```

This creates a new channel that includes all three users (Ashutosh, Dhruv, and Shobheet) from the start, avoiding permission issues.

## How It Works
- **Old channel**: `friends-timetable-chat` (had only 2 members)
- **New channel**: `friends-timetable-chat-v3` (has all 3 members)
- When users log in, they'll join the new channel
- Old messages are not migrated (fresh start)

## For Future Users
When adding more users in the future:
1. Add their credentials to `users` object in `App.jsx`
2. Add them to `chatUsers` in `chatConfig.js`
3. Add them to the `members` array in `App.jsx` (line ~218)
4. **Increment the channel version** in `chatConfig.js` (e.g., v3 → v4)

This ensures everyone starts fresh with proper permissions!
