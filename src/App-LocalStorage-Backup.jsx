import React, { useState, useEffect } from 'react';

const App = () => {
  // Login states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showCommonSlots, setShowCommonSlots] = useState(false);
  
  // Messaging states
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Function to scroll to chat section
  const scrollToChat = () => {
    const chatSection = document.getElementById('chatSection');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowChat(true);
  };

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
    }
  }, []);

  // Update time every second for live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every 1 second instead of 60000ms (1 minute)
    return () => clearInterval(timer);
  }, []);

  // Load all messages from shared storage (both sent and received)
  useEffect(() => {
    if (currentUser) {
      // Load from shared message storage
      const allMessagesKey = 'friendsMessages_shared';
      const storedMessages = localStorage.getItem(allMessagesKey);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
      
      // Periodically check for new messages from other users
      const interval = setInterval(() => {
        const storedMessages = localStorage.getItem(allMessagesKey);
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          // Only update if messages changed to avoid unnecessary re-renders
          if (JSON.stringify(parsedMessages) !== JSON.stringify(messages)) {
            setMessages(parsedMessages);
            
            // Auto scroll to bottom when new messages arrive
            setTimeout(() => {
              const chatBox = document.getElementById('chatBox');
              if (chatBox) {
                chatBox.scrollTop = chatBox.scrollHeight;
              }
            }, 100);
          }
        }
      }, 1000); // Check for new messages every 1 second for faster updates
      
      return () => clearInterval(interval);
    }
  }, [currentUser, messages]);

  // Login function
  const handleLogin = (e) => {
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
    } else {
      setLoginError('Invalid username or password! 🚫');
    }
  };

  // Logout function
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setMessages([]);
      localStorage.removeItem('loggedInUser');
    }
  };

  // Send message function - saves to shared storage so everyone can see
  const sendMessage = () => {
    if (messageInput.trim() && currentUser) {
      const newMessage = {
        id: Date.now(),
        text: messageInput,
        sender: currentUser,
        timestamp: new Date().toISOString(),
        emoji: friendInfo[currentUser]?.emoji || '😊',
        read: false
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Save to shared storage so all users can see - PERMANENTLY
      const allMessagesKey = 'friendsMessages_shared';
      localStorage.setItem(allMessagesKey, JSON.stringify(updatedMessages));
      setMessageInput('');
      
      // Auto scroll to bottom
      setTimeout(() => {
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
          chatBox.scrollTop = chatBox.scrollHeight;
        }
      }, 100);
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
    const currentDayName = days[now.getDay() - 1]; // Monday = 1, so subtract 1

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
    
    // Check today's remaining slots
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
    
    // Check next days
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
        {/* Simple Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full"></div>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-200">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">🔐</div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-3">
                Welcome Back!
              </h1>
              <p className="text-gray-700 text-xl">Login to view your friends' timetables</p>
            </div>

            {/* Login Form */}
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
                <div className="p-5 bg-red-100 border-2 border-red-300 rounded-2xl">
                  <p className="text-red-800 font-bold text-center text-lg">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full px-8 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white rounded-2xl font-bold text-xl hover:opacity-90 transition-opacity shadow-xl"
              >
                Login 🚀
              </button>
            </form>

            {/* Credentials Info */}
            <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-300 rounded-2xl">
              <p className="text-lg text-blue-900 font-bold mb-4 flex items-center gap-3">
                ℹ️ Login Credentials:
              </p>
              <div className="space-y-3 text-base text-blue-800">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200">
                  <span className="text-2xl">😊</span>
                  <span className="font-bold">Ashutosh:</span>
                  <code className="bg-blue-100 px-3 py-2 rounded-lg font-bold text-blue-900">ashutosh / ashu123</code>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200">
                  <span className="text-2xl">🤩</span>
                  <span className="font-bold">Dhruv:</span>
                  <code className="bg-blue-100 px-3 py-2 rounded-lg font-bold text-blue-900">dhruv / dhruv123</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-3 px-3 md:py-8 md:px-4">
      {/* Simple background - no heavy animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header with Message Icon - Mobile Optimized */}
        <div className="text-center mb-6 md:mb-12">
          {/* User Info and Actions */}
          <div className="flex justify-between items-center mb-4 md:mb-6 gap-2">
            {/* Message Icon - Click to scroll to chat */}
            <button
              onClick={scrollToChat}
              className="relative bg-white rounded-xl md:rounded-2xl p-2 md:p-4 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-xl md:text-3xl">💬</div>
              {messages.length > 0 && (
                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-bold">
                  {messages.length}
                </div>
              )}
            </button>

            {/* User Info - Compact on Mobile */}
            <div className="bg-white rounded-xl md:rounded-2xl px-3 py-2 md:px-6 md:py-4 shadow-lg border border-purple-200 flex items-center gap-2 md:gap-4 flex-1">
              <div className="flex items-center gap-2 md:gap-3 flex-1">
                <div className="relative">
                  <span className="text-lg md:text-3xl">{friendInfo[currentUser]?.emoji || '👤'}</span>
                  <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="hidden sm:block">
                  <span className="font-bold text-gray-800 text-sm md:text-lg">Welcome, {currentUser}!</span>
                  <div className="text-xs md:text-sm text-gray-600">Online Now</div>
                </div>
                <div className="block sm:hidden">
                  <span className="font-bold text-gray-800 text-sm">{currentUser}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 md:px-5 md:py-2 bg-red-500 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-red-600 transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Logout 🚪</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          </div>

          <div className="inline-block relative">
            <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-2 md:mb-4">
              <span className="hidden md:inline">👫 Friends Timetable 👫</span>
              <span className="md:hidden">👫 Timetable</span>
            </h1>
          </div>
          <p className="text-gray-700 text-sm md:text-2xl mb-4 md:mb-8 font-bold px-2">
            <span className="hidden md:inline">Discover when your friends are free to hang out! 🎉</span>
            <span className="md:hidden">Find free time with friends! 🎉</span>
          </p>
          
          {/* Time and quick info section - Mobile Optimized */}
          <div className="flex flex-col items-center gap-4 md:gap-8">
            <div className="inline-flex items-center gap-2 md:gap-4 bg-white rounded-full px-4 py-2 md:px-8 md:py-4 shadow-lg border border-purple-200">
              <span className="text-xl md:text-3xl">🕐</span>
              <div className="text-xl md:text-3xl font-bold text-gray-800">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            {/* Next hangout opportunity - Mobile Optimized */}
            {(() => {
              const nextFree = getNextCommonFreeTime();
              return nextFree ? (
                <div className="bg-white border border-green-300 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg max-w-lg w-full mx-2">
                  <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                    <span className="text-2xl md:text-4xl">🎯</span>
                    <h3 className="text-base md:text-2xl font-bold text-green-800">Next Hangout</h3>
                  </div>
                  <p className="text-green-700 font-bold text-sm md:text-xl mb-1 md:mb-2">
                    {nextFree.day} at {nextFree.time}
                  </p>
                  <p className="text-xs md:text-base text-green-600">
                    {nextFree.friends.length} friend(s): {nextFree.friends.join(', ')}
                  </p>
                </div>
              ) : null;
            })()}
            
            {/* Quick stats - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-lg w-full px-2">
              <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-2xl md:text-4xl mb-1 md:mb-2">👥</div>
                  <div className="text-xl md:text-2xl font-bold text-blue-800">{friends.length}</div>
                  <div className="text-xs md:text-base text-blue-600 font-semibold">Friends</div>
                </div>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-2xl md:text-4xl mb-1 md:mb-2">📅</div>
                  <div className="text-xl md:text-2xl font-bold text-purple-800">{commonSlots.length}</div>
                  <div className="text-xs md:text-base text-purple-600 font-semibold">Free Slots</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Who's Available Right Now Section - Mobile Optimized */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 mb-4 md:mb-8 border border-purple-200">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-800 mb-4 md:mb-8 flex items-center gap-2 md:gap-4">
            <span className="text-2xl md:text-5xl">🌟</span>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              <span className="hidden md:inline">Available Right Now</span>
              <span className="md:hidden">Available Now</span>
            </span>
          </h2>
          
          {/* Current status summary - Mobile Optimized */}
          <div className="mb-4 md:mb-8 p-4 md:p-8 bg-blue-50 rounded-2xl md:rounded-3xl border border-blue-200 shadow-lg">
            <div className="flex items-center justify-center gap-3 md:gap-6">
              <span className="text-2xl md:text-4xl">📊</span>
              <div className="text-center">
                <span className="text-base md:text-2xl font-bold text-blue-800 block">
                  <span className="hidden md:inline">Current Status Overview</span>
                  <span className="md:hidden">Status</span>
                </span>
                <span className="text-xs md:text-lg font-semibold text-indigo-700">
                  {friends.filter(friend => isAvailableNow(friend).available).length} of {friends.length} friends free
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {friends.map((friend) => {
              const availability = isAvailableNow(friend);
              return (
                <div
                  key={friend}
                  className={`p-4 md:p-8 rounded-2xl md:rounded-3xl border transition-all duration-300 hover:shadow-xl ${
                    availability.available
                      ? 'bg-white border-green-300 shadow-lg'
                      : 'bg-white border-gray-300 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 md:mb-6">
                    <h3 className="text-lg md:text-3xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
                      <span className="text-xl md:text-3xl">{friendInfo[friend]?.emoji || '👤'}</span>
                      {friend}
                    </h3>
                    <div className="text-2xl md:text-4xl">
                      {availability.available ? '🎉' : '😴'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4 relative z-10 flex-wrap">
                    <div className="flex items-center gap-2 md:gap-3">
                      <span
                        className={`w-4 h-4 md:w-6 md:h-6 rounded-full ${
                          availability.available 
                            ? 'bg-green-500 animate-pulse shadow-lg shadow-green-300' 
                            : 'bg-red-500'
                        }`}
                      ></span>
                      <span className={`text-sm md:text-lg font-black ${
                        availability.available ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {availability.available ? 'FREE!' : 'BUSY'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-xs md:text-sm text-gray-500">•</span>
                      <span className="text-xs md:text-sm text-gray-600 font-bold">{friendInfo[friend]?.mood || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm md:text-base font-bold text-gray-700 mb-2 md:mb-3">
                      {availability.status}
                    </p>
                    {availability.type === 'break' && (
                      <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-yellow-100 text-yellow-800 text-xs md:text-sm font-bold rounded-full border border-yellow-300">
                        ☕ On Break
                      </span>
                    )}
                    <div className="flex flex-wrap gap-2 md:gap-3 mt-2 md:mt-4">
                      {availability.available ? (
                        <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-green-100 text-green-800 text-xs md:text-sm font-bold rounded-full border border-green-300">
                          🎯 Ready!
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-blue-100 text-blue-800 text-xs md:text-sm font-bold rounded-full border border-blue-300">
                          📚 In Class
                        </span>
                      )}
                      <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-purple-100 text-purple-800 text-xs md:text-sm font-bold rounded-full border border-purple-300">
                        {friendInfo[friend]?.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Common Free Times Section - Mobile Optimized */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 mb-4 md:mb-8 border-2 border-green-200">
          <h2 className="text-lg md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2 md:gap-3 flex-wrap">
            <span className="text-xl md:text-3xl">🎯</span>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              <span className="hidden md:inline">Common Free Times - {selectedDay}</span>
              <span className="md:hidden">Free Times - {selectedDay}</span>
            </span>
            <span className="text-xl md:text-3xl hidden md:inline">🎯</span>
          </h2>
          
          {commonSlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {commonSlots.map((slot, index) => (
                <div key={index} className="bg-green-50 border-2 border-green-200 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <span className="text-lg md:text-2xl">⏰</span>
                    <h3 className="text-sm md:text-lg font-bold text-green-800">{slot.time}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs md:text-sm font-semibold text-green-700">
                      {slot.count} friend(s):
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {slot.friends.map((friend) => (
                      <span key={friend} className="px-2 py-1 md:px-3 md:py-1 bg-green-100 text-green-800 text-xs md:text-sm font-bold rounded-full border border-green-300">
                        {friendInfo[friend]?.emoji || '👤'} {friend}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8 relative z-10">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">😔</div>
              <p className="text-gray-600 text-sm md:text-lg font-medium">
                No common free times for {selectedDay}
              </p>
              <p className="text-gray-500 text-xs md:text-sm mt-2">
                Try a different day!
              </p>
            </div>
          )}
        </div>

        {/* Day Selector - Mobile Optimized */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 mb-4 md:mb-8 border-2 border-purple-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 -translate-y-12 -translate-x-12"></div>
          <h2 className="text-lg md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2 md:gap-3 relative z-10">
            <span className="text-xl md:text-3xl">📅</span>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              <span className="hidden md:inline">Choose Your Day</span>
              <span className="md:hidden">Select Day</span>
            </span>
            <span className="text-xl md:text-3xl hidden md:inline">📅</span>
          </h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4 relative z-10">
            {days.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`w-full sm:w-auto justify-center px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden ${
                  selectedDay === day
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white shadow-xl shadow-purple-200'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-base md:text-xl">
                    {selectedDay === day ? '✨' : ['🌅', '🌞', '🌤️', '🌦️', '🌅'][index]}
                  </span>
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 3)}</span>
                  <span className="text-base md:text-xl hidden sm:inline">
                    {selectedDay === day ? '✨' : ['🌅', '🌞', '🌤️', '🌦️', '🌅'][index]}
                  </span>
                </div>
                {selectedDay === day && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl md:rounded-2xl animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Timetable Cards - Mobile Optimized */}
        <div className="md:hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-3 mb-4 border-2 border-purple-200">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Timetable - {selectedDay}
            </span>
          </h2>
          <div className="space-y-2.5">
            {timetable[friends[0]][selectedDay].map((timeSlot, index) => (
              <div key={index} className="p-3 rounded-xl border-2 border-purple-100 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="text-base">⏰</span>
                    {timeSlot.time}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {friends.map((friend) => {
                    const slot = timetable[friend][selectedDay][index];
                    const badgeClasses =
                      slot.type === 'free'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : slot.type === 'break'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300';
                    const icon = slot.type === 'free' ? '🎉' : slot.type === 'break' ? '☕' : '📚';
                    return (
                      <div key={friend} className={`px-2.5 py-1.5 rounded-lg border-2 ${badgeClasses} text-xs font-bold flex items-center gap-1.5`}> 
                        <span>{icon}</span>
                        <span className="font-bold">{friend}:</span>
                        <span>{slot.subject}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Timetable (Desktop/Tablet) */}
        <div className="hidden md:block bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 -translate-y-14 -translate-x-14"></div>
          <h2 className="text-4xl font-bold text-gray-800 mb-8 flex items-center gap-4 relative z-10">
            <span className="text-4xl animate-bounce">📅</span>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Full Timetable - {selectedDay}
            </span>
            <span className="text-4xl animate-bounce delay-300">📅</span>
          </h2>
          <div className="overflow-x-auto relative z-10">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100">
                  <th className="px-6 py-6 text-left text-gray-800 font-bold text-lg rounded-tl-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⏰</span>
                      Time
                    </div>
                  </th>
                  {friends.map((friend) => (
                    <th key={friend} className="px-6 py-6 text-center text-gray-800 font-bold text-lg">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">👤</span>
                        {friend}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable[friends[0]][selectedDay].map((_, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
                    <td className="px-6 py-6 font-bold text-gray-700 text-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🕐</span>
                        {timetable[friends[0]][selectedDay][index].time}
                      </div>
                    </td>
                    {friends.map((friend) => {
                      const slot = timetable[friend][selectedDay][index];
                      return (
                        <td key={friend} className="px-6 py-6">
                          <div
                            className={`px-4 py-4 rounded-2xl text-center font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden ${
                              slot.type === 'free'
                                ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 shadow-md shadow-green-100'
                                : slot.type === 'break'
                                ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-800 border-2 border-yellow-300 shadow-md shadow-yellow-100'
                                : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-300 shadow-md shadow-blue-100'
                            }`}
                          >
                            {/* Decorative element */}
                            <div className={`absolute top-0 right-0 w-8 h-8 rounded-full opacity-20 ${
                              slot.type === 'free' ? 'bg-green-300' : 
                              slot.type === 'break' ? 'bg-yellow-300' : 'bg-blue-300'
                            } -translate-y-4 translate-x-4`}></div>
                            
                            <div className="relative z-10 flex items-center justify-center gap-2">
                              <span className="text-lg">
                                {slot.type === 'free' ? '🎉' : 
                                 slot.type === 'break' ? '☕' : '📚'}
                              </span>
                              <span className="text-sm">
                                {slot.subject}
                              </span>
                            </div>
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

        {/* Legend - Mobile Optimized */}
        <div className="mt-6 md:mt-12 flex justify-center gap-3 md:gap-8 flex-wrap px-2">
          <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg md:rounded-xl flex items-center justify-center">
              <span className="text-sm md:text-lg">🎉</span>
            </div>
            <span className="text-gray-700 font-bold text-xs md:text-lg">Free Time</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-lg border-2 border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg md:rounded-xl flex items-center justify-center">
              <span className="text-sm md:text-lg">☕</span>
            </div>
            <span className="text-gray-700 font-bold text-xs md:text-lg">Break</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-lg md:rounded-xl flex items-center justify-center">
              <span className="text-sm md:text-lg">📚</span>
            </div>
            <span className="text-gray-700 font-bold text-xs md:text-lg">Class</span>
          </div>
        </div>

        {/* Chat Section - Mobile Optimized */}
        <div id="chatSection" className="mt-6 md:mt-12 bg-white rounded-2xl md:rounded-3xl shadow-xl border-2 border-purple-300 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 flex-1">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40">
                  <span className="text-base md:text-2xl">💬</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-base md:text-3xl font-bold text-white flex items-center gap-1 md:gap-2 flex-wrap">
                    <span className="hidden sm:inline">Friends Chat</span>
                    <span className="sm:hidden">Chat</span>
                    <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/20 rounded-full text-xs md:text-sm border border-white/30">
                      {messages.length}
                    </span>
                  </h2>
                  <p className="text-purple-100 mt-0.5 md:mt-1 text-xs md:text-base hidden sm:block">Stay connected with your squad! 🎉</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(!showChat)}
                className="px-3 py-2 md:px-6 md:py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg md:rounded-xl font-bold transition-colors border-2 border-white/30 text-xs md:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">{showChat ? '▼ Hide' : '▶ Show'}</span>
                <span className="sm:hidden">{showChat ? '▼' : '▶'}</span>
              </button>
            </div>
          </div>

          {showChat && (
            <div className="p-3 md:p-6">
              {/* Current User Info - Mobile Optimized */}
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl md:rounded-2xl border-2 border-purple-200">
                <p className="text-xs md:text-sm font-bold text-gray-700 mb-2">Group Chat:</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
                  <div className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg md:rounded-xl font-bold shadow-lg text-sm md:text-base">
                    <span className="mr-1 md:mr-2">{friendInfo[currentUser]?.emoji}</span>
                    <span className="hidden sm:inline">Chatting as: </span>
                    {currentUser}
                  </div>
                  <span className="text-xs md:text-sm text-gray-600">👥 Everyone can see!</span>
                </div>
              </div>

              {/* Enhanced Messages Container - Mobile Optimized */}
              <div 
                id="chatBox"
                className="h-64 md:h-96 overflow-y-auto mb-3 md:mb-4 p-3 md:p-5 bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-indigo-50/30 rounded-xl md:rounded-2xl border-2 border-purple-200 space-y-2 md:space-y-4 shadow-inner relative"
                style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)'
                }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="relative">
                      <div className="text-4xl md:text-7xl mb-2 md:mb-4 animate-bounce">💬</div>
                      <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-purple-500 rounded-full animate-ping"></div>
                    </div>
                    <p className="text-gray-500 text-sm md:text-xl font-bold">No messages yet</p>
                    <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2 font-medium">Start the conversation! 🎉</p>
                    <div className="mt-2 md:mt-4 px-3 py-1.5 md:px-4 md:py-2 bg-purple-100 text-purple-700 rounded-lg text-xs md:text-sm font-semibold">
                      Messages saved permanently 🔒
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-md ${
                          msg.sender === currentUser
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl md:rounded-2xl rounded-br-sm shadow-lg'
                            : 'bg-white text-gray-800 rounded-xl md:rounded-2xl rounded-bl-sm border-2 border-purple-200 shadow-md'
                        } px-3 py-2 md:px-5 md:py-3 hover:shadow-xl transition-shadow`}
                      >
                        {/* Sender Info - Mobile Optimized */}
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-lg ${
                            msg.sender === currentUser ? 'bg-white/20 border-2 border-white/30' : 'bg-purple-100 border-2 border-purple-300'
                          }`}>
                            {msg.emoji}
                          </div>
                          <div className="flex-1">
                            <span className={`text-[10px] md:text-xs font-bold ${
                              msg.sender === currentUser ? 'text-purple-100' : 'text-purple-700'
                            }`}>
                              {msg.sender}
                            </span>
                            {msg.sender === currentUser && (
                              <span className="ml-1 md:ml-2 px-1.5 py-0.5 md:px-2 md:py-0.5 bg-white/20 rounded-full text-[8px] md:text-[10px] font-bold">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Message Text - Mobile Optimized */}
                        <p className="text-xs md:text-sm leading-relaxed break-words mb-1.5 md:mb-2">{msg.text}</p>
                        
                        {/* Timestamp - Mobile Optimized */}
                        <div className={`flex items-center justify-between gap-1 md:gap-2 text-[10px] md:text-xs ${
                          msg.sender === currentUser ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          <div className="flex items-center gap-0.5 md:gap-1">
                            <span className="text-xs md:text-sm">🕐</span>
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {msg.sender === currentUser && (
                            <span className="text-[8px] md:text-[10px]">
                              ✓✓ Sent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input - Mobile Optimized */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex gap-2 md:gap-3">
                  <input
                    type="text"
                    placeholder={`Message as ${currentUser}... 💬`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-3 py-2 md:px-6 md:py-4 border-2 border-purple-200 rounded-xl md:rounded-2xl focus:border-purple-500 focus:ring-2 md:focus:ring-4 focus:ring-purple-200 focus:outline-none text-gray-700 font-medium placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 md:px-8 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl md:rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm md:text-base"
                  >
                    <span className="flex items-center gap-1 md:gap-2">
                      <span className="hidden sm:inline">Send</span>
                      <span className="text-base md:text-xl">🚀</span>
                    </span>
                  </button>
                </div>

                {/* Message Stats - Mobile Optimized */}
                <div className="flex items-center justify-between flex-wrap gap-2 md:gap-3">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <div className="px-3 py-1.5 md:px-4 md:py-2 bg-purple-100 border-2 border-purple-200 rounded-lg md:rounded-xl">
                      <span className="text-xs md:text-sm font-bold text-purple-700 flex items-center gap-1 md:gap-2">
                        💬 {messages.length} msg{messages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 md:px-4 md:py-2 bg-green-100 border-2 border-green-200 rounded-lg md:rounded-xl">
                      <span className="text-xs md:text-sm font-bold text-green-700 flex items-center gap-1 md:gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></span>
                        Live
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-100 border-2 border-blue-200 rounded-lg md:rounded-xl">
                    <span className="text-[10px] md:text-xs font-bold text-blue-700 flex items-center gap-1">
                      🔒 Saved
                    </span>
                  </div>
                </div>

                {/* Info Note - Mobile Optimized */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  <div className="p-3 md:p-4 bg-green-50 border-2 border-green-300 rounded-lg md:rounded-xl">
                    <p className="text-xs md:text-sm text-green-800 font-bold flex items-center gap-1 md:gap-2 mb-1">
                      💬 Group Chat
                    </p>
                    <p className="text-[10px] md:text-xs text-green-700">
                      All friends see messages in real-time!
                    </p>
                  </div>
                  <div className="p-3 md:p-4 bg-purple-50 border-2 border-purple-300 rounded-lg md:rounded-xl">
                    <p className="text-xs md:text-sm text-purple-800 font-bold flex items-center gap-1 md:gap-2 mb-1">
                      🔒 Permanent Storage
                    </p>
                    <p className="text-[10px] md:text-xs text-purple-700">
                      Messages saved forever!
                    </p>
                  </div>
                </div>

                {/* Compatibility Note - Mobile Optimized */}
                <div className="p-3 md:p-4 bg-green-50 border-2 border-green-200 rounded-lg md:rounded-xl">
                  <p className="text-xs md:text-sm text-green-800 font-medium">
                    <span className="mr-1 md:mr-2">👥</span>
                    <strong>Group Chat:</strong> Messages shared between all friends!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom animation styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>

      {/* Footer - Mobile Optimized */}
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