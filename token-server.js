// Simple Token Server for GetStream Chat
// This generates secure user tokens using your API secret
// Run this on a backend (never expose API secret in frontend!)

import { StreamChat } from 'stream-chat';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// ⚠️ IMPORTANT: Keep this secret SAFE! Never commit to git or expose to frontend
const API_KEY = 'vpkg2fqsb6aq';
const API_SECRET = 'q6x28kxzd7h7acavvphuzzzjm2mfgcapsg6ex4nkxp4ghzekz8qb2ar9hfmn7c4s';

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(API_KEY, API_SECRET);

app.use(cors());
app.use(express.json());

// Endpoint to generate user tokens
app.post('/generate-token', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  try {
    // Generate token for the user
    const token = serverClient.createToken(userId);
    
    console.log(`✅ Generated token for user: ${userId}`);
    
    res.json({ 
      token,
      userId,
      apiKey: API_KEY 
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Token server is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Token server running on http://localhost:${PORT}`);
  console.log(`📝 Generate tokens at: http://localhost:${PORT}/generate-token`);
  console.log(`💡 API Key: ${API_KEY}`);
});
