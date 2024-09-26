import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Switch, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from './ThemeContext';

const SettingsScreen = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const darkMode = await AsyncStorage.getItem('darkMode');

        if (darkMode !== null) toggleDarkMode(darkMode === 'true');
      } catch (error) {
        console.log('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('darkMode', isDarkMode.toString());

      Alert.alert('Settings Saved', 'Your settings have been saved successfully.');
    } catch (error) {
      console.log('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
   

      <View style={[styles.settingItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F0F0F0' }]}>
        <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>

      <Button title="Save Settings" onPress={saveSettings} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default SettingsScreen;