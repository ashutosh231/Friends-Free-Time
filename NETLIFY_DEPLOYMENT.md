# 🚀 Deploy to Netlify - Complete Guide

## Overview
Your app now has **TWO** modes:
- **Development** (localhost): Uses Node.js token server on port 3001
- **Production** (Netlify): Uses Netlify Serverless Functions (no separate server needed!)

## 📁 What We Set Up

### 1. Netlify Serverless Function
**File**: `netlify/functions/generate-token.js`
- Replaces your local `token-server.js`
- Runs automatically on Netlify
- No separate server needed!

### 2. Netlify Configuration
**File**: `netlify.toml`
- Configures build settings
- Sets up API redirects (`/api/generate-token` → serverless function)
- Handles SPA routing

### 3. Smart Token Fetching
**File**: `src/App.jsx` (updated)
```javascript
// Auto-detects environment
const tokenEndpoint = import.meta.env.PROD 
  ? '/api/generate-token'           // Netlify (production)
  : 'http://localhost:3001/generate-token'; // Local (development)
```

## 🔧 Step-by-Step Deployment

### Step 1: Push Code to GitHub
```bash
cd "/Users/ashutoshkumar/Desktop/friends TT/friends"

# Initialize git (if not already done)
git init
git add .
git commit -m "Add Netlify serverless function for GetStream tokens"

# Push to GitHub
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Connect to Netlify

1. **Go to Netlify**: https://app.netlify.com
2. **Click**: "Add new site" → "Import an existing project"
3. **Select**: GitHub
4. **Choose**: Your repository
5. **Build Settings** (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### Step 3: Set Environment Variables

⚠️ **CRITICAL**: Add these in Netlify dashboard

1. Go to **Site settings** → **Environment variables**
2. Add these variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `VITE_STREAM_API_KEY` | `vpkg2fqsb6aq` | Your GetStream API Key |
| `STREAM_API_SECRET` | `q6x28kxzd7h7acavvphuzzzjm2mfgcapsg6ex4nkxp4ghzekz8qb2ar9hfmn7c4s` | Your GetStream Secret (KEEP SECRET!) |

**How to add:**
```
1. Click "Add a variable"
2. Key: VITE_STREAM_API_KEY
3. Value: vpkg2fqsb6aq
4. Click "Create variable"

Repeat for STREAM_API_SECRET
```

### Step 4: Deploy!

Click **"Deploy site"** - Netlify will:
1. ✅ Install dependencies
2. ✅ Build your React app
3. ✅ Deploy serverless function
4. ✅ Give you a live URL!

## 🧪 Testing Your Deployment

### Test the Serverless Function
```bash
# Replace YOUR-SITE with your Netlify site name
curl -X POST https://YOUR-SITE.netlify.app/api/generate-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"ashutosh"}'

# Expected response:
# {"token":"eyJ...","userId":"ashutosh"}
```

### Test the Full App
1. Open your Netlify URL
2. Login as Ashutosh or Dhruv
3. Check the timetable loads
4. Open chat and send messages
5. Test from another device/browser

## 🔄 How It Works

### Development (localhost)
```
React App (localhost:5174)
    ↓
Fetch token from: http://localhost:3001/generate-token
    ↓
Local token-server.js (Express server)
    ↓
Returns token
```

### Production (Netlify)
```
React App (yoursite.netlify.app)
    ↓
Fetch token from: /api/generate-token
    ↓
Netlify Function (serverless)
    ↓
Returns token
```

## 📝 Local Development Commands

```bash
# Terminal 1: Start token server (for development)
npm run token-server

# Terminal 2: Start React app
npm run dev
```

## 🔒 Security Features

✅ **API Secret Protected**: Never exposed to frontend
✅ **Environment Variables**: Stored securely in Netlify
✅ **Server-Side Token Generation**: Tokens generated on backend only
✅ **CORS Enabled**: Only your domain can call the function

## 🐛 Troubleshooting

### Issue: "Token service unavailable"
**Solution**: Check environment variables in Netlify
```
1. Go to Site settings → Environment variables
2. Verify VITE_STREAM_API_KEY exists
3. Verify STREAM_API_SECRET exists
4. Redeploy site
```

### Issue: Chat not connecting
**Solution**: Check browser console
```javascript
// Should see:
// Fetching token from: /api/generate-token
// NOT localhost:3001
```

### Issue: 404 on /api/generate-token
**Solution**: Check `netlify.toml` is in root directory
```bash
# Verify file exists
ls netlify.toml

# Should show redirects
cat netlify.toml
```

### Issue: Function crashes
**Solution**: Check Netlify function logs
```
1. Go to Netlify dashboard
2. Click "Functions"
3. Click "generate-token"
4. Check logs for errors
```

## 🚀 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Repository connected to Netlify
- [ ] Environment variables added (both VITE_STREAM_API_KEY and STREAM_API_SECRET)
- [ ] Site deployed successfully
- [ ] Serverless function accessible at `/api/generate-token`
- [ ] Login works
- [ ] Chat works
- [ ] Messages send/receive properly
- [ ] Tested from multiple devices/browsers

## 📦 Files Changed for Netlify

1. ✅ `netlify/functions/generate-token.js` - Serverless function (NEW)
2. ✅ `netlify.toml` - Netlify configuration (NEW)
3. ✅ `src/App.jsx` - Smart endpoint detection (UPDATED)

## 💡 Pro Tips

1. **Keep Local Server for Dev**: Still use `npm run token-server` for local development
2. **Environment Detection**: Code automatically uses correct endpoint
3. **No Code Changes**: Same code works locally and in production!
4. **Free Tier**: Netlify functions are free for reasonable usage
5. **Instant Deploy**: Push to GitHub = automatic deploy (if enabled)

## 🔗 Useful Links

- **Netlify Dashboard**: https://app.netlify.com
- **Function Logs**: Dashboard → Functions → generate-token → Logs
- **Environment Variables**: Dashboard → Site settings → Environment variables
- **Deploy Logs**: Dashboard → Deploys → [Latest deploy] → Deploy log

## 🎉 Next Steps After Deployment

1. **Share your URL** with friends to test!
2. **Set up custom domain** (optional)
3. **Enable auto-deploy** from GitHub
4. **Monitor function usage** in Netlify dashboard

---

**Ready to Deploy?** Follow Step 1 above! 🚀
