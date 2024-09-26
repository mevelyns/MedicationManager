import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { MaterialIcons } from '@expo/vector-icons';
import { MedicationsContext } from './MedicationsContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeContext } from './ThemeContext';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';

const daysOfWeek = ['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AddMedicationScreen = () => {
  const router = useRouter();
  const { medication: medicationParam, index: indexParam } = useLocalSearchParams();
  const medicationToEdit = medicationParam ? JSON.parse(medicationParam) : null;
  const indexToEdit = indexParam !== undefined ? parseInt(indexParam, 10) : null;

  const [name, setName] = useState('');
  const [times, setTimes] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [specificDates, setSpecificDates] = useState([]);
  const [scriptDate, setScriptDate] = useState(null);
  const [scriptTime, setScriptTime] = useState(null);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isDatePickerVisibleForSpecificDate, setDatePickerVisibilityForSpecificDate] = useState(false);
  const [isScriptDatePickerVisible, setScriptDatePickerVisibility] = useState(false);
  const [isScriptTimePickerVisible, setScriptTimePickerVisibility] = useState(false);
  const [showScriptOptions, setShowScriptOptions] = useState(false);

  const { handleAddMedication, handleUpdateMedication } = useContext(MedicationsContext);
  const { themeColor, isDarkMode } = useContext(ThemeContext);

  // Using useRef to track the initial render
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current && medicationToEdit) {
      setName(medicationToEdit.name);
      setTimes(medicationToEdit.times);
  
      if (medicationToEdit.frequency) {
        if (medicationToEdit.frequency === 'Everyday') {
          setSelectedDays(['Everyday']);
        } else {
          setSelectedDays(medicationToEdit.frequency.split(', '));
        }
      }
  
      setSpecificDates(medicationToEdit.specificDates || []);
      setScriptDate(medicationToEdit.scriptDate || null);
      setScriptTime(medicationToEdit.scriptTime || null);
      isInitialRender.current = false; // After initial setup, set it to false
    }
  }, [medicationToEdit]);

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const showDatePickerForSpecificDate = () => setDatePickerVisibilityForSpecificDate(true);
  const hideDatePickerForSpecificDate = () => setDatePickerVisibilityForSpecificDate(false);

  const showScriptDatePicker = () => setScriptDatePickerVisibility(true);
  const hideScriptDatePicker = () => setScriptDatePickerVisibility(false);

  const showScriptTimePicker = () => setScriptTimePickerVisibility(true);
  const hideScriptTimePicker = () => setScriptTimePickerVisibility(false);

  const handleConfirmTime = (time) => {
    const formattedTime = moment(time).format('HH:mm');

    // Check for duplicates
    if (times.includes(formattedTime)) {
      Alert.alert('Duplicate Time', 'This time has already been added.');
    } else {
      setTimes((prevTimes) => [...prevTimes, formattedTime]);
    }

    hideTimePicker();
  };

  const handleConfirmForSpecificDate = (date) => {
    const isoDate = date.date ? date.date.toISOString() : date.toISOString();
    const formattedDate = moment(isoDate).format('YYYY-MM-DD');
    console.log('Formatted date:', formattedDate);
  
    if (moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
      setSpecificDates((prevDates) => [...prevDates, formattedDate]);
    } else {
      console.warn('Invalid date format');
    }
  
    hideDatePickerForSpecificDate();
  };

  const handleConfirmScriptDate = (date) => {
    const isoDate = date.date ? date.date.toISOString() : date.toISOString();
    const formattedDate = moment(isoDate).format('YYYY-MM-DD');
    
    if (moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
      setScriptDate(formattedDate);
    } else {
      console.warn('Invalid date format');
    }
  
    hideScriptDatePicker();
  };

  const handleConfirmScriptTime = (time) => {
    const formattedTime = moment(time).format('HH:mm');
    setScriptTime(formattedTime);
    hideScriptTimePicker();
  };

  const handleDaySelection = (day) => {
    if (day === 'Everyday') {
      setSelectedDays(['Everyday']);
    } else {
      if (selectedDays.includes('Everyday')) {
        setSelectedDays([day]);
      } else if (selectedDays.includes(day)) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      } else {
        setSelectedDays([...selectedDays, day]);
      }
    }
  };

  const handleSave = () => {
    if (name.trim() === '' || times.length === 0) {
      Alert.alert('Error', 'Please enter both medication name and time(s).');
      return;
    }

    if (new Set(times).size !== times.length) {
      Alert.alert('Error', 'You have entered duplicate times.');
      return;
    }

    if (selectedDays.length > 0 && specificDates.length > 0) {
      Alert.alert('Error', 'You cannot select both frequency and specific dates. Please choose one.');
      return;
    }

    if (specificDates.length === 0 && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select either specific dates or a frequency.');
      return;
    }

    const frequency = selectedDays.length > 0 ? selectedDays.join(', ') : 'Everyday';
    const medication = { 
      name: name.trim(), 
      times, 
      frequency: selectedDays.length > 0 ? frequency : null, 
      specificDates, 
      scriptDate,
      scriptTime
    };

    if (medicationToEdit && indexToEdit !== null) {
      handleUpdateMedication(indexToEdit, medication);
      Alert.alert('Success', 'Medication updated!');
    } else {
      handleAddMedication(medication);
      Alert.alert('Success', 'Medication added!');
    }

    setName('');
    setTimes([]);
    setSelectedDays([]);
    setSpecificDates([]);
    setScriptDate(null);
    setScriptTime(null);
    router.back();
  };

  return (
    <ScrollView
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps='handled'
      contentInsetAdjustmentBehavior='always'
      contentContainerStyle={[styles.container, { backgroundColor: themeColor }]}
    >
      <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }, { marginTop: -10 }, ]}>Medication Name and Dosage</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? '#333' : '#FFF', color: isDarkMode ? '#FFF' : '#000' }]}
        value={name}
        onChangeText={setName}
        placeholder="Enter medication name and dosage"
        placeholderTextColor={isDarkMode ? '#CCC' : '#999'}
      />
      
      <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }, { marginTop: -10 },]}>Times</Text>
      {times.map((time, index) => (
        <View key={index} style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: isDarkMode ? '#FFF' : '#000' }]}>{time}</Text>
          <TouchableOpacity onPress={() => setTimes(times.filter((_, i) => i !== index))}>
            <MaterialIcons name="delete" size={20} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      <Button title="Add Time" onPress={showTimePicker} />
      <TimePickerModal
        locale="en"
        visible={isTimePickerVisible}
        onDismiss={hideTimePicker}
        onConfirm={handleConfirmTime}
        use24HourClock={true}
      />

      <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }]}>Specific Dates</Text>
      {specificDates.map((date, index) => (
        <View key={index} style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: isDarkMode ? '#FFF' : '#000' }]}>{moment(date).format('YYYY-MM-DD')}</Text>
          <TouchableOpacity onPress={() => setSpecificDates(specificDates.filter((_, i) => i !== index))}>
            <MaterialIcons name="delete" size={20} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      <Button title="Add Specific Date" onPress={showDatePickerForSpecificDate} />
      <DatePickerModal
        locale="en"
        mode="single"
        visible={isDatePickerVisibleForSpecificDate}
        onDismiss={hideDatePickerForSpecificDate}
        date={new Date()}
        onConfirm={handleConfirmForSpecificDate}
        presentationStyle="pageSheet"
        startYear={2024}
        endYear={2035}
      />

      <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }]}>Frequency</Text>
      <View style={styles.daysContainer}>
        {daysOfWeek.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              selectedDays.includes(day) && styles.dayButtonSelected,
            ]}
            onPress={() => handleDaySelection(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDays.includes(day) && styles.dayButtonTextSelected,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Script Button */}
      <View style={styles.scrpBtn}>
        <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }, { marginTop: -10 },]}>Script Reminder</Text>
        <Button title={showScriptOptions ? 'Hide Script Options' : 'Add Script Reminder'} onPress={() => setShowScriptOptions(!showScriptOptions)} />
      </View>

      {showScriptOptions && (
        <>
          <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }, { marginTop: -10 },]}>Script Reminder Date</Text>
          {scriptDate && (
            <View style={styles.dateContainer}>
              <Text style={[styles.dateText, { color: isDarkMode ? '#FFF' : '#000' }]}>{moment(scriptDate).format('YYYY-MM-DD')}</Text>
              <TouchableOpacity onPress={() => setScriptDate(null)}>
                <MaterialIcons name="delete" size={20} color="red" />
              </TouchableOpacity>
            </View>
          )}
          <Button title="Add Script Reminder Date" onPress={showScriptDatePicker} />
          <DatePickerModal
            locale="en"
            mode="single"
            visible={isScriptDatePickerVisible}
            onDismiss={hideScriptDatePicker}
            date={scriptDate ? new Date(scriptDate) : new Date()}
            onConfirm={handleConfirmScriptDate}
          />
          {/* Script Reminder Time Section */}
          

          <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }]}>Script Reminder Time</Text>
          {scriptTime && (
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: isDarkMode ? '#FFF' : '#000' }]}>{scriptTime}</Text>
              <TouchableOpacity onPress={() => setScriptTime(null)}>
                <MaterialIcons name="delete" size={20} color="red" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.scrpBtn}>
          <Button title="Add Script Reminder Time" onPress={showScriptTimePicker} /></View>
          <TimePickerModal
            locale="en"
            visible={isScriptTimePickerVisible}
            onDismiss={hideScriptTimePicker}
            onConfirm={handleConfirmScriptTime}
            use24HourClock={true}
          />
        </>
      )}

      <Button title={medicationToEdit ? 'Update Medication' : 'Add Medication'} onPress={handleSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 5,
    
  },
  input: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    padding: 10,
    backgroundColor: '#EEE',
    margin: 5,
    borderRadius: 5,
  },
  dayButtonSelected: {
    backgroundColor: '#1E90FF',
  },
  dayButtonText: {
    color: '#000',
  },
  dayButtonTextSelected: {
    color: '#FFF',
  },
  scrpBtn: {
    marginBottom: 20,
  },
});

export default AddMedicationScreen;