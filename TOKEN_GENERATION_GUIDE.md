# 🔑 GetStream Token Generation Guide

## ⚠️ Error You're Seeing:

```
Chat error: development tokens are not allowed for this application
```

## ✅ Solution: Generate Real User Tokens

Your GetStream app doesn't allow development tokens. You need to generate real tokens for your users.

---

## 📋 Step-by-Step Instructions

### Step 1: Open GetStream Dashboard

Go to: **https://dashboard.getstream.io/**

Login with your GetStream account (the one you used to get API key `hea3zh2wagnj`)

---

### Step 2: Navigate to Chat Explorer

1. Make sure you're in the correct app (check the app selector at top)
2. In the left sidebar, click **"Chat"** or **"Chat Overview"**
3. Then click **"Chat Explorer"** or **"Explorer"**

---

### Step 3: Create User "ashutosh"

1. Click on the **"Users"** tab (should be near the top)
2. Click **"Add User"** or **"Create User"** button
3. Fill in the form:
   ```
   User ID: ashutosh
   Name: Ashutosh
   Image (optional): https://ui-avatars.com/api/?name=Ashutosh&background=a855f7&color=fff&size=128
   ```
4. Click **"Create"** or **"Save"**

---

### Step 4: Generate Token for "ashutosh"

1. After creating the user, you should see it in the users list
2. Click on the **"ashutosh"** user to open details
3. Look for a button that says **"Generate Token"** or **"Create Token"**
4. Click it
5. You'll see a long string of characters - this is your token!
6. **COPY THIS TOKEN** and save it somewhere temporarily

Example token looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXNodXRvc2gifQ.Xj8w4jY3kR9m2...
```

---

### Step 5: Create User "dhruv"

Repeat Step 3 for the second user:
```
User ID: dhruv
Name: Dhruv
Image (optional): https://ui-avatars.com/api/?name=Dhruv&background=ec4899&color=fff&size=128
```

---

### Step 6: Generate Token for "dhruv"

Repeat Step 4 for "dhruv" user and copy the token.

---

### Step 7: Update Your Config File

Once you have BOTH tokens, update `src/chatConfig.js`:

```javascript
// GetStream Chat Configuration
export const STREAM_API_KEY = 'hea3zh2wagnj';

// User configuration
export const chatUsers = {
  'ashutosh': {
    id: 'ashutosh',
    name: 'Ashutosh',
    emoji: '😊',
    password: 'ashu123',
    image: 'https://ui-avatars.com/api/?name=Ashutosh&background=a855f7&color=fff&size=128',
    token: 'PASTE_ASHUTOSH_TOKEN_HERE'  // <-- ADD THIS LINE
  },
  'dhruv': {
    id: 'dhruv',
    name: 'Dhruv',
    emoji: '🤩',
    password: 'dhruv123',
    image: 'https://ui-avatars.com/api/?name=Dhruv&background=ec4899&color=fff&size=128',
    token: 'PASTE_DHRUV_TOKEN_HERE'  // <-- ADD THIS LINE
  }
};

// Channel configuration
export const CHANNEL_ID = 'friends-timetable-chat';
export const CHANNEL_NAME = 'Friends Timetable Group Chat';
```

---

## 🎯 Alternative: Enable Development Tokens (Easier for Testing)

If you want to use development tokens (easier for testing), you can enable them:

### In GetStream Dashboard:

1. Go to your app settings
2. Look for **"Chat"** → **"Settings"** or **"Security"**
3. Find option for **"Disable Auth Checks"** or **"Enable Development Mode"**
4. Toggle it ON
5. Save changes

⚠️ **Note:** Development tokens are less secure and should only be used for testing!

---

## 🆘 Can't Find Where to Generate Tokens?

### Try this direct path:

1. Go to: https://dashboard.getstream.io/
2. Select your app from the dropdown
3. URL should look like: `https://dashboard.getstream.io/app/[YOUR_APP_ID]`
4. In the left menu: **Chat** → **Explorer** → **Users**
5. Click **"+"** or **"Add User"** button

### Still can't find it?

Try searching the dashboard for:
- "Users"
- "Chat Explorer"
- "User Management"

Or look for icons that look like:
- 👤 (user icon)
- 💬 (chat bubble)

---

## ✅ After Adding Tokens

1. Save `chatConfig.js`
2. The app should automatically reload (if `npm run dev` is running)
3. Try logging in again
4. Chat should work! 🎉

---

## 📞 Still Having Issues?

If you still see the error after adding tokens:

1. **Check token format:** Make sure you copied the full token (no spaces, no line breaks)
2. **Check user IDs match:** User ID in dashboard must be exactly `ashutosh` and `dhruv` (lowercase)
3. **Restart dev server:** Stop `npm run dev` and start again
4. **Clear browser cache:** Hard refresh (Cmd+Shift+R on Mac)
5. **Check browser console:** Look for more detailed error messages

---

## 🎊 Once It Works

You'll be able to:
- ✅ Login from two different browsers
- ✅ Send messages that sync instantly
- ✅ See read receipts
- ✅ See typing indicators
- ✅ Deploy to Netlify and it will work there too!

---

Need help? Let me know which step you're stuck on! 🚀
