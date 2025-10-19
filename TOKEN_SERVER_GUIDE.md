# 🎯 Token Server Setup - Complete Guide

## ✅ What We've Done

Your app now uses **server-side token generation** which is more secure and works with GetStream's security settings!

### Files Created/Updated:
- ✅ `token-server.js` - Backend server to generate tokens
- ✅ `src/App.jsx` - Updated to fetch tokens from server
- ✅ `package.json` - Added token-server script

---

## 🚀 How to Use (Simple 2-Step Process)

### Step 1: Start the Token Server

Open a **new terminal** and run:

```bash
cd "/Users/ashutoshkumar/Desktop/friends TT/friends"
npm run token-server
```

You should see:
```
🚀 Token server running on http://localhost:3001
📝 Generate tokens at: http://localhost:3001/generate-token
💡 API Key: vpkg2fqsb6aq
```

**Keep this terminal running!** ⚡

### Step 2: Start Your App

The app is already running at http://localhost:5174/

If not, open another terminal and run:
```bash
cd "/Users/ashutoshkumar/Desktop/friends TT/friends"
npm run dev
```

---

## 🧪 Testing Your Chat

Now test with two browsers:

### Browser 1 (Chrome):
1. Go to http://localhost:5174/
2. Login as `ashutosh` (password: `ashu123`)
3. Scroll down to chat section
4. Click "Show Chat"

### Browser 2 (Firefox):
1. Go to http://localhost:5174/
2. Login as `dhruv` (password: `dhruv123`)
3. Scroll down to chat section
4. Click "Show Chat"

### Send Messages:
- Type a message in Chrome and send
- Watch it appear **instantly** in Firefox! ⚡
- Try sending from Firefox to Chrome
- Both users should see all messages in real-time!

---

## 🔧 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    How Token Generation Works           │
└─────────────────────────────────────────────────────────┘

Browser (ashutosh)                Token Server              GetStream
      │                                │                         │
      │  1. Login as 'ashutosh'        │                         │
      │────────────────────────────────>│                         │
      │                                │                         │
      │  2. Request token              │                         │
      │     for 'ashutosh'             │                         │
      │────────────────────────────────>│                         │
      │                                │                         │
      │                                │  3. Generate token      │
      │                                │     using API secret    │
      │                                │                         │
      │  4. Return secure token        │                         │
      │<────────────────────────────────│                         │
      │                                │                         │
      │  5. Connect to GetStream                                 │
      │     with token                                            │
      │──────────────────────────────────────────────────────────>│
      │                                │                         │
      │  6. ✅ Connected!                                         │
      │<──────────────────────────────────────────────────────────│
      │                                │                         │
      │  7. Send/Receive messages                                │
      │<─────────────────────────────────────────────────────────>│
```

---

## 📋 Terminal Setup

You need **TWO terminals running**:

### Terminal 1: Token Server
```bash
cd "/Users/ashutoshkumar/Desktop/friends TT/friends"
npm run token-server

# Output:
# 🚀 Token server running on http://localhost:3001
# ✅ Keep this running!
```

### Terminal 2: React App (Already Running)
```bash
# Already running at http://localhost:5174/
# If not, run:
npm run dev
```

---

## ✅ Success Indicators

### Token Server:
```
🚀 Token server running on http://localhost:3001
📝 Generate tokens at: http://localhost:3001/generate-token
💡 API Key: vpkg2fqsb6aq
```

When users login, you'll see:
```
✅ Generated token for user: ashutosh
✅ Generated token for user: dhruv
```

### React App:
- No error messages in chat section
- Chat loads successfully
- Messages appear in real-time
- Read receipts work
- Typing indicators work

---

## 🆘 Troubleshooting

### Error: "Token server not running"

**Problem:** Token server is not started

**Solution:**
```bash
# Start the token server:
npm run token-server
```

### Error: "Port 3001 in use"

**Problem:** Another process is using port 3001

**Solution:**
```bash
# Find and kill the process:
lsof -ti:3001 | xargs kill -9

# Then start again:
npm run token-server
```

### Error: "Failed to fetch token"

**Problem:** Token server crashed or not responding

**Solution:**
1. Check Terminal 1 for errors
2. Restart token server:
   ```bash
   npm run token-server
   ```

### Chat still shows errors

**Problem:** Browser cache or old connection

**Solution:**
1. Refresh both browsers (Cmd+Shift+R on Mac)
2. Re-login to the app
3. Check browser console (F12) for errors

---

## 🔒 Security Notes

### ⚠️ IMPORTANT - API Secret

The API secret in `token-server.js` is **very sensitive**:

```javascript
const API_SECRET = 'q6x28kxzd7h7acavvphuzzzjm2mfgcapsg6ex4nkxp4ghzekz8qb2ar9hfmn7c4s';
```

**DO NOT:**
- ❌ Commit this to GitHub
- ❌ Share it publicly
- ❌ Use it in frontend code
- ❌ Expose it in any way

**DO:**
- ✅ Keep it only in `token-server.js`
- ✅ Add `token-server.js` to `.gitignore` (if sharing code)
- ✅ Use environment variables in production
- ✅ Keep the token server private

### For Production (Netlify):

When deploying to Netlify, you'll need:
1. Deploy token server to a backend service (e.g., Vercel, Railway, Heroku)
2. Update the fetch URL in `App.jsx` to your deployed server
3. Use environment variables for the API secret

We can set this up later when you're ready to deploy!

---

## 📊 What's Different Now

### Before (Development Tokens):
```javascript
const userToken = chatClient.devToken(userId);
// ❌ Not allowed by your GetStream app
```

### Now (Server-Generated Tokens):
```javascript
// Fetch from secure backend
const response = await fetch('http://localhost:3001/generate-token', {
  method: 'POST',
  body: JSON.stringify({ userId })
});
const data = await response.json();
const userToken = data.token; // ✅ Secure, properly signed token
```

---

## 🎉 Next Steps

1. ✅ **Start token server** (Terminal 1)
2. ✅ **App is already running** (Terminal 2)
3. ✅ **Test in two browsers**
4. ✅ **Send messages** - they should sync!
5. 🚀 **Deploy** (when ready)

---

## 💡 Quick Reference

### Start Token Server:
```bash
npm run token-server
```

### Start App:
```bash
npm run dev
```

### Test URLs:
- App: http://localhost:5174/
- Token Server Health: http://localhost:3001/health

### Credentials:
- User 1: `ashutosh` / `ashu123`
- User 2: `dhruv` / `dhruv123`

---

Ready to test? 

1. Start the token server: `npm run token-server`
2. Refresh your browser at http://localhost:5174/
3. Login and test the chat! 🎊
