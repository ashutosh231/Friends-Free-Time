import React, { useState, useEffect } from 'react';

const SmartNotifications = ({ currentUser, friends, timetable, currentTime }) => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        addNotification('🎉 Notifications Enabled!', 'You\'ll now get notified when friends are available', 'success');
      }
    }
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      time: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev].slice(0, 20));

    // Browser notification
    if (permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: `notif-${newNotif.id}`,
      });
    }
  };

  // Check for friend availability changes
  useEffect(() => {
    const checkFriendAvailability = () => {
      if (!timetable || !friends) return;

      const now = currentTime;
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const currentDayName = days[now.getDay() - 1];

      if (!currentDayName) return;

      friends.forEach(friend => {
        if (friend === currentUser) return;

        const schedule = timetable[friend]?.[currentDayName];
        if (!schedule) return;

        schedule.forEach(slot => {
          const [start] = slot.time.split('-');
          const [startHour, startMin] = start.split(':').map(Number);

          // Notify 5 minutes before friend becomes free
          const minutesUntilFree = (startHour * 60 + startMin) - (currentHour * 60 + currentMinute);

          if (minutesUntilFree === 5 && (slot.type === 'free' || slot.type === 'break')) {
            addNotification(
              `${friend} will be free soon! 🎉`,
              `In 5 minutes at ${slot.time}`,
              'friend-available'
            );
          }
        });
      });
    };

    const interval = setInterval(checkFriendAvailability, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentTime, timetable, friends, currentUser, permission]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'friend-available': return '👋';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '🔔';
    }
  };

  const getNotifColor = (type) => {
    switch (type) {
      case 'friend-available': return 'from-green-500 to-emerald-600';
      case 'success': return 'from-blue-500 to-indigo-600';
      case 'warning': return 'from-yellow-500 to-orange-600';
      case 'error': return 'from-red-500 to-pink-600';
      default: return 'from-purple-500 to-pink-600';
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-6 right-6 z-50 p-3 rounded-2xl font-bold shadow-2xl transition-all duration-300 hover:scale-110 border border-white/30"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(15px)',
        }}
        title="Notifications"
      >
        <div className="relative">
          <span className="text-2xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div
          className="fixed top-20 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] max-h-[70vh] overflow-hidden rounded-2xl shadow-2xl border border-white/20"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <span>🔔</span>
                Notifications
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-all"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Permission Request */}
          {permission !== 'granted' && (
            <div className="p-4 bg-yellow-50 border-b border-yellow-200">
              <p className="text-yellow-800 text-sm mb-2">
                🔕 Enable notifications to never miss when friends are free!
              </p>
              <button
                onClick={requestPermission}
                className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-all"
              >
                Enable Notifications
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[50vh]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-4xl mb-2">📭</p>
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm">You'll be notified when friends are free!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                      !notif.read ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                        }}
                      >
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-bold text-sm">
                          {notif.title}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {notif.message}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {notif.time.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={clearAll}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-all"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SmartNotifications;
