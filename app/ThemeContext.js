import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState('#FFF');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const darkMode = await AsyncStorage.getItem('darkMode');
        const colorScheme = await AsyncStorage.getItem('colorScheme');
        
        if (darkMode !== null) setIsDarkMode(darkMode === 'true');
        if (colorScheme) setThemeColor(COLOR_OPTIONS[colorScheme] || '#FFF'); // Default to white if color is not found
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    };

    loadTheme();
  }, []);

  const toggleDarkMode = (isEnabled) => {
    setIsDarkMode(isEnabled);
    AsyncStorage.setItem('darkMode', isEnabled.toString());
    setThemeColor(isEnabled ? '#000' : '#FFF'); // Assuming default color is white
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

const COLOR_OPTIONS = {
  'White': '#FFF',
  'Light Blue': '#ADD8E6',
  'Pink': '#FFC0CB',
  'Red': '#FF6347',
  'Green': '#90EE90',
  'Light Purple': '#D8BFD8',
};