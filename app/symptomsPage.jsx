import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment'; // Import moment for date formatting
import { ThemeContext } from './ThemeContext';

const SYMPTOMS_STORAGE_KEY = '@symptoms_logs'; // Key for AsyncStorage

const SymptomsPage = () => {
  const [logs, setLogs] = useState([]); // State to store logs
  const [newLog, setNewLog] = useState(''); // State for the new log input
  const { isDarkMode } = useContext(ThemeContext); // Access dark mode from ThemeContext

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const storedLogs = await AsyncStorage.getItem(SYMPTOMS_STORAGE_KEY);
        if (storedLogs) {
          setLogs(JSON.parse(storedLogs));
        }
      } catch (error) {
        console.error('Failed to load logs:', error);
      }
    };

    loadLogs();
  }, []);

  const handleAddLog = async () => {
    if (newLog.trim()) {
      const newLogs = [
        ...logs,
        {
          id: Date.now().toString(),
          text: newLog,
          date: new Date().toISOString(), // Store the current date as ISO string
        }
      ];
      setLogs(newLogs);
      setNewLog('');
      try {
        await AsyncStorage.setItem(SYMPTOMS_STORAGE_KEY, JSON.stringify(newLogs));
      } catch (error) {
        console.error('Failed to save log:', error);
      }
    } else {
      Alert.alert('Error', 'Please enter a log');
    }
  };

  const handleDeleteLog = async (id) => {
    const updatedLogs = logs.filter(log => log.id !== id);
    setLogs(updatedLogs);
    try {
      await AsyncStorage.setItem(SYMPTOMS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to delete log:', error);
    }
  };

  const renderLog = ({ item }) => (
    <View style={[styles.logItem, { borderBottomColor: isDarkMode ? '#333' : '#ddd' }]}>
      <View style={styles.logContent}>
        <Text style={[styles.logText, { color: isDarkMode ? '#FFF' : '#000' }]}>{item.text}</Text>
        <Text style={[styles.logDate, { color: isDarkMode ? '#BBB' : 'gray' }]}>
          {moment(item.date).format('MMM D, YYYY')}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteLog(item.id)}>
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : 'white' }]}>
      <TextInput
        style={[styles.input, { borderColor: isDarkMode ? '#333' : '#ccc', color: isDarkMode ? '#FFF' : '#000' }]}
        placeholder="How do you feel today?"
        placeholderTextColor={isDarkMode ? '#888' : '#888'}
        value={newLog}
        onChangeText={setNewLog}
        multiline
        numberOfLines={4}
      />
      <Button title="Add Log" onPress={handleAddLog} color={isDarkMode ? '#6200EE' : '#007bff'} />
      <FlatList
        data={logs}
        renderItem={renderLog}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    textAlignVertical: 'top', // Ensure text starts from the top of the input
  },
  list: {
    marginTop: 16,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  logContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logText: {
    fontSize: 16,
    flex: 1,
  },
  logDate: {
    fontSize: 12,
    marginLeft: 10,
    marginRight: 5,
  },
});

export default SymptomsPage;