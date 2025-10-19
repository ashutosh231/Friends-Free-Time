import React from 'react';
import { themes, saveTheme } from './themes';

const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
  const [showThemes, setShowThemes] = React.useState(false);

  const handleThemeChange = (themeName) => {
    saveTheme(themeName); // Save to localStorage
    onThemeChange(themeName); // Update parent state
    setShowThemes(false);
  };

  return (
    <div className="fixed top-6 left-6 z-50">
      {/* Theme Button */}
      <button
        onClick={() => setShowThemes(!showThemes)}
        className="px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-lg text-sm md:text-base border border-white/30 hover:scale-105 transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          color: 'white',
        }}
        title="Change Theme"
      >
        <span className="mr-2">{themes[currentTheme].icon}</span>
        Theme
      </button>

      {/* Theme Dropdown */}
      {showThemes && (
        <div 
          className="absolute top-full left-0 mt-2 p-3 rounded-2xl shadow-2xl border border-white/30 min-w-[200px]"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="text-gray-800 font-bold text-sm mb-3 px-2">Choose Theme:</p>
          <div className="space-y-2">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  currentTheme === key
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white/50 text-gray-800 hover:bg-purple-100'
                }`}
              >
                <span className="text-2xl">{theme.icon}</span>
                <span className="text-sm">{theme.name}</span>
                {currentTheme === key && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
