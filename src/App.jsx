import React, { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import 'stream-chat-react/dist/css/v2/index.css';
import { STREAM_API_KEY, STREAM_VIDEO_API_KEY, chatUsers, CHANNEL_ID, CHANNEL_NAME } from './chatConfig';
import VideoCallComponent from './VideoCallComponent';

// Initialize Stream Chat client
let chatClient = null;
let videoClient = null;

const App = () => {
  // Login states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Chat states
  const [channel, setChannel] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  // Video call states
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallId, setVideoCallId] = useState(null);
  const [videoCallType, setVideoCallType] = useState('audio'); // 'audio' or 'default' (video)

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showCommonSlots, setShowCommonSlots] = useState(false);

  // Fixed credentials for users
  const users = {
    'ashutosh': { password: 'ashu123', name: 'Ashutosh', emoji: '😊' },
    'dhruv': { password: 'dhruv123', name: 'Dhruv', emoji: '🤩' }
  };

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData.name);
      setIsLoggedIn(true);
      // Initialize chat for saved user
      initializeChat(userData.name.toLowerCase());
    }
    
    // Cleanup on component unmount
    return () => {
      if (chatClient && chatClient.userID) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, []);

  // Update time every second for live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize GetStream Chat
  const initializeChat = async (userId) => {
    try {
      setChatLoading(true);
      setChatError('');

      // Check if API key is configured
      if (!STREAM_API_KEY || STREAM_API_KEY === 'YOUR_STREAM_API_KEY') {
        setChatError('⚠️ GetStream API key not configured. Please check GETSTREAM_SETUP.md');
        setChatLoading(false);
        return;
      }

      // Initialize chat client if not already done or if disconnected
      if (!chatClient || !chatClient.userID) {
        chatClient = StreamChat.getInstance(STREAM_API_KEY);
      }

      // If user is already connected, don't reconnect
      if (chatClient.userID === userId) {
        console.log('User already connected, reusing existing connection');
        setChatLoading(false);
        return;
      }

      const userConfig = chatUsers[userId];
      if (!userConfig) {
        throw new Error('User configuration not found');
      }

      // Fetch token from backend server
      let userToken;
      try {
        // Use Netlify function in production, localhost in development
        const tokenEndpoint = import.meta.env.PROD 
          ? '/api/generate-token'  // Netlify function (production)
          : 'http://localhost:3001/generate-token'; // Local server (development)
        
        const response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch token from server');
        }
        
        const data = await response.json();
        userToken = data.token;
      } catch (tokenError) {
        console.error('Token fetch error:', tokenError);
        setChatError(
          import.meta.env.PROD 
            ? '⚠️ Token service unavailable. Please try again later.'
            : '⚠️ Token server not running. Start it with: npm run token-server'
        );
        setChatLoading(false);
        return;
      }

      // Connect user only if not already connected
      if (!chatClient.userID) {
        await chatClient.connectUser(
          {
            id: userId,
            name: userConfig.name,
            image: userConfig.image,
          },
          userToken
        );
      }

      // Initialize Video Client
      if (!videoClient) {
        videoClient = new StreamVideoClient({
          apiKey: STREAM_VIDEO_API_KEY,
          user: {
            id: userId,
            name: userConfig.name,
            image: userConfig.image,
          },
          token: userToken,
        });
      }

      // Create or get the channel
      const channelInstance = chatClient.channel('messaging', CHANNEL_ID, {
        name: CHANNEL_NAME,
        members: ['ashutosh', 'dhruv'],
        image: 'https://ui-avatars.com/api/?name=Friends&background=a855f7&color=fff&size=128',
      });

      await channelInstance.watch();
      setChannel(channelInstance);
      setChatLoading(false);
    } catch (error) {
      console.error('Chat initialization error:', error);
      setChatError(`Chat error: ${error.message}. Check GETSTREAM_SETUP.md for help.`);
      setChatLoading(false);
    }
  };

  // Cleanup on logout
  const disconnectChat = async () => {
    try {
      if (chatClient && chatClient.userID) {
        setChannel(null); // Clear channel first
        await chatClient.disconnectUser();
        chatClient = null; // Reset client to null
      }
      
      // Disconnect video client
      if (videoClient) {
        await videoClient.disconnectUser();
        videoClient = null;
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      chatClient = null; // Reset anyway
      videoClient = null;
      setChannel(null);
    }
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    const userKey = username.toLowerCase().trim();
    
    if (users[userKey] && users[userKey].password === password) {
      const userData = users[userKey];
      setCurrentUser(userData.name);
      setIsLoggedIn(true);
      setLoginError('');
      localStorage.setItem('loggedInUser', JSON.stringify({ name: userData.name, emoji: userData.emoji }));
      setUsername('');
      setPassword('');
      
      // Initialize chat
      await initializeChat(userKey);
    } else {
      setLoginError('Invalid username or password! 🚫');
    }
  };

  // Logout function
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Disconnect chat first
      await disconnectChat();
      
      // Reset all states
      setIsLoggedIn(false);
      setCurrentUser(null);
      setShowChat(false);
      setShowVideoCall(false);
      setChatError('');
      setChatLoading(false);
      
      // Clear localStorage
      localStorage.removeItem('loggedInUser');
    }
  };

  // Start video call
  const startVideoCall = () => {
    const callId = `friends-video-${Date.now()}`;
    setVideoCallId(callId);
    setVideoCallType('default'); // 'default' = video call
    setShowVideoCall(true);
  };

  // Start audio call
  const startAudioCall = () => {
    const callId = `friends-audio-${Date.now()}`;
    setVideoCallId(callId);
    setVideoCallType('audio'); // 'audio' = audio only
    setShowVideoCall(true);
  };

  // Close video call
  const closeVideoCall = () => {
    setShowVideoCall(false);
    setVideoCallId(null);
  };

  // Friend information for enhanced display
  const friendInfo = {
    'Ashutosh': {
      status: 'Active',
      lastSeen: 'Online',
      mood: 'Happy',
      emoji: '😊'
    },
    'Dhruv': {
      status: 'Active', 
      lastSeen: 'Online',
      mood: 'Excited',
      emoji: '🤩'
    }
  };

  // Timetable data for friends - All time slots must match for proper table display
  const timetable = {
    'Ashutosh': {
      Monday: [
        { time: '9:00-10:00', subject: 'PEV301 (T)', type: 'class' },
        { time: '10:00-11:00', subject: 'PEV301 (T)', type: 'class' },
        { time: '11:00-12:00', subject: 'Free', type: 'free' },
        { time: '12:00-1:00', subject: 'PEV301 (L)', type: 'class' },
        { time: '1:00-2:00', subject: 'PEV301 (L)', type: 'class' },
        { time: '2:00-3:00', subject: 'Free', type: 'free' },
        { time: '3:00-4:00', subject: 'PEAS05 (L)', type: 'class' },
        { time: '4:00-5:00', subject: 'PEAS05 (L)', type: 'class' },
      ],
      Tuesday: [
        { time: '9:00-10:00', subject: 'Free', type: 'free' },
        { time: '10:00-11:00', subject: 'INT252 (L)', type: 'class' },
        { time: '11:00-12:00', subject: 'INT252 (L)', type: 'class' },
        { time: '12:00-1:00', subject: 'IXD801 (P)', type: 'class' },
        { time: '1:00-2:00', subject: 'Free', type: 'free' },
        { time: '2:00-3:00', subject: 'Free', type: 'free' },
        { time: '3:00-4:00', subject: 'Free', type: 'free' },
      ],
      Wednesday: [
        { time: '9:00-10:00', subject: 'Free', type: 'free' },
        { time: '10:00-11:00', subject: 'INT222 (L)', type: 'class' },
        { time: '11:00-12:00', subject: 'INT222 (L)', type: 'class' },
        { time: '12:00-1:00', subject: 'IXD801 (P)', type: 'class' },
        { time: '1:00-2:00', subject: 'Free', type: 'free' },
        { time: '2:00-3:00', subject: 'Free', type: 'free' },
        { time: '3:00-4:00', subject: 'Free', type: 'free' },
      ],
      Thursday: [
        { time: '9:00-10:00', subject: 'INT252 (P)', type: 'class' },
        { time: '10:00-11:00', subject: 'INT252 (P)', type: 'class' },
        { time: '11:00-12:00', subject: 'INT252 (P)', type: 'class' },
        { time: '12:00-1:00', subject: 'IXD801 (P)', type: 'class' },
        { time: '1:00-2:00', subject: 'Free', type: 'free' },
        { time: '2:00-3:00', subject: 'Free', type: 'free' },
        { time: '3:00-4:00', subject: 'Free', type: 'free' },
      ],
      Friday: [
        { time: '9:00-10:00', subject: 'INT222 (P)', type: 'class' },
        { time: '10:00-11:00', subject: 'INT222 (P)', type: 'class' },
        { time: '11:00-12:00', subject: 'INT222 (P)', type: 'class' },
        { time: '12:00-1:00', subject: 'Free', type: 'free' },
        { time: '1:00-2:00', subject: 'Free', type: 'free' },
        { time: '2:00-3:00', subject: 'Free', type: 'free' },
        { time: '3:00-4:00', subject: 'Free', type: 'free' },
      ],
    },
    
    'Dhruv': {
      Monday: [
        { time: '9:00-10:00', subject: 'Free', type: 'free' },
        { time: '10:00-11:00', subject: 'PEV301 (T)', type: 'class' },
        { time: '11:00-12:00', subject: 'PEV301 (T)', type: 'class' },
        { time: '12:00-1:00', subject: 'PEAS05 (L)', type: 'class' },
        { time: '1:00-2:00', subject: 'Free', type: 'free' },
        { time: '2:00-3:00', subject: 'PEAS05 (L)', type: 'class' },
        { time: '3:00-4:00', subject: 'Free', type: 'free' },
        { time: '4:00-5:00', subject: 'Free', type: 'free' },
      ],
      Tuesday: [
        { time: '9:00-10:00', subject: 'INT222 (P)', type: 'class' },
        { time: '10:00-11:00', subject: 'INT222 (P)', type: 'class' },
        { time: '11:00-12:00', subject: 'Free', type: 'free' },
        { time: '12:00-1:00', subject: 'Free', type: 'free' },
        { time: '1:00-2:00', subject: 'PSY291 (L)', type: 'class' },
        { time: '2:00-3:00', subject: 'PEV301 (L)', type: 'class' },
        { time: '3:00-4:00', subject: 'Free', type: 'free' },
      ],
      Wednesday: [
        { time: '9:00-10:00', subject: 'INT252 (L)', type: 'class' },
        { time: '10:00-11:00', subject: 'INT252 (L)', type: 'class' },
        { time: '11:00-12:00', subject: 'INT252 (L)', type: 'class' },
        { time: '12:00-1:00', subject: 'Free', type: 'free' },
        { time: '1:00-2:00', subject: 'PSY291 (L)', type: 'class' },
        { time: '2:00-3:00', subject: 'Free', type: 'free' },
        { time: '3:00-4:00', subject: 'Free', type: 'free' },
      ],
      Thursday: [
        { time: '9:00-10:00', subject: 'INT222 (L)', type: 'class' },
        { time: '10:00-11:00', subject: 'INT252 (L)', type: 'class' },
        { time: '11:00-12:00', subject: 'Free', type: 'free' },
        { time: '12:00-1:00', subject: 'Free', type: 'free' },
        { time: '1:00-2:00', subject: 'PSY291 (L)', type: 'class' },
        { time: '2:00-3:00', subject: 'PEV301 (L)', type: 'class' },
        { time: '3:00-4:00', subject: 'Free', type: 'free' },
      ],
      Friday: [
        { time: '9:00-10:00', subject: 'Free', type: 'free' },
        { time: '10:00-11:00', subject: 'INT252 (P)', type: 'class' },
        { time: '11:00-12:00', subject: 'INT252 (P)', type: 'class' },
        { time: '12:00-1:00', subject: 'Free', type: 'free' },
        { time: '1:00-2:00', subject: 'PSY291 (L)', type: 'class' },
        { time: '2:00-3:00', subject: 'Free', type: 'free' },
        { time: '3:00-4:00', subject: 'Free', type: 'free' },
      ],
    },
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const friends = Object.keys(timetable);

  // Function to check if a friend is currently available
  const isAvailableNow = (friendName) => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDayName = days[now.getDay() - 1];

    if (!currentDayName) return { available: false, status: 'Weekend' };

    const schedule = timetable[friendName][currentDayName];
    
    for (const slot of schedule) {
      const [start, end] = slot.time.split('-');
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      
      const currentTimeInMin = currentHour * 60 + currentMinute;
      const startTimeInMin = startHour * 60 + startMin;
      const endTimeInMin = endHour * 60 + endMin;
      
      if (currentTimeInMin >= startTimeInMin && currentTimeInMin < endTimeInMin) {
        return {
          available: slot.type === 'free' || slot.type === 'break',
          status: slot.subject,
          type: slot.type
        };
      }
    }
    
    return { available: false, status: 'Not in schedule', type: 'none' };
  };

  // Get common free slots for a specific day
  const getCommonFreeSlots = (day) => {
    const commonSlots = [];
    const timeSlots = timetable[friends[0]][day].map(slot => slot.time);
    
    timeSlots.forEach(timeSlot => {
      const availableFriends = friends.filter(friend => {
        const slot = timetable[friend][day].find(s => s.time === timeSlot);
        return slot && (slot.type === 'free' || slot.type === 'break');
      });
      
      if (availableFriends.length >= 2) {
        commonSlots.push({
          time: timeSlot,
          friends: availableFriends,
          count: availableFriends.length
        });
      }
    });
    
    return commonSlots;
  };

  const commonSlots = getCommonFreeSlots(selectedDay);

  // Function to get next common free time
  const getNextCommonFreeTime = () => {
    const now = new Date();
    const currentDay = days[now.getDay() - 1];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMin = currentHour * 60 + currentMinute;
    
    if (currentDay) {
      const todaySlots = getCommonFreeSlots(currentDay);
      for (const slot of todaySlots) {
        const [start] = slot.time.split('-');
        const [startHour, startMin] = start.split(':').map(Number);
        const startTimeInMin = startHour * 60 + startMin;
        
        if (startTimeInMin > currentTimeInMin) {
          return { day: currentDay, time: slot.time, friends: slot.friends };
        }
      }
    }
    
    const currentDayIndex = days.indexOf(currentDay);
    for (let i = 1; i < days.length; i++) {
      const nextDayIndex = (currentDayIndex + i) % days.length;
      const nextDay = days[nextDayIndex];
      const nextDaySlots = getCommonFreeSlots(nextDay);
      if (nextDaySlots.length > 0) {
        return { day: nextDay, time: nextDaySlots[0].time, friends: nextDaySlots[0].friends };
      }
    }
    
    return null;
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-200">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">🔐</div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-3">
                Welcome Back!
              </h1>
              <p className="text-gray-700 text-xl">Login to view your friends' timetables</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="flex items-center gap-3 text-gray-800 font-bold mb-3 text-lg">
                  👤 Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  className="w-full px-6 py-4 bg-white border-2 border-purple-200 rounded-2xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none text-gray-800 font-medium text-lg placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-3 text-gray-800 font-bold mb-3 text-lg">
                  🔑 Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full px-6 py-4 bg-white border-2 border-purple-200 rounded-2xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none text-gray-800 font-medium text-lg placeholder-gray-400"
                  required
                />
              </div>

              {loginError && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <p className="text-red-600 font-bold text-center">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold rounded-2xl text-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                🚀 Login
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
              <p className="text-sm text-blue-800 font-medium text-center">
                <strong>Demo Credentials:</strong><br />
                ashutosh / ashu123 or dhruv / dhruv123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App (rest of your timetable UI stays the same)
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 px-2 py-4 md:px-4 md:py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border-2 md:border-4 border-purple-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-2">
                Friends Timetable 📚
              </h1>
              <p className="text-gray-600 text-sm md:text-xl font-medium">
                Track your squad's schedule in real-time! ⏰
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl md:rounded-2xl font-bold shadow-lg text-sm md:text-base">
                <span className="mr-2">{friendInfo[currentUser]?.emoji}</span>
                Welcome, {currentUser}!
              </div>
              <button
                onClick={handleLogout}
                className="px-4 md:px-6 py-2 md:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl md:rounded-2xl font-bold transition-colors shadow-lg text-sm md:text-base w-full sm:w-auto"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Clock */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 border-4 border-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-white text-sm md:text-xl font-bold mb-1 md:mb-2 opacity-90">Current Time</p>
              <p className="text-white text-3xl md:text-5xl font-bold tracking-wider">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-purple-100 mt-1 md:mt-2 text-sm md:text-lg font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="text-6xl md:text-8xl">⏰</div>
          </div>
        </div>
      </div>

      {/* Current Availability */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border-2 md:border-4 border-purple-200">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-800 flex items-center gap-2 md:gap-3">
            <span className="text-2xl md:text-4xl">👥</span>
            Friend Status Right Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            {friends.map(friend => {
              const status = isAvailableNow(friend);
              return (
                <div
                  key={friend}
                  className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 md:border-4 ${
                    status.available 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                      : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'
                  } shadow-lg hover:shadow-xl transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-2xl md:text-3xl">{friendInfo[friend].emoji}</span>
                      {friend}
                    </h3>
                    <span className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold ${
                      status.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {status.available ? '✅ Free' : '❌ Busy'}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium text-sm md:text-lg">
                    <strong>Currently:</strong> {status.status}
                  </p>
                  {status.available && (
                    <div className="mt-2 md:mt-3 p-2 md:p-3 bg-green-100 rounded-lg border-2 border-green-300">
                      <p className="text-green-800 font-bold text-xs md:text-sm">
                        🎉 Available for a chat or hangout!
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Next Common Free Time */}
      {(() => {
        const nextFreeTime = getNextCommonFreeTime();
        if (nextFreeTime) {
          return (
            <div className="max-w-7xl mx-auto mb-4 md:mb-8">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 border-4 border-white">
                <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4 text-white flex items-center gap-2 md:gap-3">
                  <span className="text-2xl md:text-4xl">🎯</span>
                  Next Hangout Time
                </h2>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border-2 border-white/30">
                  <div className="flex-1">
                    <p className="text-white text-lg md:text-2xl font-bold">
                      {nextFreeTime.day} at {nextFreeTime.time}
                    </p>
                    <p className="text-yellow-100 text-xs md:text-sm mt-1">
                      All friends are free! Perfect time to hang out! 🎉
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {nextFreeTime.friends.map(friend => (
                      <div key={friend} className="px-3 py-1 md:px-4 md:py-2 bg-white/30 backdrop-blur-sm rounded-lg border-2 border-white/50 text-white font-bold text-xs md:text-sm">
                        {friendInfo[friend].emoji} {friend}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Day Selector */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 border-2 md:border-4 border-purple-200">
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-800 flex items-center gap-2">
            <span className="text-2xl md:text-3xl">📅</span>
            Select Day
          </h2>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all text-sm md:text-base ${
                  selectedDay === day
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Common Free Slots Toggle */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 border-2 md:border-4 border-purple-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl md:text-3xl">⭐</span>
                Common Free Slots
              </h2>
              <p className="text-gray-600 text-xs md:text-base mt-1">When everyone is available!</p>
            </div>
            <button
              onClick={() => setShowCommonSlots(!showCommonSlots)}
              className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl md:rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg text-sm md:text-base w-full sm:w-auto"
            >
              {showCommonSlots ? '▼ Hide' : '▶ Show'} ({commonSlots.length} slots)
            </button>
          </div>

          {showCommonSlots && commonSlots.length > 0 && (
            <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {commonSlots.map((slot, index) => (
                <div
                  key={index}
                  className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 md:border-4 border-green-300 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl md:text-2xl">🎉</span>
                    <p className="text-base md:text-lg font-bold text-gray-800">{slot.time}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {slot.friends.map(friend => (
                      <span
                        key={friend}
                        className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs md:text-sm font-bold"
                      >
                        {friendInfo[friend].emoji} {friend}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showCommonSlots && commonSlots.length === 0 && (
            <div className="mt-4 md:mt-6 p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border-2 border-gray-200 text-center">
              <p className="text-gray-600 font-medium text-sm md:text-base">
                😔 No common free slots on {selectedDay}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border-2 md:border-4 border-purple-200">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-800 flex items-center gap-2 md:gap-3">
            <span className="text-2xl md:text-4xl">📋</span>
            {selectedDay}'s Schedule
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 md:border-4 border-purple-300 bg-gradient-to-r from-purple-400 to-pink-400 p-2 md:p-4 text-white font-bold text-xs md:text-lg">
                    Time
                  </th>
                  {friends.map(friend => (
                    <th
                      key={friend}
                      className="border-2 md:border-4 border-purple-300 bg-gradient-to-r from-purple-500 to-pink-500 p-2 md:p-4 text-white font-bold text-xs md:text-lg"
                    >
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <span className="text-lg md:text-2xl">{friendInfo[friend].emoji}</span>
                        <span className="hidden sm:inline">{friend}</span>
                        <span className="sm:hidden">{friend.slice(0, 1)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable[friends[0]][selectedDay].map((_, index) => (
                  <tr key={index}>
                    <td className="border-2 md:border-4 border-purple-200 bg-purple-50 p-2 md:p-4 font-bold text-gray-700 text-xs md:text-base whitespace-nowrap">
                      {timetable[friends[0]][selectedDay][index].time}
                    </td>
                    {friends.map(friend => {
                      const slot = timetable[friend][selectedDay][index];
                      return (
                        <td
                          key={friend}
                          className={`border-2 md:border-4 border-purple-200 p-2 md:p-3 text-xs md:text-base font-medium ${
                            slot.type === 'class'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {slot.subject}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* GetStream Chat Section */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8" id="chatSection">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-purple-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-2xl md:text-4xl font-bold text-white flex items-center gap-2 md:gap-3 mb-1">
                  <span className="text-2xl md:text-3xl">💬</span>
                  Real-Time Group Chat
                </h2>
                <p className="text-purple-100 text-xs md:text-base">
                  Powered by GetStream - Messages sync instantly! ⚡
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                {/* Video Call Button */}
                <button
                  onClick={startVideoCall}
                  className="px-4 py-2 md:px-6 md:py-3 bg-green-500/80 hover:bg-green-600 text-white rounded-xl font-bold transition-all border-2 border-white/30 text-sm md:text-base flex items-center justify-center gap-2 backdrop-blur-sm hover:scale-105"
                  title="Start Video Call"
                >
                  <span className="text-xl">📹</span>
                  Video
                </button>
                {/* Audio Call Button */}
                <button
                  onClick={startAudioCall}
                  className="px-4 py-2 md:px-6 md:py-3 bg-blue-500/80 hover:bg-blue-600 text-white rounded-xl font-bold transition-all border-2 border-white/30 text-sm md:text-base flex items-center justify-center gap-2 backdrop-blur-sm hover:scale-105"
                  title="Start Audio Call"
                >
                  <span className="text-xl">📞</span>
                  Audio
                </button>
                {/* Toggle Chat Button */}
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="px-4 py-2 md:px-6 md:py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-colors border-2 border-white/30 text-sm md:text-base"
                >
                  {showChat ? '▼ Hide' : '▶ Show'}
                </button>
              </div>
            </div>
          </div>

          {showChat && (
            <div className="p-3 md:p-6">
              {/* Loading State */}
              {chatLoading && (
                <div className="text-center p-8 md:p-12">
                  <div className="text-4xl md:text-6xl mb-4 animate-spin">⏳</div>
                  <p className="text-gray-600 font-medium text-sm md:text-base">
                    Connecting to chat server...
                  </p>
                </div>
              )}

              {/* Error State */}
              {chatError && !channel && (
                <div className="p-4 md:p-6 bg-yellow-50 border-2 md:border-4 border-yellow-300 rounded-xl md:rounded-2xl">
                  <p className="text-yellow-800 font-medium text-sm md:text-base mb-3">{chatError}</p>
                  <div className="p-3 md:p-4 bg-white rounded-lg border-2 border-yellow-200">
                    <p className="text-xs md:text-sm text-gray-700 font-medium mb-2">
                      <strong>📖 Setup Required:</strong>
                    </p>
                    <ol className="text-xs md:text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Check <code className="bg-gray-100 px-2 py-0.5 rounded">GETSTREAM_SETUP.md</code> for instructions</li>
                      <li>Get your free API key from GetStream</li>
                      <li>Update <code className="bg-gray-100 px-2 py-0.5 rounded">src/chatConfig.js</code></li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Chat Interface */}
              {channel && !chatLoading && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl md:rounded-2xl border-2 md:border-4 border-purple-200 overflow-hidden">
                  <Chat client={chatClient} theme="messaging light">
                    <Channel channel={channel}>
                      <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput />
                      </Window>
                      <Thread />
                    </Channel>
                  </Chat>
                </div>
              )}

              {/* Info Banner */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                <div className="p-3 md:p-4 bg-green-50 border-2 border-green-300 rounded-lg md:rounded-xl">
                  <p className="text-xs md:text-sm text-green-800 font-bold flex items-center gap-1 md:gap-2">
                    ⚡ Real-Time
                  </p>
                  <p className="text-[10px] md:text-xs text-green-700 mt-1">
                    Messages appear instantly!
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-blue-50 border-2 border-blue-300 rounded-lg md:rounded-xl">
                  <p className="text-xs md:text-sm text-blue-800 font-bold flex items-center gap-1 md:gap-2">
                    ✓✓ Read Receipts
                  </p>
                  <p className="text-[10px] md:text-xs text-blue-700 mt-1">
                    See when messages are read
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-purple-50 border-2 border-purple-300 rounded-lg md:rounded-xl">
                  <p className="text-xs md:text-sm text-purple-800 font-bold flex items-center gap-1 md:gap-2">
                    💾 Cloud Saved
                  </p>
                  <p className="text-[10px] md:text-xs text-purple-700 mt-1">
                    Messages synced across devices
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video/Audio Call Modal */}
      {showVideoCall && videoClient && videoCallId && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full h-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={closeVideoCall}
                className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg border-2 border-white/30 backdrop-blur-sm"
              >
                ✕ Close
              </button>
            </div>
            
            {/* Video Call Component */}
            <VideoCallComponent
              videoClient={videoClient}
              callId={videoCallId}
              callType={videoCallType}
              onClose={closeVideoCall}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 md:mt-16 text-center pb-6 md:pb-8">
        <div className="inline-flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 md:px-8 md:py-4 rounded-full shadow-lg border-2 border-purple-200">
          <span className="text-base md:text-2xl">👫</span>
          <span className="text-gray-700 font-bold text-xs md:text-lg">Made with Friendship & Love</span>
          <span className="text-base md:text-2xl">💖</span>
        </div>
      </div>
    </div>
  );
};

export default App;
