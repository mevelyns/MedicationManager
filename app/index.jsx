import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MedicationsContext } from './MedicationsContext';
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { registerTranslation } from 'react-native-paper-dates';
import { AppOpenAd, InterstitialAd, RewardedAd, BannerAd, TestIds, BannerAdSize } from 'react-native-google-mobile-ads';

import { ThemeContext } from './ThemeContext';


const addUnitId = "ca-app-pub-3940256099942544/9214589741";

registerTranslation('en', {
  save: 'Save',
  selectSingle: 'Select Date',
  selectMultiple: 'Select Dates',
  selectRange: 'Select Range',
  notAccordingToDateFormat: (inputFormat) => `Date format must be ${inputFormat}`,
  mustBeHigherThan: (date) => `Must be later than ${date}`,
  mustBeLowerThan: (date) => `Must be earlier than ${date}`,
  mustBeBetween: (startDate, endDate) => `Must be between ${startDate} and ${endDate}`,
  dateIsDisabled: 'Date is disabled',
  previous: 'Previous',
  next: 'Next',
  typeInDate: 'Type in date',
  pickDateFromCalendar: 'Pick date from calendar',
  close: 'Close',
  hour: 'Hour',
  minute: 'Minute',
  typeInTime: 'Type in time',
  pickTimeFromClock: 'Pick time from clock',
})

const HomeScreen = () => {
  const { medications, handleDeleteMedication } = useContext(MedicationsContext);
  const router = useRouter();
  const { themeColor, isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const checkScheduledNotifications = async () => {
      try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log('Scheduled Notifications:', scheduledNotifications);
      } catch (error) {
        console.error('Failed to fetch scheduled notifications:', error);
      }
    };

    checkScheduledNotifications();
  }, []); // Empty array ensures it only runs once after the initial render

const handleEdit = (medication, index) => {
  router.push({
    pathname: '/AddMedicationScreen',
    params: { medication: JSON.stringify(medication), index }
  });
};

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : 'white' }]}>
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#333' : '#ccc' }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>Medications</Text>
        <TouchableOpacity onPress={() => router.push('SettingsScreen')}>
          <MaterialIcons name="settings" size={24} color={isDarkMode ? '#FFF' : '#000'} marginTop={7} />
        </TouchableOpacity>
      </View>
      <View></View>
      <ScrollView contentContainerStyle={styles.list}>
        {medications.map((medication, index) => {
          // Ensure that specificDates and frequency are defined
          const specificDates = medication.specificDates || [];
          const frequency = medication.frequency || '';
          
          return (
            <TouchableOpacity key={index} onPress={() => handleEdit(medication, index)}>
              <View style={[styles.itemContainer, { borderBottomColor: isDarkMode ? '#333' : '#ccc' }]}>
                <Text style={[styles.medicationName, { color: isDarkMode ? '#FFF' : '#000' }]}>{medication.name}</Text>
                <View style={styles.detailsContainer}>
                  {specificDates.length > 0 ? (
                    <Text style={[styles.detailText, { color: isDarkMode ? '#BBB' : '#555' }]}>
                      Dates: {specificDates.join(', ')}
                    </Text>
                  ) : (
                    <Text style={[styles.detailText, { color: isDarkMode ? '#BBB' : '#555' }]}>
                      Frequency: {frequency}
                    </Text>
                  )}
                  <Text style={[styles.detailText, { color: isDarkMode ? '#BBB' : '#555' }]}>
                    Times: {medication.times.join(', ')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteMedication(index)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={styles.view2}></View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.symptomsButton, { backgroundColor: isDarkMode ? '#6200EE' : '#007bff' }]}
        onPress={() => router.push('symptomsPage')}
      >
        <MaterialIcons name="book" size={24} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: isDarkMode ? '#6200EE' : '#007bff' }]}
        onPress={() => router.push('AddMedicationScreen')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <BannerAd
        size={BannerAdSize.FULL_BANNER}
        unitId={addUnitId}
        style={styles.bannerAd}
        >
      </BannerAd>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    marginLeft: 6,
  },
  list: {
    flexGrow: 1,
    
    
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    marginBottom: 6,
    marginLeft: 6,
  },
  medicationName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailsContainer: {
    marginTop: 5,
  },
  detailText: {
    fontSize: 14,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    bottom: 60,
  },
  addButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
  },
  symptomsButton: {
    bottom: 70,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 70,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  bannerAd: {
    marginBottom: 0,
    alignSelf: 'center',
    
  },
  view2: {
    marginTop: 70,
  }
});

export default HomeScreen;