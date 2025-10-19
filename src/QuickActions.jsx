import React, { useState } from 'react';

const QuickActions = ({ currentUser, channel, friendInfo }) => {
  const [sending, setSending] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const quickActions = [
    { id: 'coffee', emoji: '☕', label: 'Coffee?', message: 'Hey! Want to grab coffee? ☕', color: 'from-amber-500 to-orange-600' },
    { id: 'study', emoji: '📚', label: 'Study?', message: 'Let\'s study together! 📚', color: 'from-blue-500 to-indigo-600' },
    { id: 'lunch', emoji: '🍕', label: 'Lunch?', message: 'Hungry? Let\'s grab lunch! 🍕', color: 'from-green-500 to-emerald-600' },
    { id: 'hangout', emoji: '🎮', label: 'Hang out?', message: 'Free now? Let\'s hang out! 🎮', color: 'from-purple-500 to-pink-600' },
  ];

  const sendQuickAction = async (action) => {
    if (!channel || sending) return;

    setSending(true);
    setLastAction(action.id);

    try {
      await channel.sendMessage({
        text: `${action.message}`,
        user_id: currentUser,
        customType: 'quick-action',
        metadata: {
          actionType: action.id,
          timestamp: new Date().toISOString(),
        }
      });

      // Show success feedback
      setTimeout(() => {
        setLastAction(null);
      }, 2000);
    } catch (error) {
      console.error('Error sending quick action:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-4">
      <div 
        className="rounded-2xl p-4 border border-white/20 shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚡</span>
          <h3 className="text-white font-bold text-lg">Quick Invites</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => sendQuickAction(action)}
              disabled={sending && lastAction === action.id}
              className={`relative px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                sending && lastAction === action.id ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                '--tw-gradient-from': action.color.split(' ')[0].replace('from-', ''),
                '--tw-gradient-to': action.color.split(' ')[1].replace('to-', ''),
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">{action.emoji}</span>
                <span className="text-sm md:text-base">{action.label}</span>
              </div>
              
              {lastAction === action.id && !sending && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-xl">
                  <span className="text-2xl">✓</span>
                </div>
              )}
              
              {sending && lastAction === action.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        <p className="text-white/70 text-xs mt-3 text-center">
          💡 One-click to send an invite to your friend!
        </p>
      </div>
    </div>
  );
};

export default QuickActions;
