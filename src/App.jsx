import React, { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import './chat-custom.css';
import { STREAM_API_KEY, chatUsers, CHANNEL_ID, CHANNEL_NAME } from './chatConfig';
import ThemeSwitcher from './ThemeSwitcher';
import QuickActions from './QuickActions';
import SmartNotifications from './SmartNotifications';
import { getTheme, loadTheme } from './themes';

// Initialize Stream Chat client
let chatClient = null;

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
  const [unreadCount, setUnreadCount] = useState(0);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showCommonSlots, setShowCommonSlots] = useState(false);
  
  // State for marking slots as free/unavailable
  const [markedFreeSlots, setMarkedFreeSlots] = useState(() => {
    const saved = localStorage.getItem('markedFreeSlots');
    return saved ? JSON.parse(saved) : {};
  });
  
  // State for marking class slots as cancelled/free
  const [cancelledClassSlots, setCancelledClassSlots] = useState(() => {
    const saved = localStorage.getItem('cancelledClassSlots');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Notification states
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState(loadTheme());
  
  // Get theme configuration
  const theme = getTheme(currentTheme);

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
    
    // Request notification permission
    requestNotificationPermission();
    
    // Cleanup on component unmount
    return () => {
      if (chatClient && chatClient.userID) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Send notification function
  const sendNotification = (title, body, icon = null) => {
    if (!notificationsEnabled || notificationPermission !== 'granted') return;
    
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'timetable-update',
      requireInteraction: true
    });
    
    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  };

  // Send chat notification about timetable changes
  const sendChatNotification = async (message) => {
    if (channel && currentUser) {
      try {
        await channel.sendMessage({
          text: message,
          type: 'system',
          user: { id: 'system', name: 'Timetable Bot' }
        });
      } catch (error) {
        console.error('Failed to send chat notification:', error);
      }
    }
  };

  // Update time every second for live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (showChat && channel) {
      setUnreadCount(0);
      // Mark all messages as read
      channel.markRead().catch(console.error);
    }
  }, [showChat, channel]);

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

      // Create or get the channel
      const channelInstance = chatClient.channel('messaging', CHANNEL_ID, {
        name: CHANNEL_NAME,
        members: ['ashutosh', 'dhruv'],
        image: 'https://ui-avatars.com/api/?name=Friends&background=a855f7&color=fff&size=128',
      });

      await channelInstance.watch();
      setChannel(channelInstance);
      
      // Get initial unread count
      const unreadMessages = channelInstance.countUnread();
      setUnreadCount(unreadMessages);
      
      // Listen for new messages to update unread count
      channelInstance.on('message.new', (event) => {
        // Only count if chat is not visible and message is not from current user
        if (!showChat && event.user?.id !== userId) {
          setUnreadCount(prev => prev + 1);
        }
      });
      
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
    } catch (error) {
      console.error('Disconnect error:', error);
      chatClient = null; // Reset anyway
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
      setChatError('');
      setChatLoading(false);
      setUnreadCount(0);
      
      // Clear localStorage
      localStorage.removeItem('loggedInUser');
    }
  };

  // Scroll to chat section
  const scrollToChat = () => {
    const chatSection = document.getElementById('chatSection');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Open chat if not already open
      if (!showChat) {
        setTimeout(() => setShowChat(true), 500);
      }
    }
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
    "Ashutosh": {
  "Monday": [
    { "time": "9:00-10:00", "subject": "PEV301 (T)", "room": "33-601", "faculty": "K23TA", "type": "class" },
    { "time": "10:00-11:00", "subject": "PEV301 (T)", "room": "33-601", "faculty": "K23TA", "type": "class" },
    { "time": "11:00-12:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "12:00-1:00", "subject": "PEV301 (L)", "room": "33-601", "faculty": "K23TA", "type": "class" },
    { "time": "1:00-2:00", "subject": "PEV301 (L)", "room": "33-601", "faculty": "K23TA", "type": "class" },
    { "time": "2:00-3:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "3:00-4:00", "subject": "Free", "room": "", "faculty": "", "type": "free" }
  ],
  "Tuesday": [
    { "time": "9:00-10:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "10:00-11:00", "subject": "INT252 (L)", "room": "33-505X", "faculty": "KM008", "type": "class" },
    { "time": "11:00-12:00", "subject": "INT252 (L)", "room": "33-505X", "faculty": "KM008", "type": "class" },
    { "time": "12:00-1:00", "subject": "IXD801 (P)", "room": "37-902", "faculty": "KO130", "type": "class" },
    { "time": "1:00-2:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "2:00-3:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "3:00-4:00", "subject": "Free", "room": "", "faculty": "", "type": "free" }
  ],
  "Wednesday": [
    { "time": "9:00-10:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "10:00-11:00", "subject": "INT222 (L)", "room": "33-504", "faculty": "KM008", "type": "class" },
    { "time": "11:00-12:00", "subject": "INT222 (L)", "room": "33-504", "faculty": "KM008", "type": "class" },
    { "time": "12:00-1:00", "subject": "IXD801 (P)", "room": "37-902", "faculty": "KO130", "type": "class" },
    { "time": "1:00-2:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "2:00-3:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "3:00-4:00", "subject": "Free", "room": "", "faculty": "", "type": "free" }
  ],
  "Thursday": [
    { "time": "9:00-10:00", "subject": "INT252 (P)", "room": "33-503", "faculty": "KM008", "type": "class" },
    { "time": "10:00-11:00", "subject": "INT252 (P)", "room": "33-503", "faculty": "KM008", "type": "class" },
    { "time": "11:00-12:00", "subject": "INT252 (P)", "room": "33-503", "faculty": "KM008", "type": "class" },
    { "time": "12:00-1:00", "subject": "IXD801 (P)", "room": "37-902", "faculty": "KO130", "type": "class" },
    { "time": "1:00-2:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "2:00-3:00", "subject": "PEAS05 (L)", "room": "34-704", "faculty": "9R777", "type": "class" },
    { "time": "3:00-4:00", "subject": "PEAS05 (L)", "room": "36-903", "faculty": "9R777", "type": "class" }
  ],
  "Friday": [
    { "time": "9:00-10:00", "subject": "Free", "room": "", "faculty": "", "type": "Free" },
    { "time": "10:00-11:00", "subject": "INT222 (P)", "room": "33-505", "faculty": "KM008", "type": "class" },
    { "time": "11:00-12:00", "subject": "INT222 (P)", "room": "33-505", "faculty": "KM008", "type": "class" },
    { "time": "12:00-1:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "1:00-2:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "2:00-3:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "3:00-4:00", "subject": "Free", "room": "", "faculty": "", "type": "free" }
  ]
},
    
    "Dhruv": {
  "Monday": [
    { "time": "9:00-10:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "10:00-11:00", "subject": "PEV301 (T)", "room": "36-909", "faculty": "K23EU", "type": "class" },
    { "time": "11:00-12:00", "subject": "PEV301 (T)", "room": "36-909", "faculty": "K23EU", "type": "class" },
    { "time": "12:00-1:00", "subject": "PEAS05 (L)", "room": "37-806", "faculty": "9R846", "type": "class" },
    { "time": "1:00-2:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "2:00-3:00", "subject": "PEAS05 (L)", "room": "37-806", "faculty": "9R846", "type": "class" },
    { "time": "3:00-4:00", "subject": "Free", "room": "", "faculty": "", "type": "free" }
  ],
  "Tuesday": [
    { "time": "9:00-10:00", "subject": "INT222 (P)", "room": "34-506X", "faculty": "K23EU", "type": "class" },
    { "time": "10:00-11:00", "subject": "INT222 (P)", "room": "34-506X", "faculty": "K23EU", "type": "class" },
    { "time": "11:00-12:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "12:00-1:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "1:00-2:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "2:00-3:00", "subject": "PEV301 (L)", "room": "36-909", "faculty": "K23EU", "type": "class" },
    { "time": "3:00-4:00", "subject": "Free", "room": "", "faculty": "", "type": "free" }
  ],
  "Wednesday": [
    { "time": "9:00-10:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "10:00-11:00", "subject": "INT252 (L)", "room": "34-506X", "faculty": "K23EU", "type": "class" },
    { "time": "11:00-12:00", "subject": "INT252 (L)", "room": "34-506X", "faculty": "K23EU", "type": "class" },
    { "time": "12:00-1:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "1:00-2:00", "subject": "PSY291 (L)", "room": "37-908", "faculty": "KO106", "type": "class" },
    { "time": "2:00-3:00", "subject": "Free", "room": "", "faculty": "", "type": "free" }
  ],
  "Thursday": [
    { "time": "9:00-10:00", "subject": "INT222 (L)", "room": "34-506X", "faculty": "K23EU", "type": "class" },
    { "time": "10:00-11:00", "subject": "INT222 (L)", "room": "34-506X", "faculty": "K23EU", "type": "class" },
    { "time": "11:00-12:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "12:00-1:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "1.00-2:00", "subject": "PSY291 (L)", "room": "37-908", "faculty": "KO106", "type": "class" },
    { "time": "2:00-3:00", "subject": "PEV301 (L)", "room": "34-603", "faculty": "K23EU", "type": "class" }
  ],
  "Friday": [
    { "time": "9:00-10:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "10:00-11:00", "subject": "INT252 (P)", "room": "34-603", "faculty": "K23EU", "type": "class" },
    { "time": "11:00-12:00", "subject": "INT252 (P)", "room": "34-603", "faculty": "K23EU", "type": "class" },
    { "time": "12:00-1:00", "subject": "Free", "room": "", "faculty": "", "type": "free" },
    { "time": "1:00-2:00", "subject": "PSY291 (L)", "room": "37-908", "faculty": "KO106", "type": "class" },
    { "time": "2:00-3:00", "subject": "Free", "room": "", "faculty": "", "type": "free" }
  ]
},
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const friends = Object.keys(timetable);

  // Normalize timetable: ensure every friend has the same number of slots per day
  // as the first friend (used as the reference for table rows). Missing slots
  // are filled with a harmless 'Free' placeholder so columns render consistently.
  if (friends.length > 0) {
    const reference = timetable[friends[0]];
    days.forEach(day => {
      const refSlots = (reference && reference[day]) ? reference[day].map(s => s.time) : [];
      friends.forEach(friend => {
        if (!timetable[friend]) timetable[friend] = {};
        if (!timetable[friend][day]) timetable[friend][day] = [];
        for (let i = 0; i < refSlots.length; i++) {
          if (!timetable[friend][day][i]) {
            timetable[friend][day][i] = {
              time: refSlots[i] || '',
              subject: 'Free',
              room: '',
              faculty: '',
              type: 'free'
            };
          }
        }
      });
    });
  }

  // Function to mark a slot as free/unavailable
  const toggleSlotAsFree = (friendName, day, timeSlot) => {
    const key = `${friendName}-${day}-${timeSlot}`;
    const wasMarked = markedFreeSlots[key];
    
    setMarkedFreeSlots(prev => {
      const newState = { ...prev };
      if (newState[key]) {
        delete newState[key];
      } else {
        newState[key] = true;
      }
      localStorage.setItem('markedFreeSlots', JSON.stringify(newState));
      return newState;
    });

    // Send notifications
    const action = wasMarked ? 'marked as available' : 'marked as unavailable';
    const notificationTitle = `${friendName} ${action} for ${timeSlot}`;
    const notificationBody = wasMarked 
      ? `🎉 ${friendName} is now available during ${timeSlot} on ${day}!`
      : `🚫 ${friendName} is now unavailable during ${timeSlot} on ${day}`;
    
    sendNotification(notificationTitle, notificationBody);
    
    // Send chat notification
    const chatMessage = wasMarked 
      ? `🎉 ${friendName} is now available during ${timeSlot} on ${day}!`
      : `🚫 ${friendName} marked themselves as unavailable during ${timeSlot} on ${day}`;
    sendChatNotification(chatMessage);
  };

  // Function to check if a slot is marked as free
  const isSlotMarkedAsFree = (friendName, day, timeSlot) => {
    const key = `${friendName}-${day}-${timeSlot}`;
    return markedFreeSlots[key] || false;
  };

  // Function to mark a class slot as cancelled/free
  const toggleClassAsCancelled = (friendName, day, timeSlot) => {
    const key = `${friendName}-${day}-${timeSlot}`;
    const wasCancelled = cancelledClassSlots[key];
    
    setCancelledClassSlots(prev => {
      const newState = { ...prev };
      if (newState[key]) {
        delete newState[key];
      } else {
        newState[key] = true;
      }
      localStorage.setItem('cancelledClassSlots', JSON.stringify(newState));
      return newState;
    });

    // Send notifications
    const action = wasCancelled ? 'class restored' : 'class cancelled';
    const notificationTitle = `${friendName}'s ${action} for ${timeSlot}`;
    const notificationBody = wasCancelled 
      ? `📚 ${friendName}'s class is back on during ${timeSlot} on ${day}`
      : `🎉 ${friendName}'s class was cancelled during ${timeSlot} on ${day} - they're free!`;
    
    sendNotification(notificationTitle, notificationBody);
    
    // Send chat notification
    const chatMessage = wasCancelled 
      ? `📚 ${friendName}'s class is back on during ${timeSlot} on ${day}`
      : `🎉 ${friendName}'s class was cancelled during ${timeSlot} on ${day} - they're free!`;
    sendChatNotification(chatMessage);
  };

  // Function to check if a class slot is marked as cancelled
  const isClassSlotCancelled = (friendName, day, timeSlot) => {
    const key = `${friendName}-${day}-${timeSlot}`;
    return cancelledClassSlots[key] || false;
  };

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
        // Check if slot is marked as free by user
        const isMarkedFree = isSlotMarkedAsFree(friendName, currentDayName, slot.time);
        // Check if class is cancelled
        const isClassCancelled = isClassSlotCancelled(friendName, currentDayName, slot.time);
        
        return {
          available: (slot.type === 'free' || slot.type === 'break' || isClassCancelled) && !isMarkedFree,
          status: isMarkedFree ? 'Marked as Unavailable' : isClassCancelled ? 'Class Cancelled - Free!' : slot.subject,
          type: isMarkedFree ? 'marked-unavailable' : isClassCancelled ? 'cancelled-class' : slot.type
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
        const isMarkedUnavailable = isSlotMarkedAsFree(friend, day, timeSlot);
        const isClassCancelled = isClassSlotCancelled(friend, day, timeSlot);
        return slot && (slot.type === 'free' || slot.type === 'break' || isClassCancelled) && !isMarkedUnavailable;
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
    <div className="min-h-screen px-2 py-4 md:px-4 md:py-8" style={{ background: theme.background }}>
      {/* Theme Switcher */}
      <ThemeSwitcher currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      
      {/* Smart Notifications */}
      <SmartNotifications 
        currentUser={currentUser}
        friends={Object.keys(timetable)}
        timetable={timetable}
        currentTime={currentTime}
      />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="rounded-3xl md:rounded-[2rem] shadow-2xl p-6 md:p-10 border-4 border-yellow-300 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden">
          {/* Cartoon background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full opacity-20 transform translate-x-8 -translate-y-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-300 rounded-full opacity-20 transform -translate-x-4 translate-y-4"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-300 rounded-full opacity-30"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 transform hover:scale-105 transition-transform duration-300">
                👫 Besties Schedule 🎉
              </h1>
              <p className="text-lg md:text-2xl font-bold text-purple-800 flex items-center gap-2">
                <span className="text-2xl md:text-3xl">🌈</span>
                Let's sync our awesome schedules together! 
                <span className="text-2xl md:text-3xl">✨</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-4">
                <div className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-2xl md:rounded-3xl font-black shadow-2xl text-base md:text-lg transform hover:scale-110 transition-all duration-300 border-4 border-white">
                  <span className="mr-2 text-2xl md:text-3xl">{friendInfo[currentUser]?.emoji}</span>
                  Hey {currentUser}! 🎊
                </div>
                
                {/* Message Icon with Badge */}
                <button
                  onClick={scrollToChat}
                  className="relative px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl md:rounded-3xl font-black shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white"
                  title="Chat with your besties!"
                >
                  <span className="text-2xl md:text-3xl">💬</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-black rounded-full min-w-[28px] h-7 flex items-center justify-center px-2 border-4 border-white shadow-xl animate-bounce">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl md:rounded-3xl font-black transition-all shadow-2xl text-base md:text-lg w-full sm:w-auto border-4 border-white hover:scale-105 active:scale-95"
              >
                👋 See ya later!
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Status Banner */}
      {notificationPermission === 'granted' && notificationsEnabled && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-3xl md:rounded-[2rem] shadow-2xl p-4 md:p-6 border-4 border-yellow-300 relative overflow-hidden">
            {/* Cartoon elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300 rounded-full opacity-30 transform translate-x-4 -translate-y-4"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-pink-300 rounded-full opacity-30 transform -translate-x-2 translate-y-2"></div>
            
            <div className="flex items-center justify-center gap-3 md:gap-4 relative z-10">
              <span className="text-3xl md:text-4xl animate-bounce">🔔</span>
              <p className="text-white font-black text-base md:text-xl text-center">
                🎉 Yay! We'll ping you when your besties change their plans! 🎉
              </p>
              <span className="text-3xl md:text-4xl animate-bounce">📱</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Clock */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-3xl md:rounded-[2rem] shadow-2xl p-6 md:p-8 border-4 border-yellow-300 relative overflow-hidden">
          {/* Cartoon background elements */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-300 rounded-full opacity-20 transform -translate-x-4 -translate-y-4"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-300 rounded-full opacity-20 transform translate-x-8 translate-y-8"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-green-300 rounded-full opacity-30"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center md:text-left">
              <p className="text-white text-lg md:text-2xl font-black mb-2 md:mb-3 flex items-center gap-2">
                <span className="text-2xl md:text-3xl">🕐</span>
                What time is it? It's...
              </p>
              <p className="text-white text-4xl md:text-6xl font-black tracking-wider transform hover:scale-105 transition-transform duration-300">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-yellow-100 mt-2 md:mt-3 text-base md:text-xl font-bold flex items-center gap-2">
                <span className="text-xl md:text-2xl">📅</span>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="text-8xl md:text-9xl animate-pulse">⏰</div>
          </div>
        </div>
      </div>

      {/* Current Availability */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="rounded-3xl md:rounded-[2rem] shadow-2xl p-6 md:p-10 border-4 border-pink-300 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative overflow-hidden">
          {/* Cartoon background elements */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-yellow-300 rounded-full opacity-20 transform translate-x-6 -translate-y-6"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-green-300 rounded-full opacity-20 transform -translate-x-3 translate-y-3"></div>
          <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-pink-300 rounded-full opacity-30"></div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 flex items-center gap-3 md:gap-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 relative z-10">
            <span className="text-4xl md:text-6xl animate-bounce">👥</span>
            Where are my besties right now? 🤔
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
            {friends.map(friend => {
              const status = isAvailableNow(friend);
              return (
                <div
                  key={friend}
                  className={`p-6 md:p-8 rounded-2xl md:rounded-3xl border-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 ${
                    status.available 
                      ? 'bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 border-green-400' 
                      : 'bg-gradient-to-br from-red-200 via-orange-200 to-pink-200 border-red-400'
                  } relative overflow-hidden`}
                >
                  {/* Cartoon background elements */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-300 rounded-full opacity-20 transform translate-x-4 -translate-y-4"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-pink-300 rounded-full opacity-20 transform -translate-x-2 translate-y-2"></div>
                  
                  <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-800 flex items-center gap-3">
                      <span className="text-3xl md:text-4xl animate-pulse">{friendInfo[friend].emoji}</span>
                      {friend}
                    </h3>
                    <span className={`px-4 py-2 md:px-6 md:py-3 rounded-2xl text-sm md:text-base font-black border-2 border-white shadow-lg ${
                      status.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {status.available ? '🎉 FREE!' : '😴 BUSY'}
                    </span>
                  </div>
                  <p className="text-gray-800 font-bold text-base md:text-lg mb-3">
                    <span className="text-lg md:text-xl">📝</span> <strong>Right now:</strong> {status.status}
                  </p>
                  {status.available && (
                    <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-green-300 to-emerald-300 rounded-2xl border-4 border-green-500 shadow-lg">
                      <p className="text-green-900 font-black text-sm md:text-base flex items-center gap-2">
                        <span className="text-lg md:text-xl animate-bounce">🎉</span>
                        Perfect time to hang out with {friend}! Let's chat! 💬
                      </p>
                    </div>
                  )}
                  {status.type === 'marked-unavailable' && (
                    <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-red-300 to-pink-300 rounded-2xl border-4 border-red-500 shadow-lg">
                      <p className="text-red-900 font-black text-sm md:text-base flex items-center gap-2">
                        <span className="text-lg md:text-xl">😴</span>
                        {friend} is taking a break right now - maybe later! 
                      </p>
                    </div>
                  )}
                  {status.type === 'cancelled-class' && (
                    <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-2xl border-4 border-yellow-500 shadow-lg">
                      <p className="text-yellow-900 font-black text-sm md:text-base flex items-center gap-2">
                        <span className="text-lg md:text-xl animate-bounce">🎉</span>
                        Awesome! {friend}'s class got cancelled - they're free to hang out! 
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
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl md:rounded-[2rem] shadow-2xl p-6 md:p-8 border-4 border-yellow-300 relative overflow-hidden">
                {/* Cartoon background elements */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-pink-300 rounded-full opacity-20 transform -translate-x-4 -translate-y-4"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-green-300 rounded-full opacity-20 transform translate-x-6 translate-y-6"></div>
                <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-blue-300 rounded-full opacity-30"></div>
                
                <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-6 text-white flex items-center gap-3 md:gap-4 relative z-10">
                  <span className="text-3xl md:text-5xl animate-bounce">🎯</span>
                  When can we all hang out? 🤔
                </h2>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 bg-white/30 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 border-4 border-white/50 shadow-xl relative z-10">
                  <div className="flex-1">
                    <p className="text-white text-xl md:text-3xl font-black mb-2">
                      {nextFreeTime.day} at {nextFreeTime.time}
                    </p>
                    <p className="text-yellow-100 text-base md:text-lg font-bold flex items-center gap-2">
                      <span className="text-lg md:text-xl animate-bounce">🎉</span>
                      Everyone's free! Let's plan something awesome! 🚀
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {nextFreeTime.friends.map(friend => (
                      <div key={friend} className="px-4 py-2 md:px-6 md:py-3 bg-white/40 backdrop-blur-sm rounded-2xl border-4 border-white/60 text-white font-black text-sm md:text-base shadow-lg transform hover:scale-105 transition-transform">
                        <span className="text-lg md:text-xl">{friendInfo[friend].emoji}</span> {friend}
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
        <div className="rounded-3xl md:rounded-[2rem] shadow-2xl p-6 md:p-8 border-4 border-blue-300 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 relative overflow-hidden">
          {/* Cartoon background elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-300 rounded-full opacity-20 transform translate-x-4 -translate-y-4"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-green-300 rounded-full opacity-20 transform -translate-x-3 translate-y-3"></div>
          <div className="absolute top-1/2 left-1/3 w-14 h-14 bg-pink-300 rounded-full opacity-30"></div>
          
          <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-6 flex items-center gap-3 md:gap-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 relative z-10">
            <span className="text-3xl md:text-5xl animate-bounce">📅</span>
            Pick a day to check out! 🗓️
          </h2>
          <div className="flex flex-wrap gap-3 md:gap-4 relative z-10">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl font-black transition-all text-base md:text-lg border-4 shadow-xl transform hover:scale-110 active:scale-95 ${
                  selectedDay === day
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white border-white shadow-2xl scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mark Slots as Free Instructions */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 border" 
          style={{ 
            background: theme.cardBackground,
            borderColor: theme.borderColor,
            backdropFilter: theme.glassEffect
          }}>
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 flex items-center gap-2"
            style={{ color: theme.primaryText }}>
            <span className="text-2xl md:text-3xl">⚙️</span>
            Mark Your Availability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 md:p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
              <h3 className="font-bold text-blue-800 text-sm md:text-base mb-2 flex items-center gap-2">
                <span>✅</span> Mark Free Slots
              </h3>
              <p className="text-blue-700 text-xs md:text-sm">
                Click ✅ next to your free slots to mark them as unavailable when you're busy.
              </p>
            </div>
            <div className="p-3 md:p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <h3 className="font-bold text-yellow-800 text-sm md:text-base mb-2 flex items-center gap-2">
                <span>📚</span> Cancel Classes
              </h3>
              <p className="text-yellow-700 text-xs md:text-sm">
                Click ❌ next to your class slots when classes get cancelled to mark them as free time.
              </p>
            </div>
            <div className="p-3 md:p-4 bg-green-50 border-2 border-green-300 rounded-xl">
              <h3 className="font-bold text-green-800 text-sm md:text-base mb-2 flex items-center gap-2">
                <span>🔄</span> Toggle Status
              </h3>
              <p className="text-green-700 text-xs md:text-sm">
                Click buttons to toggle between available/unavailable or active/cancelled. Changes save automatically!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 border" 
          style={{ 
            background: theme.cardBackground,
            borderColor: theme.borderColor,
            backdropFilter: theme.glassEffect
          }}>
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 flex items-center gap-2"
            style={{ color: theme.primaryText }}>
            <span className="text-2xl md:text-3xl">🔔</span>
            Notification Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 md:p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
              <h3 className="font-bold text-blue-800 text-sm md:text-base mb-2 flex items-center gap-2">
                <span>📱</span> Phone Notifications
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-blue-700 text-xs md:text-sm">
                  Get notified when friends change their availability
                </p>
                <button
                  onClick={() => {
                    setNotificationsEnabled(!notificationsEnabled);
                    localStorage.setItem('notificationsEnabled', JSON.stringify(!notificationsEnabled));
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    notificationsEnabled 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                >
                  {notificationsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            <div className="p-3 md:p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
              <h3 className="font-bold text-purple-800 text-sm md:text-base mb-2 flex items-center gap-2">
                <span>💬</span> Chat Notifications
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-purple-700 text-xs md:text-sm">
                  Changes are automatically posted in group chat
                </p>
                <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-bold">
                  AUTO
                </span>
              </div>
            </div>
          </div>
          {notificationPermission === 'denied' && (
            <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="text-red-800 font-bold text-sm flex items-center gap-2">
                <span>⚠️</span> Notifications blocked by browser
              </p>
              <p className="text-red-700 text-xs mt-1">
                Please enable notifications in your browser settings to get updates about timetable changes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Common Free Slots Toggle */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <div className="rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 border" 
          style={{ 
            background: theme.cardBackground,
            borderColor: theme.borderColor,
            backdropFilter: theme.glassEffect
          }}>
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
        <div className="rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border cartoon-timetable-wrapper" 
          style={{ 
            background: theme.cardBackground,
            borderColor: theme.borderColor,
            backdropFilter: theme.glassEffect
          }}>
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3"
            style={{ color: theme.primaryText }}>
            <span className="text-2xl md:text-4xl">📋</span>
            {selectedDay}'s Schedule
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse cartoon-timetable">
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
                      const slotArray = timetable[friend] && timetable[friend][selectedDay];
                      const slot = slotArray ? slotArray[index] : undefined;

                      // If slot data is missing for this friend/time, render a placeholder cell
                      if (!slot) {
                        return (
                          <td
                            key={friend}
                            className={`border-2 md:border-4 border-purple-200 p-2 md:p-3 text-xs md:text-base font-medium bg-gray-50 text-gray-400`}
                          >
                            <span className="emoji-sticker">{friendInfo[friend].emoji}</span>
                            <div className="flex items-center justify-center">
                              <span className="italic">No schedule</span>
                            </div>
                          </td>
                        );
                      }

                      const isMarkedUnavailable = isSlotMarkedAsFree(friend, selectedDay, slot.time);
                      const isClassCancelled = isClassSlotCancelled(friend, selectedDay, slot.time);
                      const isCurrentUser = friend === currentUser;
                      
                      return (
                        <td
                          key={friend}
                          className={`border-2 md:border-4 border-purple-200 p-2 md:p-3 text-xs md:text-base font-medium ${
                            isMarkedUnavailable
                              ? 'bg-red-100 text-red-800'
                              : isClassCancelled
                              ? 'bg-yellow-100 text-yellow-800'
                              : slot.type === 'class'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          <span className="emoji-sticker">{friendInfo[friend].emoji}</span>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className={isMarkedUnavailable ? 'line-through opacity-70' : ''}>
                                {isMarkedUnavailable ? 'Unavailable' : isClassCancelled ? 'Class Cancelled' : slot.subject}
                              </span>
                              {isCurrentUser && (
                                <>
                                  {(slot.type === 'free' || slot.type === 'break') && (
                                    <button
                                      onClick={() => toggleSlotAsFree(friend, selectedDay, slot.time)}
                                      className={`ml-2 px-2 py-1 text-xs rounded-full font-bold transition-all ${
                                        isMarkedUnavailable
                                          ? 'bg-red-500 text-white hover:bg-red-600'
                                          : 'bg-green-500 text-white hover:bg-green-600'
                                      }`}
                                      title={isMarkedUnavailable ? 'Mark as Available' : 'Mark as Unavailable'}
                                    >
                                      {isMarkedUnavailable ? '❌' : '✅'}
                                    </button>
                                  )}
                                  {slot.type === 'class' && (
                                    <button
                                      onClick={() => toggleClassAsCancelled(friend, selectedDay, slot.time)}
                                      className={`ml-2 px-2 py-1 text-xs rounded-full font-bold transition-all ${
                                        isClassCancelled
                                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                          : 'bg-blue-500 text-white hover:bg-blue-600'
                                      }`}
                                      title={isClassCancelled ? 'Mark Class as Active' : 'Mark Class as Cancelled'}
                                    >
                                      {isClassCancelled ? '📚' : '❌'}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                            {/* Show room and optional faculty below the subject when available */}
                            {slot.room && (
                              <div className="text-xs text-gray-600">
                                <strong>Room:</strong> {slot.room}{slot.faculty ? ` • ${slot.faculty}` : ''}
                              </div>
                            )}

                            {isMarkedUnavailable && (
                              <div className="text-xs text-red-600 font-bold">
                                🚫 Marked as unavailable
                              </div>
                            )}
                            {isClassCancelled && (
                              <div className="text-xs text-yellow-600 font-bold">
                                🎉 Class cancelled - you're free!
                              </div>
                            )}
                          </div>
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
        <div className="rounded-2xl md:rounded-3xl shadow-2xl border overflow-hidden cartoon-chat-wrapper" 
          style={{ 
            background: theme.cardBackground,
            borderColor: theme.borderColor,
            backdropFilter: theme.glassEffect
          }}>
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
              <button
                onClick={() => setShowChat(!showChat)}
                className="px-4 py-2 md:px-6 md:py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-colors border-2 border-white/30 text-sm md:text-base w-full md:w-auto"
              >
                {showChat ? '▼ Hide Chat' : '▶ Show Chat'}
              </button>
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
                <>
                  {/* Quick Actions */}
                  <QuickActions channel={channel} currentUser={currentUser} />
                  
                  <div 
                    className="rounded-xl md:rounded-2xl overflow-hidden mt-4 relative"
                    style={{ 
                      height: '600px', 
                      maxHeight: '70vh',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                      boxShadow: '0 20px 60px rgba(168, 85, 247, 0.2), 0 10px 30px rgba(236, 72, 153, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                      border: '2px solid rgba(168, 85, 247, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
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
                </>
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
