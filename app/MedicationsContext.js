import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const MedicationsContext = createContext();

export const MedicationsProvider = ({ children }) => {
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    const loadMedications = async () => {
      try {
        const storedMedications = await AsyncStorage.getItem('medications');
        if (storedMedications) {
          setMedications(JSON.parse(storedMedications));
        }
      } catch (error) {
        console.error('Failed to load medications from AsyncStorage', error);
      }
    };

    loadMedications();
  }, []);

  const saveMedications = async (medications) => {
    try {
      await AsyncStorage.setItem('medications', JSON.stringify(medications));
    } catch (error) {
      console.error('Failed to save medications to AsyncStorage', error);
    }
  };

  const getNotificationSettings = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    return finalStatus;
  };

  const scheduleNotifications = async (medication) => {
    try {
      const notificationStatus = await getNotificationSettings();
  
      if (!medication.times || !Array.isArray(medication.times)) {
        console.error('Invalid medication times:', medication.times);
        return;
      }
  
      for (const time of medication.times) {
        const [hour, minute] = time.split(':').map(Number);
  
        if (isNaN(hour) || isNaN(minute)) {
          console.error('Invalid time format:', time);
          continue;
        }
  
        const notificationContent = {
          title: 'Reminder',
          body: `Remember to take: ${medication.name}`,
          sound: null,
          vibrate: null,
        };
  
        if (medication.specificDates && Array.isArray(medication.specificDates) && medication.specificDates.length > 0) {
          for (const date of medication.specificDates) {
            const [year, month, day] = date.split('-').map(Number);
  
            if (!year || !month || !day) {
              console.error('Invalid date format:', date);
              continue;
            }
  
            const now = new Date();
            const targetDate = new Date(year, month - 1, day, hour, minute);
            const delay = targetDate - now;
  
            if (delay > 0) {
              await Notifications.scheduleNotificationAsync({
                content: notificationContent,
                trigger: {
                  seconds: Math.floor(delay / 1000),
                },
              });
              console.log(`Scheduled notification for ${medication.name} at ${hour}:${minute} on ${date}`);
            } else {
              console.error('Target date is in the past:', date);
            }
  
            // Add a 5-second delay before scheduling the next notification
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        } else if (medication.frequency && typeof medication.frequency === 'string') {
          if (medication.frequency.includes('Everyday')) {
            await Notifications.scheduleNotificationAsync({
              content: notificationContent,
              trigger: {
                hour,
                minute,
                repeats: true,
              },
            });
            console.log(`Scheduled daily notification for ${medication.name} at ${hour}:${minute}`);
          } else {
            const daysOfWeek = {
              Sunday: 1,
              Monday: 2,
              Tuesday: 3,
              Wednesday: 4,
              Thursday: 5,
              Friday: 6,
              Saturday: 7,
            };
  
            for (const day of medication.frequency.split(', ')) {
              if (!daysOfWeek[day]) {
                console.error('Invalid day of the week:', day);
                continue;
              }
  
              await Notifications.scheduleNotificationAsync({
                content: notificationContent,
                trigger: {
                  hour,
                  minute,
                  weekday: daysOfWeek[day],
                  repeats: true,
                },
              });
              console.log(`Scheduled weekly notification for ${medication.name} at ${hour}:${minute} on ${day}`);
  
              // Add a 5-second delay before scheduling the next notification
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
        } else {
          console.error('Invalid frequency format:', medication.frequency);
        }
      }
  
      // Schedule a notification for the script reminder date and time
      if (medication.scriptDate && medication.scriptTime) {
        const [scriptHour, scriptMinute] = medication.scriptTime.split(':').map(Number);
        const [year, month, day] = medication.scriptDate.split('-').map(Number);
  
        if (!isNaN(scriptHour) && !isNaN(scriptMinute) && year && month && day) {
          const now = new Date();
          const scriptDateTime = new Date(year, month - 1, day, scriptHour, scriptMinute);
  
          const delay = scriptDateTime - now;
  
          if (delay > 0) {
            const scriptNotificationContent = {
              title: 'Script Renewal Reminder',
              body: `Script renewal for ${medication.name}`,
              sound: null,
              vibrate: null,
            };
  
            await Notifications.scheduleNotificationAsync({
              content: scriptNotificationContent,
              trigger: {
                seconds: Math.floor(delay / 1000),
              },
            });
            console.log(`Scheduled script renewal reminder for ${medication.name} on ${medication.scriptDate} at ${medication.scriptTime}`);
          } else {
            console.error('Script reminder date and time are in the past:', medication.scriptDate, medication.scriptTime);
          }
  
          // Add a 5-second delay before scheduling the next notification (if any)
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          console.error('Invalid script time format:', medication.scriptTime);
        }
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const cancelScheduledNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const handleAddMedication = async (medication) => {
    const updatedMedications = [...medications, medication];
    setMedications(updatedMedications);
    await saveMedications(updatedMedications);
    await cancelScheduledNotifications();
    for (const med of updatedMedications) {
      await scheduleNotifications(med);
    }
  };

  const handleUpdateMedication = async (index, updatedMedication) => {
    const updatedMedications = medications.map((med, i) => (i === index ? updatedMedication : med));
    setMedications(updatedMedications);
    await saveMedications(updatedMedications);
    await cancelScheduledNotifications();
    for (const med of updatedMedications) {
      await scheduleNotifications(med);
    }
  };

  const handleDeleteMedication = async (index) => {
    const updatedMedications = medications.filter((_, i) => i !== index);
    setMedications(updatedMedications);
    await saveMedications(updatedMedications);
    await cancelScheduledNotifications();
    for (const med of updatedMedications) {
      await scheduleNotifications(med);
    }
  };

  return (
    <MedicationsContext.Provider value={{
      medications,
      handleAddMedication,
      handleUpdateMedication,
      handleDeleteMedication
    }}>
      {children}
    </MedicationsContext.Provider>
  );
};