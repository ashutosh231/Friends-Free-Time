// Netlify Serverless Function for GetStream Token Generation
const { StreamChat } = require('stream-chat');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId is required' })
      };
    }

    // GetStream credentials from environment variables
    const API_KEY = process.env.VITE_STREAM_API_KEY;
    const API_SECRET = process.env.STREAM_API_SECRET;

    if (!API_KEY || !API_SECRET) {
      console.error('Missing GetStream credentials');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Create server-side Stream client
    const serverClient = StreamChat.getInstance(API_KEY, API_SECRET);

    // Generate token for the user
    const token = serverClient.createToken(userId);

    console.log(`✅ Generated token for user: ${userId}`);

    // Return token with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, userId })
    };

  } catch (error) {
    console.error('Token generation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to generate token',
        message: error.message 
      })
    };
  }
};
