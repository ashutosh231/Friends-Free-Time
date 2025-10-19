// Theme Configuration with actual CSS values for inline styles
export const themes = {
  light: {
    name: 'Light Mode',
    icon: '☀️',
    background: 'linear-gradient(to bottom right, #fdf2f8, #faf5ff, #eef2ff)',
    cardBackground: 'rgba(255, 255, 255, 0.9)',
    primaryText: '#1f2937',
    secondaryText: '#4b5563',
    borderColor: 'rgba(192, 132, 252, 0.3)',
    glassEffect: 'blur(10px)',
  },
  dark: {
    name: 'Dark Mode',
    icon: '🌙',
    background: 'linear-gradient(to bottom right, #111827, #581c87, #312e81)',
    cardBackground: 'rgba(31, 41, 55, 0.8)',
    primaryText: '#ffffff',
    secondaryText: '#d1d5db',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    glassEffect: 'blur(15px)',
  },
  sunset: {
    name: 'Sunset',
    icon: '🌅',
    background: 'linear-gradient(to bottom right, #fb923c, #ec4899, #9333ea)',
    cardBackground: 'rgba(255, 255, 255, 0.15)',
    primaryText: '#ffffff',
    secondaryText: '#fed7aa',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    glassEffect: 'blur(15px)',
  },
  ocean: {
    name: 'Ocean',
    icon: '🌊',
    background: 'linear-gradient(to bottom right, #60a5fa, #06b6d4, #0d9488)',
    cardBackground: 'rgba(255, 255, 255, 0.15)',
    primaryText: '#ffffff',
    secondaryText: '#dbeafe',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    glassEffect: 'blur(15px)',
  },
  forest: {
    name: 'Forest',
    icon: '🌲',
    background: 'linear-gradient(to bottom right, #16a34a, #059669, #115e59)',
    cardBg: 'bg-white/10',
    cardBackground: 'rgba(255, 255, 255, 0.15)',
    primaryText: '#ffffff',
    secondaryText: '#d1fae5',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    glassEffect: 'blur(15px)',
  },
};

export const getTheme = (themeName) => {
  return themes[themeName] || themes.light;
};

export const saveTheme = (themeName) => {
  localStorage.setItem('selectedTheme', themeName);
};

export const loadTheme = () => {
  return localStorage.getItem('selectedTheme') || 'light';
};
