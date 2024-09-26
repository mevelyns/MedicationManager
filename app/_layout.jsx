import React, { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Stack } from 'expo-router';
import { MedicationsProvider } from './MedicationsContext';
import { ThemeProvider } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds from 'react-native-google-mobile-ads';

const Layout = () => {

  useEffect(() => {
    const setupNotificationChannel = async () => {
      if (Device.isDevice) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          enableVibration: true,
          sound: 'default',
          bypassDnd: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }
    };

    const registerForPushNotificationsAsync = async () => {
      if (Device.isDevice) {
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
      } else {
        alert('Must use physical device for push notifications');
      }
    };

    const checkAndRequestBatteryOptimization = async () => {
      const hasSeenPrompt = await AsyncStorage.getItem('hasSeenBatteryOptimizationPrompt');
      if (Platform.OS === 'android' && !hasSeenPrompt) {
        Alert.alert(
          "Unrestricted Battery Access",
          "To ensure the app functions correctly, it needs unrestricted battery access. Please allow this in the settings.",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings();
              }
            }
          ]
        );
        // Set flag to indicate that the prompt has been shown
        await AsyncStorage.setItem('hasSeenBatteryOptimizationPrompt', 'true');
      }
    };

    const initializeApp = async () => {
      await setupNotificationChannel();
      await registerForPushNotificationsAsync();
      await checkAndRequestBatteryOptimization();

      // Initialize Google Mobile Ads SDK
      mobileAds()
        .initialize()
        .then(adapterStatuses => {
          console.log('Google Mobile Ads SDK initialized:', adapterStatuses);
          // Initialization complete!
        })
        .catch(error => {
          console.error('Google Mobile Ads SDK initialization failed:', error);
        });
    };

    initializeApp();
  }, []);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });

  return (
    <MedicationsProvider>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: 'bold',
            },
            headerStyle: {
              backgroundColor: '#2a2a2a',
            },
            headerTintColor: '#FFF',
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Medication Manager' }} />
          <Stack.Screen name="AddMedicationScreen" options={{ title: 'Add Medication' }} />
          <Stack.Screen name="SettingsScreen" options={{ title: 'Settings' }} />
          <Stack.Screen name="symptomsPage" options={{ title: 'Symptom Manager' }} />
        </Stack>
      </ThemeProvider>
    </MedicationsProvider>
  );
};

export default Layout;