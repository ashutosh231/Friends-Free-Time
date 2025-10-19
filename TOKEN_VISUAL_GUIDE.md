# 🎯 Quick Token Fix - Visual Guide

```
╔══════════════════════════════════════════════════════════════╗
║                    YOUR CURRENT ERROR                        ║
╚══════════════════════════════════════════════════════════════╝

❌ Chat error: development tokens are not allowed


╔══════════════════════════════════════════════════════════════╗
║                    WHAT YOU NEED TO DO                       ║
╚══════════════════════════════════════════════════════════════╝

Get tokens for 2 users from GetStream Dashboard:
1. ashutosh 
2. dhruv


╔══════════════════════════════════════════════════════════════╗
║                  STEP-BY-STEP VISUAL GUIDE                   ║
╚══════════════════════════════════════════════════════════════╝


STEP 1: Open GetStream Dashboard
─────────────────────────────────────────────────────────────
🌐 https://dashboard.getstream.io/

┌─────────────────────────────────────────┐
│  GetStream Dashboard                    │
│  ┌─────────────────┐                   │
│  │ Your App Name   ▼│  ← Select your app│
│  └─────────────────┘                   │
│                                         │
│  Sidebar:                              │
│  📊 Overview                           │
│  💬 Chat            ← Click here!      │
│  👤 Users                              │
│  ⚙️  Settings                          │
└─────────────────────────────────────────┘


STEP 2: Navigate to Chat Explorer
─────────────────────────────────────────────────────────────
After clicking "Chat", look for "Explorer" or "Chat Explorer"

┌─────────────────────────────────────────┐
│  Chat                                   │
│  ┌──────────┬──────────┬──────────┐   │
│  │ Overview │ Explorer │ Settings │   │
│  └──────────┴──────────┴──────────┘   │
│           ↑ Click here!                │
└─────────────────────────────────────────┘


STEP 3: Go to Users Tab
─────────────────────────────────────────────────────────────
┌─────────────────────────────────────────┐
│  Chat Explorer                          │
│  ┌───────┬───────┬──────────┐          │
│  │ Users │ Teams │ Messages │          │
│  └───────┴───────┴──────────┘          │
│     ↑ Click here!                       │
│                                         │
│  [+ Add User]  ← Then click this       │
└─────────────────────────────────────────┘


STEP 4: Create User "ashutosh"
─────────────────────────────────────────────────────────────
┌─────────────────────────────────────────┐
│  Create New User                        │
│                                         │
│  User ID: [ashutosh     ]              │
│           ↑ Type exactly this          │
│                                         │
│  Name:    [Ashutosh     ]              │
│                                         │
│  Image:   [https://ui-avatars.com...]  │
│           (optional)                    │
│                                         │
│           [Create User]  ← Click       │
└─────────────────────────────────────────┘


STEP 5: Generate Token for "ashutosh"
─────────────────────────────────────────────────────────────
After creating user, you'll see the user in the list:

┌─────────────────────────────────────────┐
│  Users                                  │
│  ┌─────────────────────────────────┐   │
│  │ 👤 ashutosh                     │   │
│  │    ID: ashutosh                 │   │
│  │    [Generate Token]  ← Click!   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

After clicking "Generate Token":

┌─────────────────────────────────────────┐
│  User Token                             │
│  ┌───────────────────────────────────┐ │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp │ │
│  │ XVCJg.eyJ1c2VyX2lkIjoiYXNodXRv │ │
│  │ c2gifQ.Xj8w4jY3kR9m2pL5nH8...   │ │
│  └───────────────────────────────────┘ │
│  [📋 Copy]  ← Click to copy            │
└─────────────────────────────────────────┘

✅ COPY THIS TOKEN! Save it somewhere.


STEP 6 & 7: Repeat for "dhruv"
─────────────────────────────────────────────────────────────
Create user "dhruv" and generate token the same way.

You should now have TWO tokens:
✅ Token for ashutosh
✅ Token for dhruv


STEP 8: Update Your Code
─────────────────────────────────────────────────────────────
Open: src/chatConfig.js

Add the tokens:

export const chatUsers = {
  'ashutosh': {
    id: 'ashutosh',
    name: 'Ashutosh',
    emoji: '😊',
    password: 'ashu123',
    image: 'https://ui-avatars.com/api/?name=Ashutosh...',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'  // ← PASTE HERE
  },
  'dhruv': {
    id: 'dhruv',
    name: 'Dhruv',
    emoji: '🤩',
    password: 'dhruv123',
    image: 'https://ui-avatars.com/api/?name=Dhruv...',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'  // ← PASTE HERE
  }
};


╔══════════════════════════════════════════════════════════════╗
║                     AFTER ADDING TOKENS                      ║
╚══════════════════════════════════════════════════════════════╝

1. Save the file (Cmd+S)
2. App will auto-reload (if dev server is running)
3. Try logging in again
4. Chat should work! ✅


╔══════════════════════════════════════════════════════════════╗
║                    EASIER ALTERNATIVE                        ║
╚══════════════════════════════════════════════════════════════╝

If generating tokens is too complicated, you can enable
development mode in your GetStream app:

1. Go to GetStream Dashboard
2. Click on your app
3. Go to Settings → Security (or Chat Settings)
4. Look for "Disable Auth Checks" or "Development Mode"
5. Toggle it ON
6. Save

Then development tokens will work (no need to generate tokens)

⚠️  But this is less secure - only for testing!


╔══════════════════════════════════════════════════════════════╗
║                        NEED HELP?                            ║
╚══════════════════════════════════════════════════════════════╝

If you're stuck:

1. Share what you see in the GetStream dashboard
2. Share any error messages from browser console (F12)
3. Let me know which step you're on

I'll help you through it! 🚀


╔══════════════════════════════════════════════════════════════╗
║                      QUICK CHECKLIST                         ║
╚══════════════════════════════════════════════════════════════╝

□ Logged into GetStream Dashboard
□ Selected correct app (API key: hea3zh2wagnj)
□ Found Chat → Explorer → Users
□ Created user "ashutosh"
□ Generated token for "ashutosh"
□ Copied token for "ashutosh"
□ Created user "dhruv"
□ Generated token for "dhruv"
□ Copied token for "dhruv"
□ Updated src/chatConfig.js with both tokens
□ Saved the file
□ Tested the app

Once all checked, you're done! ✨
```
