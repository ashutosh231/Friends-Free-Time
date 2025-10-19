# 🚀 GetStream Chat Setup Guide

## Why GetStream?
✅ **Real-time messaging** that actually works across devices  
✅ **Reliable delivery** - messages sync instantly  
✅ **No localStorage issues** - proper backend  
✅ **Professional chat features** - read receipts, typing indicators  
✅ **Free tier** - 25 monthly active users included  

---

## Setup Steps

### 1️⃣ Create GetStream Account (FREE)

1. Go to: https://getstream.io/chat/
2. Click **"Try for Free"** or **"Get Started"**
3. Sign up with your email/Google/GitHub
4. Verify your email

### 2️⃣ Create Your App

1. After login, you'll be in the **Dashboard**
2. Click **"Create App"** or you might already have a default app
3. Give it a name: `Friends Timetable Chat`
4. Select **Development** mode (free)

### 3️⃣ Get Your API Credentials

1. In your app dashboard, go to **"Overview"** or **"App Settings"**
2. You'll see:
   - **App ID**: (e.g., `1234567`)
   - **API Key**: (e.g., `abcd1234efgh5678`)
   - **Secret**: (Keep this SECRET! ⚠️)

3. **Copy the API Key** (the long string)

### 4️⃣ Configure Your App

1. Open `src/chatConfig.js`
2. Replace `YOUR_STREAM_API_KEY` with your actual API Key:

```javascript
export const STREAM_API_KEY = 'your_actual_api_key_here';
```

### 5️⃣ Generate User Tokens (Important!)

GetStream needs user tokens for authentication. You have 2 options:

#### Option A: Use Development Tokens (Easiest for Testing)

In GetStream Dashboard:
1. Go to **Chat** → **Explorer**
2. Click on **"Users"** tab
3. Create users: `ashutosh` and `dhruv`
4. For each user, click **"Generate Token"**
5. Copy these tokens

Then update `src/chatConfig.js`:
```javascript
export const chatUsers = {
  'ashutosh': {
    id: 'ashutosh',
    name: 'Ashutosh',
    token: 'paste_ashutosh_token_here',
    // ... rest stays same
  },
  'dhruv': {
    id: 'dhruv',
    name: 'Dhruv',
    token: 'paste_dhruv_token_here',
    // ... rest stays same
  }
};
```

#### Option B: Server-Side Token Generation (Production Ready)

For production, you'll need a backend to generate tokens securely.
We can set this up later if needed!

---

## 🎯 Quick Start Commands

After configuring your API key:

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📝 Testing Your Setup

1. Open the app in **two different browsers** (e.g., Chrome and Firefox)
2. Login as `ashutosh` in one browser
3. Login as `dhruv` in the other
4. Send messages - they should appear instantly in both! ⚡

---

## 🆘 Troubleshooting

### "Invalid API Key" Error
- Double-check you copied the full API key
- Make sure there are no extra spaces
- Verify the key in GetStream dashboard

### Messages Not Appearing
- Check browser console for errors
- Verify both users are connected
- Make sure you generated user tokens

### Need Help?
- GetStream Docs: https://getstream.io/chat/docs/
- GetStream Support: support@getstream.io

---

## 🎉 Once It's Working

Your messages will:
- ✅ Sync in real-time across all devices
- ✅ Work on Netlify deployment
- ✅ Show read receipts
- ✅ Support typing indicators
- ✅ Store message history reliably

---

## 💰 Pricing (Don't Worry!)

**Free Tier Includes:**
- 25 monthly active users
- Unlimited messages
- All chat features
- Perfect for you and your friends! 🎊

---

Need help with setup? Let me know! 🚀
